import type {
    MIDIPatch,
    MIDISystem,
    SpessaSynthProcessor,
    SynthesizerPatch
} from "spessasynth_core";

export function installDrumPresetFallback(synth: SpessaSynthProcessor) {
    // The core's internal getPreset method is omitted from its published declarations.
    const manager = synth.soundBankManager as typeof synth.soundBankManager & {
        getPreset(
            patch: MIDIPatch,
            system: MIDISystem
        ): SynthesizerPatch | undefined;
    };
    const getPreset = manager.getPreset.bind(manager);
    manager.getPreset = (patch, system) => {
        const preset = getPreset(patch, system);
        // The virtual GS user kits need a real drum preset to supply samples.
        // With a melodic-only bank, continue to capital-tone fallback as in Cog.
        if (
            patch.isGMGSDrum &&
            preset &&
            "keyParams" in preset &&
            !manager.soundBankList.some(({ soundBank }) =>
                soundBank.presets.some((candidate) => candidate.isDrum)
            )
        ) {
            return getPreset({ ...patch, isGMGSDrum: false }, system);
        }
        return preset;
    };
}
