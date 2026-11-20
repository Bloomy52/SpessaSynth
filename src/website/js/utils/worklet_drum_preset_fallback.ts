// Added by Louie (Bloomy52), 2026: Channel 10 preset fallback for audio worklets.
// Based on SpessaSynth by spessasus, licensed under Apache-2.0.

import type { SpessaSynthProcessor } from "spessasynth_core";
import { installDrumPresetFallback } from "./drum_preset_fallback.ts";

declare function registerProcessor<T>(
    name: string,
    processor: new (options: T) => AudioWorkletSynthesizer
): void;

interface AudioWorkletSynthesizer {
    readonly core: { readonly synthesizer: SpessaSynthProcessor };
}

export function registerSynthProcessor<T>(
    name: string,
    Processor: new (options: T) => AudioWorkletSynthesizer
) {
    registerProcessor(
        name,
        class extends Processor {
            public constructor(options: T) {
                super(options);
                installDrumPresetFallback(this.core.synthesizer);
            }
        }
    );
}
