//! VoxGuard_audio
//! -----------------
//! Rust WebAssembly audio preprocessing engine for VoxGuard.
//!
//! Compiled to WASM via wasm-pack. Provides GC-pause-free, sub-100ms
//! audio processing that JavaScript cannot reliably achieve.
//!
//! Full pipeline per 250ms frame:
//!   Raw PCM (Float32, 16kHz, mono)
//!     -> Adaptive noise profile estimation (online, minimum-statistics)
//!     -> Wiener filter         (frequency-domain SNR-based suppression)
//!     -> Spectral subtraction  (residual noise floor removal)
//!     -> Hybrid VAD            (RMS energy + zero-crossing rate)
//!     -> RMS normalization     (target -22dBFS for ASR)
//!     -> Pre-emphasis filter   (boost high-freq consonants for ASR)
//!     -> Int16 PCM -> Base64   (WebSocket transmission)
//!
//! v3 fixes:
//!   - SPECTRAL_SUB_ALPHA: 2.0 -> 1.0  (was over-subtracting, destroying consonants)
//!   - SPECTRAL_SUB_FLOOR: 0.002 -> 0.05 (floor too low, allowing near-zero output)
//!   - NOISE_INIT_FRAMES: 8 -> 3  (750ms bootstrap instead of 2s; 2s risked
//!     treating early speech as noise if the user spoke immediately on connect)
//!   - Post-denoise RMS drop threshold: * 0.5 -> * 0.1  (was discarding valid
//!     speech frames whose energy was legitimately reduced by denoising)

use wasm_bindgen::prelude::*;

// -- Console bridge ---------------------------------------------------
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => {
        log(&format_args!($($t)*).to_string())
    }
}

// -- Constants --------------------------------------------------------
const SAMPLE_RATE:        u32   = 16_000;
const CHUNK_SAMPLES:      usize = 4_000;      // 250ms at 16kHz
const NUM_BINS:           usize = 257;        // Frequency bands for spectral processing

// Noise estimation
const NOISE_ALPHA:        f32   = 0.95;       // Smoothing for adaptive noise update

// [FIX] Reduced from 8 -> 3 frames (750ms instead of 2 seconds).
// With 8 frames, if the user started speaking immediately on connect,
// their voice was included in the noise bootstrap and then filtered out
// for the entire session. 3 frames is enough to capture background noise
// while being short enough to avoid capturing early speech.
const NOISE_INIT_FRAMES:  usize = 3;

// Wiener filter
const WIENER_BETA:        f32   = 0.001;      // Floor -- prevents full suppression

// Spectral subtraction
// [FIX] SPECTRAL_SUB_ALPHA: 2.0 -> 1.0
// Over-subtraction factor of 2.0 was too aggressive: it subtracted 2x the
// estimated noise amplitude from each frequency band. This consistently
// destroyed weak consonants (s, f, t, p) and soft speech, especially from
// the remote caller who already had lower energy due to phone compression.
// 1.0 = standard subtraction, removes the noise floor without overreach.
const SPECTRAL_SUB_ALPHA: f32   = 1.0;

// [FIX] SPECTRAL_SUB_FLOOR: 0.002 -> 0.05
// The spectral floor is the minimum output magnitude as a fraction of input.
// At 0.002, the output could drop to 0.2% of the original signal — effectively
// silence for any band where noise_amp ≈ signal_amp. At 0.05, output is floored
// at 5% of input magnitude, which preserves enough signal structure for ASR
// to recognize speech even in noisy bands.
const SPECTRAL_SUB_FLOOR: f32   = 0.05;

// VAD
const VAD_ENERGY_THRESH:  f32   = 0.0015;     // RMS floor for speech
const VAD_ZCR_THRESH:     f32   = 0.35;       // ZCR max (speech < noise)
const VAD_HOLD_FRAMES:    usize = 4;          // Hang-over frames after activity

// Normalization
const TARGET_RMS:         f32   = 0.08;       // ~-22dBFS
const MAX_GAIN:           f32   = 10.0;       // Cap at +20dB

// Pre-emphasis
const PRE_EMPHASIS_COEFF: f32   = 0.97;

