/* tslint:disable */
/* eslint-disable */

export class AudioPreprocessor {
    free(): void;
    [Symbol.dispose](): void;
    compute_energy(samples: Float32Array): number;
    dropped_count(): number;
    frame_count(): number;
    constructor();
    preprocess_chunk(samples: Float32Array): Float32Array;
    process(samples: Float32Array): string[];
    reset(): void;
    speech_ratio(): number;
}

export function init(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_audiopreprocessor_free: (a: number, b: number) => void;
    readonly audiopreprocessor_compute_energy: (a: number, b: number, c: number) => number;
    readonly audiopreprocessor_dropped_count: (a: number) => number;
    readonly audiopreprocessor_frame_count: (a: number) => number;
    readonly audiopreprocessor_new: () => number;
    readonly audiopreprocessor_preprocess_chunk: (a: number, b: number, c: number) => [number, number];
    readonly audiopreprocessor_process: (a: number, b: number, c: number) => [number, number];
    readonly audiopreprocessor_reset: (a: number) => void;
    readonly audiopreprocessor_speech_ratio: (a: number) => number;
    readonly init: () => void;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_drop_slice: (a: number, b: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
