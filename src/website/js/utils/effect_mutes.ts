// Added by Louie (Bloomy52), 2026: Global reverb and chorus mute logic.
// Based on SpessaSynth by spessasus, licensed under Apache-2.0.

export interface EffectMuteSettings {
    reverbMuted: boolean;
    chorusMuted: boolean;
    reverbGain: number;
    chorusGain: number;
}

export const DEFAULT_EFFECT_MUTES: EffectMuteSettings = {
    reverbMuted: false,
    chorusMuted: false,
    reverbGain: 1,
    chorusGain: 1
};

export type MutedEffectGain = "reverbGain" | "chorusGain";

/** Keeps the user's gain separate from the zero gain used for muting. */
export class EffectMutes {
    public readonly onChange: (() => void)[] = [];
    private state = { ...DEFAULT_EFFECT_MUTES };
    private readonly applyGain: (effect: MutedEffectGain, gain: number) => void;

    public constructor(
        applyGain: (effect: MutedEffectGain, gain: number) => void
    ) {
        this.applyGain = applyGain;
    }

    public get settings(): EffectMuteSettings {
        return { ...this.state };
    }

    public load(settings: Partial<EffectMuteSettings>) {
        for (const effect of ["reverbGain", "chorusGain"] as const) {
            const value = settings[effect];
            this.state[effect] =
                typeof value === "number" && Number.isFinite(value)
                    ? Math.max(0, Math.min(10, value))
                    : 1;
        }
        this.state.reverbMuted = settings.reverbMuted === true;
        this.state.chorusMuted = settings.chorusMuted === true;
        this.apply();
    }

    public isMuted(effect: MutedEffectGain): boolean {
        return effect === "reverbGain"
            ? this.state.reverbMuted
            : this.state.chorusMuted;
    }

    public setMuted(effect: MutedEffectGain, muted: boolean) {
        this.state[effect === "reverbGain" ? "reverbMuted" : "chorusMuted"] =
            muted;
        this.apply();
    }

    public setGain(effect: MutedEffectGain, gain: number) {
        if (!Number.isFinite(gain)) {
            return;
        }
        this.state[effect] = Math.max(0, Math.min(10, gain));
        this.apply();
    }

    private apply() {
        for (const effect of ["reverbGain", "chorusGain"] as const) {
            this.applyGain(
                effect,
                this.isMuted(effect) ? 0 : this.state[effect]
            );
        }
        for (const listener of this.onChange) {
            listener();
        }
    }
}