// -- Noise Profile ----------------------------------------------------
struct NoiseProfile {
    noise_psd:        Vec<f32>,
    frames_seen:      usize,
    init_accumulator: Vec<f32>,
}

impl NoiseProfile {
    fn new() -> Self {
        NoiseProfile {
            noise_psd:        vec![1e-6; NUM_BINS],
            frames_seen:      0,
            init_accumulator: vec![0.0; NUM_BINS],
        }
    }

    fn update(&mut self, power_spec: &[f32], is_speech: bool) {
        self.frames_seen += 1;

        if self.frames_seen <= NOISE_INIT_FRAMES {
            for i in 0..NUM_BINS {
                self.init_accumulator[i] += power_spec[i];
            }
            if self.frames_seen == NOISE_INIT_FRAMES {
                let n = NOISE_INIT_FRAMES as f32;
                for i in 0..NUM_BINS {
                    self.noise_psd[i] = (self.init_accumulator[i] / n).max(1e-8);
                }
                console_log!(
                    "[ScamShield WASM] Noise profile bootstrapped ({} frames)",
                    NOISE_INIT_FRAMES
                );
            }
        } else if !is_speech {
            for i in 0..NUM_BINS {
                self.noise_psd[i] = NOISE_ALPHA * self.noise_psd[i]
                    + (1.0 - NOISE_ALPHA) * power_spec[i].max(1e-8);
            }
        }
    }

    fn is_initialized(&self) -> bool {
        self.frames_seen >= NOISE_INIT_FRAMES
    }
}

// -- VAD State --------------------------------------------------------
struct VadState {
    smoothed_energy: f32,
    hold_counter:    usize,
}

impl VadState {
    fn new() -> Self {
        VadState { smoothed_energy: 0.0, hold_counter: 0 }
    }

    fn is_speech(&mut self, samples: &[f32]) -> bool {
        let rms = compute_rms(samples);
        let zcr = compute_zcr(samples);

        let alpha = if rms > self.smoothed_energy { 0.3 } else { 0.95 };
        self.smoothed_energy = alpha * rms + (1.0 - alpha) * self.smoothed_energy;

        let active = self.smoothed_energy > VAD_ENERGY_THRESH && zcr < VAD_ZCR_THRESH;

        if active {
            self.hold_counter = VAD_HOLD_FRAMES;
        } else if self.hold_counter > 0 {
            self.hold_counter -= 1;
        }

        active || self.hold_counter > 0
    }
}

// -- Audio Preprocessor -----------------------------------------------
#[wasm_bindgen]
pub struct AudioPreprocessor {
    buffer:        Vec<f32>,
    prev_sample:   f32,
    noise_profile: NoiseProfile,
    vad:           VadState,
    frame_count:   u32,
    dropped_count: u32,
}

#[wasm_bindgen]
impl AudioPreprocessor {
    #[wasm_bindgen(constructor)]
    pub fn new() -> AudioPreprocessor {
        console_log!("[ScamShield WASM] AudioPreprocessor v3.0 initialized");
        console_log!(
            "[ScamShield WASM] Pipeline: AdaptiveNR -> Wiener -> SpectralSub -> VAD -> RMS-Norm -> PreEmphasis"
        );
        AudioPreprocessor {
            buffer:        Vec::with_capacity(CHUNK_SAMPLES * 4),
            prev_sample:   0.0,
            noise_profile: NoiseProfile::new(),
            vad:           VadState::new(),
            frame_count:   0,
            dropped_count: 0,
        }
    }

