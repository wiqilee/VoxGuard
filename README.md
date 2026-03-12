# VoxGuard 🛡️
### Real-Time Multimodal AI Scam Detection with Live Intervention
### Protecting you during the call, not after. When a scammer asks for your OTP, VoxGuard steps in before you hand it over.

<div align="center">

<img src="docs/svgs/architecture-badge.png" alt="VoxGuard Architecture" width="100%"/>
<br><br>
<img src="docs/svgs/architecture-2.png" alt="VoxGuard Architecture" width="100%"/>
<br><br>
<img src="docs/svgs/architecture-3.png" alt="VoxGuard Architecture" width="100%"/>

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg?style=flat-square)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)](https://python.org)
[![Rust](https://img.shields.io/badge/Rust-1.75+-CE422B?style=flat-square&logo=rust)](https://rustlang.org)
[![Gemini Live API](https://img.shields.io/badge/Gemini-Live%20API-4285F4?style=flat-square&logo=google)](https://cloud.google.com)
[![Google Cloud Run](https://img.shields.io/badge/Cloud-Run-4285F4?style=flat-square&logo=googlecloud)](https://cloud.google.com/run)
[![Built for](https://img.shields.io/badge/Built%20for-Gemini%20Live%20Agent%20Challenge-FF6B35?style=flat-square)](https://geminiliveagentchallenge.devpost.com)

**The world's first real-time multimodal scam detection agent with active intervention.**
Gemini Live API + Rust WASM + Psychological AI + Natural Voice TTS = Protection in under 80ms.

<a href="https://voxguard-kappa.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-voxguard--kappa.vercel.app-00C7B7?style=for-the-badge&logo=vercel" alt="Live Demo"/></a> <a href="https://youtube.com"><img src="https://img.shields.io/badge/Demo%20Video-YouTube-FF0000?style=for-the-badge&logo=youtube" alt="Demo Video"/></a> <a href="YOUR_MEDIUM_URL_HERE"><img src="https://img.shields.io/badge/Article-Medium-000000?style=for-the-badge&logo=medium" alt="Medium Article"/></a> <a href="#-for-judges-2-minute-guide"><img src="https://img.shields.io/badge/For%20Judges-2%20Minute%20Guide-FF6B35?style=for-the-badge" alt="For Judges"/></a>

</div>

---

## 🎯 For Judges: 2-Minute Guide

> **TL;DR:** Open the demo, click START, pick a demo script, watch real-time scam detection happen, then watch the system **intervene and block you** from giving away your money - with a **natural human voice** warning you in your language.

### In 30 seconds (Demo Mode, no microphone needed):

```
1. Open https://voxguard-kappa.vercel.app
2. Click the "MONITOR" tab (default view)
3. Click "START"
4. Click any Demo Script (e.g., "Bank Impersonation")
5. Watch: alerts fire in real-time, threat score rises, psych vectors light up
6. When the caller asks for your OTP -> INTERVENTION OVERLAY fires automatically
7. HEAR: VoxGuard speaks a natural voice warning via Gemini TTS
8. SEE: Multimodal Explanation Card shows WHY this is a scam (audio + visual signals)
9. Take the Verification Challenge or hit SAFE EXIT
10. SEE: Guided Action Agent gives you step-by-step recovery actions for your country
11. Click "REPORT" tab -> see forensic report with intervention history -> export PDF
```

### What to look for:

| Tab | What It Demonstrates |
|-----|---------------------|
| **MONITOR** | 2-way dialog (ME + CALLER), waveform, <80ms alerts, caller HUD, **live intervention overlay**, **natural voice warnings**, **explanation cards** |
| **PSYCH** | 6 Cialdini vectors + 5 lie detection indicators + user vulnerability (world first) |
| **PATTERNS** | 50+ grounded patterns with fullscreen detail view + interpretation |
| **REPORT** | Full transcript, **intervention history**, **guided action plan**, forensic export (PDF + HTML), session gallery |
| **ABOUT** | Architecture + data sources + why this is unprecedented |

### Innovation in one sentence:
> *Every other tool either blocks calls before they connect or sends a passive alert after the damage is done. VoxGuard is the first system that protects you **while** the scammer is talking - with a natural voice that **warns you**, an AI that **explains why** this is dangerous, and an agent that **walks you** step-by-step to safety.*

---

## ⚠️ The Problem

Every 30 seconds, someone somewhere in the world loses money to a phone or video call scam.

<div align="center">
<img src="docs/svgs/threat-demo.svg" alt="Threat Score Demo" width="280"/>
</div>

According to the **FBI IC3 2024 Annual Report**, internet crime losses in the United States hit **$16.6 billion** in 2024, with phone and video call fraud growing faster than any other category. Globally, GASA puts estimated losses at over **$1.026 trillion** per year.

Every existing tool shares one fatal flaw: **they act after the damage is done.**

> *"The difference between a scam succeeding and failing is often a single moment of doubt. VoxGuard creates that moment, then forces you to think before you act."*
>
> Wiqi Lee

---

## 🚀 What Makes VoxGuard Unprecedented

<div align="center">
<img src="docs/svgs/features-badge.svg" alt="Features" width="100%"/>
</div>

| Feature | Truecaller | Hiya | ScamShield (SG) | **VoxGuard** |
|---|---|---|---|---|
| Pre-call blocking | Yes | Yes | Yes | No (by design) |
| During-call analysis | No | No | No | **Yes (First)** |
| **Live intervention (blocks fatal actions)** | No | No | No | **Yes (First)** |
| **Natural voice intervention (Gemini TTS)** | No | No | No | **Yes (First)** |
| **Multimodal explanation cards (audio + vision)** | No | No | No | **Yes (First)** |
| **Guided anti-scam action agent** | No | No | No | **Yes (First)** |
| **Scenario-based verification challenge** | No | No | No | **Yes (First)** |
| **Auto-disconnect countdown** | No | No | No | **Yes (First)** |
| Multimodal (audio + vision) | No | No | No | **Yes (First)** |
| 2-way transcript (ME + CALLER) | No | No | No | **Yes (First)** |
| Screen share scam detection | No | No | No | **Yes (First)** |
| Sub-100ms alert latency | No | No | No | Yes (Rust WASM) |
| Psychological manipulation scoring | No | No | No | **Yes (First)** |
| Lie detection analysis | No | No | No | **Yes (First)** |
| User vulnerability scoring | No | No | No | **Yes (First)** |
| Multi-language support | Partial | Partial | SG only | Yes, 40 languages |
| Per-country recommended actions | No | No | No | **Yes (9 countries)** |
| **Country-specific emergency contacts + reporting** | No | No | No | **Yes (9 countries)** |
| **Intervention history in forensic reports** | No | No | No | **Yes (First)** |
| Session gallery with playback | No | No | No | **Yes** |
| **Audio session recording (REC)** | No | No | No | **Yes (First)** |
| Forensic export (PDF + HTML) | No | No | No | **Yes** |
| Grounded to global scam databases | No | Partial | Partial | Yes |
| Works on any call platform (desktop + mobile) | No | No | No | Yes (browser-based, responsive) |

---

## 🚨 Live Scam Intervention

<div align="center">
<img src="docs/svgs/intervention.svg" alt="Live Scam Intervention Demo" width="100%"/>
</div>

No other tool does this. This is what sets VoxGuard apart.

When VoxGuard's threat engine determines you are about to take an irreversible action, it does not wait for you to check a dashboard. It takes over your screen, **speaks to you in a natural human voice**, explains exactly why this is dangerous, and forces a decision point.

### Three Escalation Levels

| Level | Trigger | What Happens |
|-------|---------|-------------|
| **⚠️ WARN** | Threat score crosses 55, or a high-risk manipulation pattern is detected | Amber warning banner. **Natural voice: calm, advisory tone.** Verify Caller + Safe Exit + Continue With Caution. Speech pauses. |
| **🛑 BLOCK** | Threat score crosses 75, or the caller requests OTP / account credentials / gift cards / crypto transfer | Full-screen red overlay. **Natural voice: firm, urgent tone.** Fatal patterns (OTP/transfer/crypto): Safe Exit only. Verifiable patterns: Verification Challenge + Safe Exit. |
| **🚨 LOCKDOWN** | Threat score crosses 90. Confirmed scam with maximum confidence. | Full-screen red lockdown with 30-second auto-disconnect countdown. **Natural voice: commanding, sharp tone.** Safe Exit only. No challenge - too dangerous. |

### Instant Intervention

Some patterns are so dangerous that VoxGuard does not wait for the threat score to accumulate. These high-lethality patterns trigger an immediate BLOCK-level intervention the moment they are detected, regardless of cumulative score:

- **OTP / Credential Extraction** ("Read me the code", "Confirm your PIN") → **Safe Exit only**
- **Safe Account Transfer** ("Transfer your funds to this protection account") → **Safe Exit only**
- **Gift Card Demand** ("Purchase prepaid cards and read me the numbers") → **Safe Exit only**
- **Crypto Transfer Scam** ("Send Bitcoin to this wallet address") → **Safe Exit only**

These fatal patterns skip the Verification Challenge entirely - when someone is actively extracting your credentials, the only safe action is to disconnect.

This works across all supported languages. If the caller asks for your OTP in Indonesian, Chinese, Japanese, Korean, Spanish, French, Hindi, or Arabic, VoxGuard blocks it instantly.

### 🔊 Natural Voice Intervention (Gemini TTS)

**VoxGuard doesn't just show you a warning - it speaks to you.**

When an intervention fires, `gemini-2.5-flash-preview-tts` generates a natural human voice warning that matches the detected scam type, the urgency level, and the user's language. This is not robotic text-to-speech - it sounds like a real person warning you.

| Level | Voice Profile | Example |
|-------|--------------|---------|
| **WARN** | Calm, advisory (Kore) | *"Caution. VoxGuard has detected suspicious patterns in this call. The caller may not be who they claim to be."* |
| **BLOCK** | Firm, authoritative (Puck) | *"Stop immediately. The caller is asking for your one-time password. A real bank will never ask for this. Hang up now."* |
| **LOCKDOWN** | Sharp, commanding (Charon) | *"Emergency. VoxGuard has confirmed this is a scam. This call will disconnect in 30 seconds."* |

Voice warnings are:
- **Contextual** - different scripts for bank impersonation, OTP extraction, gift card demand, government scam, tech support, and more
- **Localized** - fully scripted in 9 languages (EN, ID, ZH, JA, KO, ES, FR, HI, AR)
- **Graceful fallback** - if Gemini TTS is unavailable, falls back to browser speech synthesis automatically

### 📋 Multimodal Explanation Cards

After a high-severity alert, VoxGuard generates an **Explanation Card** that tells you in plain language **why** this is dangerous - combining evidence from both audio and visual analysis.

**Example Explanation Card:**
> 🚨 **CRITICAL: Bank Impersonation + Fake Login Page**
>
> 🎙️ Audio | 🖥️ Screen | 95% confidence
>
> The caller claims to be from your bank's fraud department (Authority tactic) while your screen shows a login page at 'bank-secure-verify.com' - this is NOT your real bank's domain. The combination of voice impersonation and a phishing page is a confirmed scam technique.
>
> ✅ End this call and call your bank using the number on the BACK of your card.

Each card shows:
- **Signal badges** - which sources detected the threat (Audio, Screen, or both)
- **Confidence score** - how certain VoxGuard is
- **Expandable signals** - detailed breakdown of each detected pattern with source and severity
- **Risk factors** - specific quotes or elements that triggered the alert
- **Recommended action** - one clear thing to do right now

### Scenario-Based Verification Challenge

When a non-fatal WARN or BLOCK-level intervention fires (e.g., impersonation, fake support, government scare), the user can take a **Verification Challenge**. Unlike generic questionnaires, VoxGuard's challenges are **contextual to the detected scam type**:

**Bank Impersonation** (2-3 questions):
- "Did this caller contact you first, or did you call them?"
- "Are they asking you to share your OTP, PIN, or password?"
- "Did they tell you NOT to call your bank directly?"

**Government Impersonation** (2 questions):
- "Is this caller threatening arrest or legal action if you don't pay now?"
- "Are they demanding payment via gift cards, crypto, or wire transfer?"

**Tech Support Impersonation** (3 questions):
- "Did this caller contact you first about a 'virus' or 'security issue'?"
- "Are they asking you to install remote access software?"
- "Are they rushing you to act immediately?"

Each scenario includes 7 supported scam types (bank, government, tech support, investment, family impersonation, prize/lottery, urgency) with a generic fallback for unknown patterns.

After the user answers, VoxGuard provides a clear result:
- **⚠ LIKELY SCAM** → recommends immediate disconnection
- **⚡ EXERCISE CAUTION** → offers "I Will Verify Through Official Channel" action with specific guidance (e.g., "Call the number on the BACK of your bank card")

Challenges are fully localized in 9 languages (EN, ID, ZH, JA, KO, ES, FR, HI, AR).

### Safe Exit - End Call

The **End Call - Safe Exit** button is the primary protective action. When pressed:

1. **Voice warning stops** immediately (Gemini TTS + browser synthesis)
2. **Speech synthesis stops** immediately
3. **Demo/call playback halts** completely
4. **Detection stream terminates**
5. **Session status changes** to terminated
6. **Guided Action Agent launches** with personalized recovery steps
7. **App switches to the REPORT tab** automatically
8. **Forensic report displays** with full session data, intervention history, and export options

This ensures the user experiences a clear, decisive break from the scam call - not just a UI dismiss.

### 🛡️ Guided Anti-Scam Action Agent

**After Safe Exit, VoxGuard becomes your recovery coach.**

Instead of just saying "call your bank", VoxGuard generates a **personalized, step-by-step action plan** based on the scam type, your country, and how severe the threat was. Each step has a checkbox so you can track your progress.

**Example Action Plan (Bank Impersonation, Indonesia, Critical):**

```
🛡️ Anti-Scam Action Plan
🚨 CRITICAL | 🇮🇩 Indonesia | ⏱ 15-30 minutes

⚠️ Act within the next 15 minutes. Time is critical.

🤖 Based on the call pattern, the caller was impersonating a bank officer
   and attempted to extract your OTP. If you shared any codes, contact
   your bank immediately to freeze your account.

☐ 📵 Blokir nomor penelepon di pengaturan HP Anda          [immediate]
☐ 🏦 Hubungi bank menggunakan nomor di BELAKANG kartu ATM   [critical]
☐ 🔒 Minta bank untuk blokir sementara rekening             [critical]
☐ 📋 Laporkan ke OJK: 157 atau konsumen@ojk.go.id           [high]
☐ 🚔 Laporkan ke Bareskrim: patrolisiber.id atau 110        [recommended]
☐ 🔑 Ganti password semua akun yang dibicarakan             [recommended]

🚨 Emergency: Call 110 if you feel in danger
```

**Supported countries (9):**

| Country | Flag | Emergency | Reporting Channels |
|---------|------|-----------|--------------------|
| United States | 🇺🇸 | 911 | FTC, FBI IC3, Credit bureaus |
| Indonesia | 🇮🇩 | 110 | OJK, Bareskrim, Bank Indonesia |
| China | 🇨🇳 | 110 | National Anti-Fraud Center app |
| Japan | 🇯🇵 | 110 | NPA #9110, Consumer Hotline 188 |
| South Korea | 🇰🇷 | 112 | FSS 1332, Cyber investigation |
| Spain | 🇪🇸 | 112 | Guardia Civil, INCIBE 017 |
| France | 🇫🇷 | 17 | PHAROS, Info Escroqueries |
| India | 🇮🇳 | 112 | Cybercrime 1930, cybercrime.gov.in |
| Saudi Arabia | 🇸🇦 | 911 | Kulluna Amn app, SAMA |

Action plans are:
- **Personalized** - steps prioritized based on what was detected (OTP extraction gets bank-first, gift card gets report-first)
- **AI-enhanced** - Gemini adds personalized advice based on the specific call transcript
- **Interactive** - checkbox progress tracking with completion percentage
- **Localized** - action text in the user's language with local phone numbers and websites

### Safe Exit Actions

Every intervention displays localized safe exit actions specific to the user's country:

- 📵 **Hang up now**
- 🏦 **Call your bank's real number** (the one on the back of your card)
- 👥 **Call a trusted family member** before doing anything
- 🚫 **Never share OTP / PIN / password** on a call

These are available in English, Indonesian, Chinese, Japanese, Korean, Spanish, French, Hindi, and Arabic.

### Why This Matters

Scammers succeed because they keep victims in a state of panic that shuts down rational thinking. The caller manufactures urgency ("your account will be frozen in 10 minutes"), establishes false authority ("I am calling from the fraud department"), and enforces isolation ("do not contact your bank directly").

VoxGuard's three-layer defense breaks that panic loop:

1. **Voice Intervention** physically interrupts the scammer's narrative with a calm, authoritative human voice speaking directly to the victim
2. **Explanation Card** replaces confusion with clarity, showing exactly which signals triggered the alert and why
3. **Action Agent** replaces helplessness with a concrete plan, providing step-by-step instructions with local emergency numbers

The intervention overlay physically breaks that panic loop. It pauses the conversation. It forces a moment of reflection. The scenario-based verification challenge makes the victim confront the reality of what is happening, with questions tailored to the specific scam type they are experiencing. And if the victim is too far gone to respond, the 30-second lockdown countdown ends the call automatically.

No other scam detection tool does this. Every other system either blocks calls before they connect (which misses new numbers) or sends a passive notification after the call ends (which is too late). VoxGuard is the first system that intervenes **during** the critical moment when the victim is about to hand over their money.

### Intervention Tracking

Every intervention event is tracked and preserved:

- **Intervention counter** displays in the monitor tab during active sessions
- **Intervention history** is included in the forensic report with level, trigger pattern, threat score at time of firing, and user response (dismissed, safe exit, challenge passed, challenge failed)
- **Alert cards** that triggered an intervention display a 🛑 INTERVENED badge
- **HTML and PDF exports** include a dedicated intervention section
- **Session gallery** shows intervention count per saved session
- **Action plan history** is preserved with completion status

---

## 🏗️ Architecture

<div align="center">
<img src="docs/svgs/architecture.svg" alt="System Architecture" width="100%"/>
</div>

### System Overview

VoxGuard is a four-layer real-time pipeline that processes audio, video, and screen input from any call platform and delivers protection in under 80 milliseconds.

### Layer 1: Input Sources

Three concurrent input streams feed the system:

- **Caller Audio** - the scammer's voice or video call (phone, WhatsApp, Zoom, Teams, any platform)
- **User Microphone** - the protected party's microphone via Web Audio API for 2-way transcript
- **Screen Share** - optional screen capture (JPEG 1280px every 2 seconds) for visual scam detection

### Layer 2: Browser Layer (Client)

| Component | Technology | Role |
|-----------|-----------|------|
| **React UI** | Vite 5 + JSX | 5-tab interface, live alerts, intervention overlay, action plan display |
| **Rust WASM** | wasm-pack, Wiener NR | Spectral subtraction, Float32 PCM, zero-copy audio at <100ms latency |
| **Web Audio** | MediaStream API | 16kHz Mono PCM capture in 250ms frames via ScriptProcessor |
| **WebSocket** | useWebSocket hook | Bidirectional: sends audio/screen, receives alerts/TTS/explanations/actions |
| **Intervention** | InterventionOverlay.jsx | WARN / BLOCK / LOCKDOWN overlay with verification challenge and auto-disconnect |
| **Action Agent** | ActionAgent.jsx | Post-session guided recovery: 9 languages, 9 countries, step-by-step checklist |
| **Screen Capture** | getDisplayMedia API | Opt-in only, Base64 JPEG, 2-second interval |

### Layer 3: Backend (Google Cloud Run, Python FastAPI)

| Service | File | Role |
|---------|------|------|
| **FastAPI** | main.py | REST + WebSocket `/ws/session`, auto-scaling on Cloud Run, health check, CORS |
| **Threat Engine** | threat_engine.py | Weighted scoring (0.45 Language + 0.35 Behavioral + 0.20 Visual), 500ms cycle, intervention triggers at score 55/75/90 + instant pattern matching |
| **Audio Analyzer** | audio_analyzer.py | VAD + buffer management, streams to Gemini Live API for real-time transcription |
| **Vision Analyzer** | vision_analyzer.py | Screenshot analysis via Gemini Vision: fake login pages, phishing domains, QR codes |
| **Psych Analyzer** | psych_analyzer.py | Single Gemini call returns 6 Cialdini vectors + 5 lie detection indicators + intervention recommendation |
| **TTS Service** | tts_service.py | Natural voice intervention via Gemini TTS with 3 voice profiles (Kore/Puck/Charon) |
| **Explanation Service** | explanation_service.py | Combines audio + visual analysis into plain-language explanation cards |
| **Action Agent** | action_agent.py | Generates personalized recovery plans with country-specific emergency contacts and reporting channels for 9 countries |

### Layer 4: Google Gemini AI

| Model | Version | Purpose |
|-------|---------|---------|
| **Gemini Live API** | gemini-2.5-flash-native-audio | Real-time audio streaming with barge-in, enhanced audio quality, NLF pattern detection |
| **Gemini Vision** | gemini-2.5-flash | Screenshot analysis: fake UI detection, phishing domain identification, QR code scanning |
| **Gemini Text** | gemini-2.5-flash | Transcript analysis, psychological scoring, 50+ pattern matching, explanation generation |
| **Gemini TTS** | gemini-2.5-flash-preview-tts | Natural voice intervention with contextual scripts in 9 languages |
| **Grounding DB** | scam_patterns.json | 50+ verified patterns from FTC, FBI IC3, GASA, MAS, ACCC - zero hallucination |

### Data Flow

```
Caller Voice ─┐
              ├─→ Rust WASM (spectral analysis, noise reduction)
User Mic ─────┘         │
                        ▼
              WebSocket (audio chunks + screen frames)
                        │
                        ▼
              FastAPI Backend (Cloud Run)
              ┌─────────┼─────────┐
              ▼         ▼         ▼
         Audio SVC  Vision SVC  Psych SVC
         (Gemini    (Gemini     (Gemini
          Live)      Vision)     Text)
              └─────────┼─────────┘
                        ▼
              Threat Engine (scoring + intervention triggers)
                        │
              ┌─────────┼──────────────┐
              ▼         ▼              ▼
          Alert     Intervention   Explanation
          Event     Event + TTS    Card Event
              └─────────┼──────────────┘
                        ▼
              WebSocket (back to browser)
                        │
              ┌─────────┼──────────────┐
              ▼         ▼              ▼
          AlertCard  Intervention   Explanation
          (live)     Overlay +      Card +
                     Voice Warning  Action Agent
```

---

## 🔍 Features

### 1. 🎙️ Live Audio Stream Analysis

<div align="center">
<img src="docs/svgs/audio-stream.svg" alt="Audio Stream" width="100%"/>
</div>

The Rust WebAssembly audio engine captures microphone input at the browser level with zero-copy processing. Audio is downsampled to 16kHz Mono PCM, processed through Wiener noise reduction, and streamed to Gemini Live API in 250ms frames, achieving **<80ms alert latency** from speech to alert.

### 2. 🖥️ Screen Share Scam Vision

With explicit user consent, VoxGuard captures screen frames (JPEG 1280px) every 2 seconds and sends them to Gemini Vision for analysis: fake bank login pages, fraudulent investment dashboards, malicious QR codes, and spoofed government portals.

### 3. 📊 Real-Time Threat Intelligence Engine

A weighted composite scoring system running every 500ms. Language score (45%) handles transcript pattern matching against 50+ verified patterns. Behavioral score (35%) tracks urgency signals, isolation tactics, and impersonation markers. Visual score (20%) covers screen analysis results when active. Output: 0-100 threat score with severity classification. The engine also evaluates every alert for intervention triggers, checking both score thresholds (55/75/90) and instant-pattern matches.

### 4. 📚 Scam Pattern Library (50+ Grounded Patterns)

All patterns grounded to published sources: FTC Consumer Sentinel, FBI IC3 2024, GASA Global Scam Report, MAS ScamShield (SG), and ACCC ScamWatch. No hallucination. Verified structured knowledge only. Each pattern includes an `intervention_level` field that determines whether detection triggers WARN, BLOCK, or no automatic intervention.

### 5. 🧠 Psychological Manipulation Scoring

<div align="center">
<img src="docs/svgs/psych-vectors.svg" alt="Psychological Vectors" width="260"/>
</div>

The **only scam detection system in the world** that maps psychological manipulation vectors in real-time using three analytical frameworks:

**Framework 1: Cialdini's 6 Influence Principles** maps which persuasion vectors the caller is deploying:

| Vector | Trigger Example |
|--------|----------------|
| **SCARCITY** | *"This offer expires in 10 minutes"* |
| **AUTHORITY** | *"I'm calling from the tax office"* |
| **FEAR** | *"Your account will be frozen"* |
| **RECIPROCITY** | *"We already helped you, now you must..."* |
| **ISOLATION** | *"Don't tell your family about this"* |
| **COMMITMENT** | *"You already agreed to verify your identity"* |

**Framework 2: User Vulnerability State** derives metrics showing how the manipulation is affecting the user's decision-making (Panic Level, Compliance Risk, Misplaced Trust). These scores directly feed the intervention system: high panic combined with high authority triggers earlier intervention.

Each vector includes real-time interpretation (Inactive, Low, Moderate, Elevated, High, Critical) with explanations, plus a pie chart distribution view.

### 6. 🔍 Lie Detection Analysis

<div align="center">
<img src="docs/svgs/lie-detection.svg" alt="Lie Detection" width="300"/>
</div>

**5 behavioral deception indicators** based on FBI Criteria-Based Content Analysis (CBCA) methodology:

| Indicator | What It Detects |
|-----------|----------------|
| **Inconsistency** | Contradictions between claims made at different points |
| **Strategic Vagueness** | Deliberately avoids specifics when challenged |
| **Excessive Detail** | Unprompted flood of irrelevant details (overcompensation) |
| **Question Deflection** | Changes subject or responds with new claims |
| **Pressure to Comply** | Uses urgency to prevent verification |

Lie detection scores are displayed in the PSYCH tab alongside manipulation vectors, included in forensic reports (PDF/HTML), and saved to the session gallery. The Psych Analyzer service returns both psych scores and lie scores in a single Gemini call, along with an intervention recommendation that feeds back into the threat engine.

### 7. 💬 Two-Way Communication Transcript

Both sides of the conversation are transcribed in real-time:
- **ME** (user), displayed in green
- **CALLER** (scammer), displayed in orange with flag markers

Flagged statements trigger real-time alerts. Full 2-way transcript is preserved in session reports and gallery.

### 8. 📋 Session Report, Gallery & Forensic Export

Every session generates a complete forensic report with:
- Full 2-way transcript with timestamps
- **Intervention history** with level, trigger type, pattern, score at time of firing, and user response
- **Action plan history** with completion status and country-specific steps taken
- Alert timeline with confidence scores (alerts that triggered intervention are marked with 🛑)
- Psychological vector breakdown + lie detection scores
- Country-specific recommended actions with local emergency numbers
- Country flag and language indicator
- **Session audio recording** (when REC is enabled)

**Export:** Dark-theme HTML or print-ready PDF with colored bars, dedicated intervention section, all analytical sections, and "Built by Wiqi Lee" footer.

**Session Gallery:** Saved sessions with threat score preview, country label, duration, and intervention count. Click any session for fullscreen detail view with tabs (Transcript, Alerts, **Interventions**, Psych + Lie Detection, **Action Plan**, Recommended Actions). Audio playback when recording is available.

### 8.1 🎙 Audio Recording (REC)

Press the **REC** button in the Monitor tab to capture session audio. The recording is saved as a WebM or MP4 blob (depending on browser support) and embedded in the forensic report. When you export to HTML, the audio player is included so you can replay the session later.

**How to record:**

1. Click **START** to begin a session
2. Click the red **REC** button (it will pulse to indicate recording is active)
3. Run a demo script or use Live Mic (see below)
4. When you click **STOP** or **SAFE EXIT**, the recording is automatically saved
5. Open the **REPORT** tab to see the audio player and export to HTML

### 8.2 🎙 Live Microphone Mode

VoxGuard supports real-time audio capture from your device microphone, in addition to demo mode. Both can run simultaneously.

**How to use Live Mic:**

1. Click **START** to begin a session
2. Click the **🎙 LIVE MIC** button in the Monitor controls
3. Grant microphone permission when your browser asks
4. A green status banner appears: "LIVE MICROPHONE - Real audio capture active"
5. Put your phone on speaker and place it near your device, or use the same device for both the call and VoxGuard
6. VoxGuard captures your microphone audio at 16kHz Mono PCM via the Web Audio API
7. In production mode (with a running backend), the audio is streamed to the Gemini Live API for real-time analysis
8. Click **🎙 MIC ON** again to disconnect the microphone

**Live Mic + REC together:** Enable both Live Mic and REC at the same time to record your actual call audio into the forensic report. This is the recommended setup for real-world use.

**Live Mic + Demo Scripts:** You can also run a demo script while Live Mic is active. The demo script provides simulated 2-way dialog and alerts, while the microphone captures real ambient audio in parallel. This is useful for demonstrations where you want to show both the scripted flow and the live microphone capability.

### 9. 🌍 Multi-Language Support (40 Languages)

Gemini Live API supports 40 languages natively. VoxGuard includes region-specific scam patterns, localized alerts, **localized intervention UI, natural voice warnings (Gemini TTS), scenario-based verification challenges, safe exit actions, and guided action plans**.

#### Fully Native Support (demo scripts + localized alerts + voice intervention + action agent):

| Language | Flag | Demo Scripts | Regional Scams | Intervention | Voice TTS | Action Agent |
|----------|------|-------------|----------------|-------------|-----------|-------------|
| English | 🇺🇸 | Bank Fraud, Tech Support, Gov/Tax, Investment | FTC/FBI patterns | Full | Full (3 voices) | Full (US) |
| Indonesian | 🇮🇩 | Bank XYZ, Pinjol, Mama Minta Pulsa, Giveaway Palsu | OJK/Bareskrim | Full | Full | Full (ID) |
| Chinese | 🇨🇳 | 公安局诈骗 (Police Impersonation) | MPS Advisory | Full | Full | Full (CN) |
| Japanese | 🇯🇵 | オレオレ詐欺 (Ore Ore) | NPA patterns | Full | Full | Full (JP) |
| Korean | 🇰🇷 | 보이스피싱 (Voice Phishing) | FSS patterns | Full | Full | Full (KR) |
| Spanish | 🇪🇸 | Fraude Bancario | Guardia Civil | Full | Full | Full (ES) |
| French | 🇫🇷 | Arnaque CPF | DGCCRF | Full | Full | Full (FR) |
| Hindi | 🇮🇳 | Digital Arrest Fraud | MHA/RBI | Full | Full | Full (IN) |
| Arabic | 🇸🇦 | احتيال مصرفي (Bank Fraud) | GASA | Full | Full | Full (SA) |

#### Partial Native Support (demo scripts in local language, TTS via Gemini):

| Language | Flag | Demo Scripts | Regional Scams | Intervention | Voice TTS | Action Agent |
|----------|------|-------------|----------------|-------------|-----------|-------------|
| Malay | 🇲🇾 | Bank, Polis Diraja, Hadiah Palsu | BNM patterns | Full | Full | English fallback |
| Portuguese | 🇧🇷 | Fraude Bancária, Polícia Federal, Prêmio Falso | GASA patterns | Full | Full | English fallback |

#### English Fallback (voice + alerts in English, UI translated):

Filipino 🇵🇭, Thai 🇹🇭, Vietnamese 🇻🇳, German 🇩🇪, Italian 🇮🇹, Dutch 🇳🇱, Turkish 🇹🇷, Polish 🇵🇱, Russian 🇷🇺, Ukrainian 🇺🇦, Romanian 🇷🇴, Czech 🇨🇿, Hungarian 🇭🇺, Swedish 🇸🇪, Danish 🇩🇰, Finnish 🇫🇮, Greek 🇬🇷, Hebrew 🇮🇱, Persian 🇮🇷, Bengali 🇧🇩, Urdu 🇵🇰, Tamil 🇱🇰, Swahili 🇰🇪, Amharic 🇪🇹, Yoruba 🇳🇬, Hausa 🇳🇬, Afrikaans 🇿🇦, Norwegian 🇳🇴

> ⚠️ English fallback languages show a yellow notice in the app. Full native support planned for future release.

### 10. 📱 Responsive Design

Fully optimized for desktop and mobile browsers. Works on any smartphone via the browser — no app installation required. On phones: header wraps, tabs scroll horizontally, content padding reduced, footer stacks vertically. Touch-friendly buttons and controls throughout.

---

## 📂 Project Structure

```
voxguard/
├── .github/workflows/
│   ├── ci.yml                             # CI: WASM build, frontend build, backend tests
│   └── deploy.yml                         # CD: deploy backend to GCP Cloud Run
│
├── frontend/                              # React SPA (Vite 5 + JSX)
│   ├── src/
│   │   ├── components/
│   │   │   ├── PixelLogo.jsx              # Animated pixel shield logo with color cycling
│   │   │   ├── Primitives.jsx             # Reusable UI: PBox (bordered panel), PBtn, StatCard
│   │   │   ├── AlertCard.jsx              # Expandable threat alert card with intervention badge
│   │   │   ├── InterventionOverlay.jsx    # Live Scam Intervention: WARN/BLOCK/LOCKDOWN overlay
│   │   │   ├── ExplanationCard.jsx        # Multimodal explanation card (audio + vision signals)
│   │   │   ├── ActionAgent.jsx            # Guided anti-scam action agent with step checklist
│   │   │   ├── ThreatMeter.jsx            # SVG arc gauge: composite threat score 0-100
│   │   │   ├── WaveformVisualizer.jsx     # Real-time audio waveform bar visualization
│   │   │   ├── LanguageSelector.jsx       # Language dropdown (40 languages)
│   │   │   └── PixelParticles.jsx        # Animated pixel particles (header + monitor)
│   │   ├── pages/
│   │   │   ├── MonitorTab.jsx             # Main dashboard: waveform, alerts, explanation cards
│   │   │   └── Tabs.jsx                   # Psych, Patterns, Report (with action plan), About
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js            # WebSocket client: alerts, TTS audio, explanations, actions
│   │   │   ├── useAudioEngine.js          # Mic capture + Rust WASM bridge (Web Audio fallback)
│   │   │   └── useScreenCapture.js        # Screen share via getDisplayMedia, 2s JPEG frames
│   │   ├── wasm/                          # Generated by wasm-pack (gitignored, built in CI)
│   │   │   ├── scam_shield_audio.js       # JS bindings for the Rust WASM module
│   │   │   └── scam_shield_audio_bg.wasm  # Compiled WASM binary
│   │   ├── utils/
│   │   │   └── constants.js               # Patterns, psych tactics, intervention config, challenges
│   │   ├── App.jsx                        # Root component: tab routing, state management, effects
│   │   └── main.jsx                       # React DOM mount point
│   ├── package.json                       # Dependencies: React 18, Vite 5
│   └── vite.config.js                     # Dev server proxy, WASM support, build config
│
├── rust-engine/                           # Rust WASM audio preprocessor
│   ├── src/
│   │   └── lib.rs                         # DSP pipeline: Wiener NR, spectral sub, VAD, RMS norm
│   ├── Cargo.toml                         # Deps: wasm-bindgen, web-sys, js-sys, serde
│   └── Cargo.lock                         # Locked dependency versions
│
├── backend/                               # Python FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   └── websocket.py               # WebSocket: /ws/session + TTS + explanations + actions
│   │   ├── services/
│   │   │   ├── threat_engine.py           # Scoring + intervention triggers + session state tracking
│   │   │   ├── audio_analyzer.py          # VAD + buffer management, Gemini audio streaming
│   │   │   ├── vision_analyzer.py         # Screenshot analysis via Gemini Vision API
│   │   │   ├── psych_analyzer.py          # Cialdini + lie detection + intervention recommendation
│   │   │   ├── tts_service.py             # Natural voice intervention via Gemini TTS
│   │   │   ├── explanation_service.py     # Multimodal explanation card generation
│   │   │   └── action_agent.py            # Guided anti-scam action plans (9 countries)
│   │   └── core/
│   │       ├── config.py                  # Pydantic settings from env vars (incl. TTS model)
│   │       └── gemini_client.py           # Google GenAI SDK wrapper (audio + vision)
│   ├── data/
│   │   └── scam_patterns.json             # 50+ patterns with intervention_level field per pattern
│   ├── tests/
│   │   └── test_threat_engine.py          # Unit tests for scoring logic and intervention triggers
│   ├── main.py                            # FastAPI entry (legacy, redirects to app.main)
│   ├── requirements.txt                   # Python deps: FastAPI, google-generativeai, numpy, etc.
│   └── Dockerfile                         # Cloud Run container: Python 3.11-slim, PORT=8080
│
├── docs/svgs/
│   ├── architecture-badge.svg             # Animated pipeline badge for README header
│   ├── features-badge.svg                 # Animated capabilities overview
│   ├── intervention.svg                   # Animated intervention tiers (WARN/BLOCK/LOCKDOWN)
│   ├── threat-demo.svg                    # Threat score gauge demo graphic
│   ├── psych-vectors.svg                  # Psychological vector bar chart
│   ├── lie-detection.svg                  # Lie detection indicator chart
│   └── audio-stream.svg                   # Animated audio waveform graphic
│
├── scripts/
│   └── deploy.sh                          # One-command GCP Cloud Run deployment
│
├── .env.example                           # Template: GOOGLE_API_KEY, VITE_WS_URL, TTS model, etc.
├── docker-compose.yml                     # Local dev: backend + frontend orchestration
├── vercel.json                            # Vercel config for frontend deployment
├── .gitignore                             # Ignores: node_modules, .env, target/, wasm/
├── LICENSE                                # MIT License
└── README.md                              # You are here
```

> **Note:** `frontend/src/wasm/` is **gitignored**. It is generated by `wasm-pack build` during CI. The Frontend Build job depends on the Rust WASM Build job in the CI/CD pipeline.

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+, Python 3.11+, Rust 1.75+ with `wasm32-unknown-unknown` target
- `wasm-pack` installed
- Google Gemini API key

### Step 1: Clone and Configure
```bash
git clone https://github.com/wiqilee/VoxGuard.git
cd VoxGuard
cp .env.example .env
# Add your GEMINI_API_KEY to .env
```

### Step 2: Build Rust WASM Engine
```bash
cd rust-engine
wasm-pack build --target web --out-dir ../frontend/src/wasm
cd ..
```

### Step 3: Run Frontend
```bash
cd frontend && npm install && npm run dev
```

### Step 4: Run Backend (separate terminal)
```bash
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Step 5: Open `http://localhost:5173`

---

## 🎬 Demo Scripts

Three pre-loaded scripts for Demo Mode (no microphone needed):

**Script A: Bank Impersonation (Critical)**
> *"Hello, I'm calling from your bank's fraud prevention department. We've detected suspicious activity on your account. Your account will be frozen in 10 minutes unless you verify your identity. Please provide your account number and the OTP."*
>
> **Intervention trigger:** When the caller asks for OTP, a BLOCK-level intervention fires instantly - Safe Exit only (fatal pattern).
> **Voice warning:** *"Stop immediately. The caller is asking for your one-time password. A real bank will never ask for this. Hang up now."*
> **Explanation Card:** Shows combined audio signals (Authority + Fear tactics) with confidence score.
> **Action Agent:** Country-specific steps to secure your bank account.

**Script B: Tech Support Scam (High)**
> *"Your computer has been compromised. I'm calling from the Security Center. You must install our remote access tool immediately or we cannot protect your credit cards."*
>
> **Intervention trigger:** WARN fires on impersonation detection. User can Verify Caller or Safe Exit.
> **Voice warning:** *"Caution. No legitimate company will cold-call you about a virus on your computer."*

**Script C: Government / Tax Scam (Critical)**
> *"This is an officer from the tax enforcement division. A warrant has been issued for your arrest. Settle this balance right now or face arrest. Purchase prepaid debit cards and read me the card numbers."*
>
> **Intervention trigger:** Gift Card Demand fires instant BLOCK - Safe Exit only (fatal pattern).
> **Voice warning:** *"Stop. No legitimate organization accepts payment through gift cards. This is a confirmed scam."*

---

## 🏆 For Judges: Full Evaluation Guide

### Innovation and Multimodal UX (40%)

VoxGuard has no text box. The user never types. The interface is entirely driven by audio (microphone stream via Rust WASM to Gemini Live API), vision (screen capture to Gemini Vision API), voice (Gemini TTS for spoken intervention), and inference (psychological vector scoring via Gemini Text). The interaction is **ambient**: the AI listens, watches, speaks, explains, and guides while the user is on their call.

The **Live Scam Intervention** system is entirely new. No existing scam detection product actively blocks the user from completing a dangerous action during a live call. VoxGuard's three-tier escalation (WARN, BLOCK, LOCKDOWN) with natural voice warnings, multimodal explanation cards, scenario-based verification challenges, guided action agent, and auto-disconnect represents a fundamental shift from passive detection to active protection.

### Technical Implementation (30%)

- **Google GenAI SDK:** All Gemini calls use the official `google-generativeai` Python SDK
- **Gemini Live API:** `gemini-2.5-flash-native-audio` for real-time audio streaming with barge-in and enhanced audio quality
- **Gemini Text/Vision:** `gemini-2.5-flash` for screenshot analysis, transcript analysis, psychological scoring, and multimodal explanation generation
- **Gemini TTS:** `gemini-2.5-flash-preview-tts` for natural voice intervention with 3 voice profiles (Charon for scammer simulation, Kore for user, Puck for warm advisory) and contextual scripts in 9 languages
- **Rust WASM:** Zero-copy audio processing, Wiener NR, Float32 PCM, <100ms latency
- **Cloud Run:** Fully containerized, auto-scaling, health check endpoints, session affinity for WebSocket
- **Grounding:** Reasoning against 50+ verified patterns with zero hallucination
- **Intervention Engine:** Backend evaluates every alert for intervention eligibility, emitting `intervention` + `intervention_audio` + `explanation_card` events via WebSocket. Frontend renders the overlay with scenario-appropriate UI, plays TTS audio, shows explanation cards, and sends `intervention_response` back. The full loop is tracked in session state.
- **Explanation Service:** Combines audio transcript analysis + screenshot analysis into a single Gemini call, producing plain-language explanation cards with signal badges, confidence scores, and recommended actions
- **Action Agent:** Generates personalized step-by-step recovery plans with country-specific emergency contacts, reporting channels, and AI-enhanced advice based on the call transcript
- **Psych Analyzer:** Single Gemini call returns both Cialdini scores and lie detection indicators, plus an intervention recommendation

### Demo and Presentation (30%)

<a href="https://voxguard-kappa.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-voxguard--kappa.vercel.app-00C7B7?style=for-the-badge&logo=vercel" alt="Live Demo"/></a>
<a href="https://youtube.com"><img src="https://img.shields.io/badge/Demo%20Video-YouTube-FF0000?style=for-the-badge&logo=youtube" alt="Demo Video"/></a>

---

## ⚠️ Limitations

- **Demo Mode on Vercel:** The live demo runs with simulated 2-way dialog and TTS alerts. Full real-time analysis requires a running backend with a valid Gemini API key.
- **Browser Speech Synthesis:** Demo voice quality varies by browser/OS. When Gemini TTS is unavailable, falls back to browser speech synthesis.
- **English fallback:** 31 languages use English voice and alerts in demo. 9 languages have full native support (EN, ID, ZH, JA, KO, ES, FR, HI, AR).
- **Browser-only:** No native mobile or desktop clients yet.
- **Latency depends on network:** <80ms measured locally; 100-300ms over public internet with Cloud Run.
- **No persistent storage in demo:** Session reports use localStorage only.
- **Screen capture requires user consent:** Vision analysis is opt-in and desktop-only.
- **No brand names in demos:** All demo scripts use generic institution names to avoid trademark issues.
- **TTS voice availability:** Gemini TTS voice profiles may vary by region. The system gracefully falls back to browser speech synthesis if TTS is unavailable.
- **Audio recording in demo mode:** The REC button uses the browser MediaRecorder API with `createMediaStreamDestination`. Due to browser security restrictions, audio played through `new Audio()` (Gemini TTS) or `speechSynthesis` (browser TTS) cannot be captured by MediaRecorder because browsers do not allow recording their own audio output. To capture actual session audio, enable **Live Mic + REC** together so the microphone input is recorded directly. This is a browser platform limitation, not a bug in VoxGuard.
- **Live Mic requires HTTPS:** The `getUserMedia` API requires a secure context (HTTPS or localhost). The Vercel deployment and local dev server both satisfy this requirement.

## 🔮 Future Work

- **Native mobile app:** iOS and Android with platform-level call interception for always-on protection.
- **Carrier-level integration:** Deploying VoxGuard as an inline telecom network service.
- **Expanded pattern library:** Growing from 50 to 500+ patterns with global regional coverage.
- **On-device WASM inference:** Running scam classification directly in Rust WASM for offline-capable protection.
- **Community pattern submissions:** Crowd-sourced, continuously updated threat intelligence.
- **Enterprise API:** Hosted API for banks, telcos, and contact centers.
- **Real-time video deepfake detection:** Detect AI-generated video in video call scams.
- **Auto-detect call platform:** Automatically identify if user is on phone, Zoom, WhatsApp, or Teams.
- **Emotional contagion scoring:** Measure how the caller's emotional state transfers to the victim.
- **Intervention learning:** Track which intervention levels and challenge questions are most effective at stopping victims from complying with scammers, and adapt the system over time.
- **Full native support for all 40 languages:** Extend localized demo scripts, alerts, voice TTS, and intervention UI beyond the current 9 languages.
- **Expanded action agent:** Add more countries, integrate with local banking APIs for one-click account freeze, and provide follow-up reminder notifications.

---

## 👤 About the Creator

<div align="center">

<a href="https://x.com/wiqi_lee"><img src="https://img.shields.io/badge/-@wiqi__lee-000000?style=for-the-badge&logo=x&logoColor=white" alt="X"/></a>
<a href="https://discord.com/users/209385020912173066"><img src="https://img.shields.io/badge/-Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord"/></a>
<a href="https://github.com/wiqilee"><img src="https://img.shields.io/badge/-GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>
<a href="https://g.dev/wiqilee"><img src="https://img.shields.io/badge/-Google%20Developer-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="GDG"/></a>

</div>

**Wiqi Lee** - Data Scientist, AI/ML Researcher, Software Engineer, Cellist

Languages: Python, Java, Rust, Julia

Submitted to: **Gemini Live Agent Challenge 2026** `#GeminiLiveAgentChallenge`

> *"This is not a hackathon project. This is infrastructure for human safety."*

---

## 📖 Data Sources

| Source | URL | Usage |
|--------|-----|-------|
| FBI IC3 2024 Annual Report | [ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf](https://www.ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf) | Statistics ($16.6B), scam categories |
| FBI IC3 Annual Reports Index | [ic3.gov/annualreport/reports](https://www.ic3.gov/annualreport/reports) | All yearly reports archive |
| FTC Consumer Sentinel | [ftc.gov/enforcement/consumer-sentinel-network](https://www.ftc.gov/enforcement/consumer-sentinel-network) | Pattern taxonomy, linguistic markers |
| GASA Global Scam Report | [gasa.org](https://www.gasa.org) | Global $1T+ loss estimates |
| MAS ScamShield (SG) | [scamshield.org.sg](https://www.scamshield.org.sg) | Southeast Asian variants |
| ACCC ScamWatch (AU) | [scamwatch.gov.au](https://www.scamwatch.gov.au) | Australian variant patterns |
| OJK Indonesia | [ojk.go.id](https://www.ojk.go.id) | Indonesian financial authority patterns |
| Bareskrim Cyber (ID) | [patrolisiber.id](https://patrolisiber.id) | Indonesian cybercrime reporting |
| NPA Japan (警察庁) | [npa.go.jp](https://www.npa.go.jp) | Japanese ore-ore sagi patterns |
| FSS South Korea (금감원) | [fss.or.kr](https://www.fss.or.kr) | Korean voice phishing patterns |
| MHA India Cyber Crime | [cybercrime.gov.in](https://cybercrime.gov.in) | Indian digital arrest scam data |
| INCIBE Spain | [incibe.es](https://www.incibe.es) | Spanish cybersecurity incident data |
| PHAROS France | [internet-signalement.gouv.fr](https://www.internet-signalement.gouv.fr) | French online fraud reporting |
| SAMA Saudi Arabia | [sama.gov.sa](https://www.sama.gov.sa) | Saudi monetary authority fraud alerts |
| China National Anti-Fraud Center | [mps.gov.cn](https://www.mps.gov.cn) | Chinese anti-fraud app & public security data |
| Interpol Financial Crime | [interpol.int](https://www.interpol.int/en/Crimes/Financial-crime) | International scam pattern intelligence |

No proprietary or licensed data. No personal victim data. All examples reconstructed from published public reports.

---

## 🔒 Privacy and Ethics

- **No audio stored:** Processed in-stream, discarded immediately
- **No raw audio transmission:** Rust WASM sends only preprocessed feature vectors and transcripts
- **No TTS audio stored:** Voice intervention audio is generated on-demand and not persisted
- **Explicit screen consent:** Screen capture requires explicit user activation
- **No PII collection:** No personally identifiable information collected
- **No brand names:** Demo scripts use generic institution names
- **Intervention is protective, not punitive:** The system helps users make informed decisions. It never prevents them from continuing a call if they choose to after the verification challenge.

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**VOXGUARD 2026 · WIQI LEE · MIT LICENSE · [#GeminiLiveAgentChallenge](https://geminiliveagentchallenge.devpost.com)**

<a href="https://cloud.google.com"><img src="https://img.shields.io/badge/Powered%20by-Gemini%20Live%20API-4285F4?style=flat-square&logo=google" alt="Gemini"/></a> <a href="https://x.com/wiqi_lee"><img src="https://img.shields.io/badge/-@wiqi__lee-000000?style=flat-square&logo=x&logoColor=white" alt="X"/></a>

*Built to protect the people who need it most.*

</div>