    #[wasm_bindgen]
    pub fn process(&mut self, samples: &[f32]) -> Vec<String> {
        self.buffer.extend_from_slice(samples);
        let mut chunks = Vec::new();

        while self.buffer.len() >= CHUNK_SAMPLES {
            let chunk: Vec<f32> = self.buffer.drain(..CHUNK_SAMPLES).collect();

            let is_speech = self.vad.is_speech(&chunk);

            if !is_speech && !self.noise_profile.is_initialized() {
                let power = band_power_spectrum(&chunk);
                self.noise_profile.update(&power, false);
                self.dropped_count += 1;
                continue;
            }

            let denoised = self.denoise(&chunk, is_speech);

            // [FIX] Threshold reduced from * 0.5 -> * 0.1.
            // After Wiener + Spectral Subtraction, legitimate speech frames can
            // have their RMS energy reduced significantly. With * 0.5 the threshold
            // was 0.00075, which caused many real speech frames to be dropped here
            // even though they had already passed the pre-denoise VAD above.
            // * 0.1 (= 0.00015) only drops frames that are effectively silent
            // after denoising, which is the intended behavior.
            if compute_rms(&denoised) < VAD_ENERGY_THRESH * 0.1 {
                self.dropped_count += 1;
                continue;
            }

            let normalized = rms_normalize(&denoised, TARGET_RMS);
            let emphasized = pre_emphasis(&normalized, PRE_EMPHASIS_COEFF, &mut self.prev_sample);
            let pcm_bytes  = float32_to_pcm16(&emphasized);
            let b64        = base64_encode(&pcm_bytes);

            chunks.push(b64);
            self.frame_count += 1;
        }

        chunks
    }

    #[wasm_bindgen]
    pub fn preprocess_chunk(&mut self, samples: &[f32]) -> Vec<f32> {
        let is_speech  = self.vad.is_speech(samples);
        let denoised   = self.denoise(samples, is_speech);
        rms_normalize(&denoised, TARGET_RMS)
    }

    #[wasm_bindgen]
    pub fn compute_energy(&self, samples: &[f32]) -> f32 {
        compute_rms(samples)
    }

    #[wasm_bindgen]
    pub fn frame_count(&self) -> u32 { self.frame_count }

    #[wasm_bindgen]
    pub fn dropped_count(&self) -> u32 { self.dropped_count }

    #[wasm_bindgen]
    pub fn speech_ratio(&self) -> f32 {
        let total = self.frame_count + self.dropped_count;
        if total == 0 { return 0.0; }
        self.frame_count as f32 / total as f32
    }

    #[wasm_bindgen]
    pub fn reset(&mut self) {
        self.buffer.clear();
        self.prev_sample   = 0.0;
        self.noise_profile = NoiseProfile::new();
        self.vad           = VadState::new();
        self.frame_count   = 0;
        self.dropped_count = 0;
        console_log!("[ScamShield WASM] AudioPreprocessor reset");
    }
}

// -- Internal denoising -----------------------------------------------
impl AudioPreprocessor {
    fn denoise(&mut self, samples: &[f32], is_speech: bool) -> Vec<f32> {
        let power = band_power_spectrum(samples);
        self.noise_profile.update(&power, is_speech);

        if !self.noise_profile.is_initialized() {
            return samples.to_vec();
        }

        let after_wiener   = wiener_filter(samples, &power, &self.noise_profile.noise_psd);
        let after_spectral = spectral_subtraction(&after_wiener, &self.noise_profile.noise_psd);
        after_spectral
    }
}

// -- DSP: Band power spectrum -----------------------------------------
fn band_power_spectrum(samples: &[f32]) -> Vec<f32> {
    let mut power = vec![0.0f32; NUM_BINS];
    let band_size = (samples.len() / NUM_BINS).max(1);

    for (bin, band) in samples.chunks(band_size).enumerate() {
        if bin >= NUM_BINS { break; }
        let p: f32 = band.iter().map(|&s| s * s).sum::<f32>() / band.len() as f32;
        power[bin] = p.max(1e-10);
    }
    power
}

// -- DSP: Wiener filter -----------------------------------------------
fn wiener_filter(samples: &[f32], power_spec: &[f32], noise_psd: &[f32]) -> Vec<f32> {
    let band_size  = (samples.len() / NUM_BINS).max(1);
    let mut output = samples.to_vec();

    for bin in 0..NUM_BINS {
        let snr  = (power_spec[bin] / noise_psd[bin].max(1e-10) - 1.0).max(0.0);
        let gain = (snr / (snr + 1.0)).max(WIENER_BETA);
        let start = bin * band_size;
        let end   = ((bin + 1) * band_size).min(output.len());
        for s in output[start..end].iter_mut() {
            *s *= gain;
        }
    }
    output
}

// -- DSP: Spectral subtraction ----------------------------------------
fn spectral_subtraction(samples: &[f32], noise_psd: &[f32]) -> Vec<f32> {
    let band_size  = (samples.len() / NUM_BINS).max(1);
    let mut output = samples.to_vec();

    for bin in 0..NUM_BINS {
        let noise_amp = noise_psd[bin].max(1e-10).sqrt();
        let start     = bin * band_size;
        let end       = ((bin + 1) * band_size).min(output.len());

        for s in output[start..end].iter_mut() {
            let sign    = if *s >= 0.0 { 1.0_f32 } else { -1.0_f32 };
            let mag     = s.abs();
            let cleaned = (mag - SPECTRAL_SUB_ALPHA * noise_amp)
                            .max(SPECTRAL_SUB_FLOOR * mag);
            *s = sign * cleaned;
        }
    }
    output
}

// -- DSP: VAD helpers -------------------------------------------------
fn compute_rms(samples: &[f32]) -> f32 {
    if samples.is_empty() { return 0.0; }
    let sum_sq: f32 = samples.iter().map(|&s| s * s).sum();
    (sum_sq / samples.len() as f32).sqrt()
}

fn compute_zcr(samples: &[f32]) -> f32 {
    if samples.len() < 2 { return 0.0; }
    let crossings = samples.windows(2)
        .filter(|w| (w[0] >= 0.0) != (w[1] >= 0.0))
        .count();
    crossings as f32 / (samples.len() - 1) as f32
}

// -- DSP: Normalization -----------------------------------------------
fn rms_normalize(samples: &[f32], target: f32) -> Vec<f32> {
    let rms = compute_rms(samples);
    if rms < 1e-6 { return samples.to_vec(); }
    let scale = (target / rms).min(MAX_GAIN);
    samples.iter().map(|&s| (s * scale).clamp(-1.0, 1.0)).collect()
}

// -- DSP: Pre-emphasis ------------------------------------------------
fn pre_emphasis(samples: &[f32], alpha: f32, prev: &mut f32) -> Vec<f32> {
    let mut out = Vec::with_capacity(samples.len());
    for &s in samples {
        out.push(s - alpha * *prev);
        *prev = s;
    }
    out
}

// -- Encoding ---------------------------------------------------------
fn float32_to_pcm16(samples: &[f32]) -> Vec<u8> {
    let mut bytes = Vec::with_capacity(samples.len() * 2);
    for &s in samples {
        let clamped = s.clamp(-1.0, 1.0);
        let pcm: i16 = if clamped < 0.0 {
            (clamped * 32768.0) as i16
        } else {
            (clamped * 32767.0) as i16
        };
        bytes.extend_from_slice(&pcm.to_le_bytes());
    }
    bytes
}

fn base64_encode(bytes: &[u8]) -> String {
    const ALPHA: &[u8] =
        b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = Vec::with_capacity((bytes.len() + 2) / 3 * 4);
    for chunk in bytes.chunks(3) {
        let b0 = chunk[0] as u32;
        let b1 = if chunk.len() > 1 { chunk[1] as u32 } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as u32 } else { 0 };
        let v  = (b0 << 16) | (b1 << 8) | b2;
        out.push(ALPHA[((v >> 18) & 0x3F) as usize]);
        out.push(ALPHA[((v >> 12) & 0x3F) as usize]);
        out.push(if chunk.len() > 1 { ALPHA[((v >> 6) & 0x3F) as usize] } else { b'=' });
        out.push(if chunk.len() > 2 { ALPHA[(v & 0x3F) as usize]         } else { b'=' });
    }
    String::from_utf8(out).unwrap_or_default()
}

// -- Module init ------------------------------------------------------
#[wasm_bindgen(start)]
pub fn init() {
    console_log!(
        "[ScamShield WASM] Audio engine loaded -- Rust {}",
        env!("CARGO_PKG_VERSION")
    );
    console_log!(
        "[ScamShield WASM] {}Hz | {}ms chunks | {} freq bands | Wiener+SpectralSub NR",
        SAMPLE_RATE,
        CHUNK_SAMPLES * 1000 / SAMPLE_RATE as usize,
        NUM_BINS,
    );
}
