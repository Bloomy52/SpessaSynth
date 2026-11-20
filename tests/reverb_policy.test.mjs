import assert from "node:assert/strict";
import test from "node:test";
import {
    BasicSoundBank,
    GeneratorTypes,
    MIDIControllers,
    SoundBankLoader,
    SpessaSynthProcessor
} from "spessasynth_core";

// Render the library's bundled fixture so no private MIDI/SF2 files are needed.
function createSynth(sfSend = 0) {
    const bank = SoundBankLoader.fromArrayBuffer(
        BasicSoundBank.getSampleSoundBankFile()
    );
    for (const item of [...bank.presets, ...bank.instruments]) {
        for (const zone of [item.globalZone, ...item.zones]) {
            zone.setGenerator(GeneratorTypes.reverbEffectsSend, null);
            zone.setGenerator(GeneratorTypes.chorusEffectsSend, null);
        }
    }
    bank.presets[0].zones[0].setGenerator(
        GeneratorTypes.reverbEffectsSend,
        sfSend
    );
    const synth = new SpessaSynthProcessor(22050);
    synth.soundBankManager.addSoundBank(bank, "fixture");
    return synth;
}

function render(synth) {
    const output = new Float32Array(22050 * 2);
    const right = new Float32Array(output.length);
    synth.noteOn(0, 60, 100);
    for (let offset = 0; offset < output.length; offset += 128) {
        if (offset === 4096) synth.noteOff(0, 60);
        const count = Math.min(128, output.length - offset);
        synth.process(output, right, offset, count);
    }
    return output;
}

function difference(a, b) {
    return a.reduce((energy, value, i) => energy + (value - b[i]) ** 2, 0);
}

test("unity reverb gain adds no reverb without MIDI or SF2 sends", () => {
    const dry = createSynth();
    dry.setSystemParameter("reverbGain", 0);
    const normal = createSynth();
    assert.equal(normal.systemParameters.reverbGain, 1);
    assert.ok(normal.midiChannels.every((c) => c.midiControllers[91] === 0));
    assert.equal(difference(render(normal), render(dry)), 0);
});

test("explicit MIDI CC91 produces reverb and CC91=0 removes its send", () => {
    const requested = createSynth();
    requested.controllerChange(0, MIDIControllers.reverbDepth, 100);
    assert.ok(difference(render(requested), render(createSynth())) > 0.001);
    const cancelled = createSynth();
    cancelled.controllerChange(0, MIDIControllers.reverbDepth, 100);
    cancelled.controllerChange(0, MIDIControllers.reverbDepth, 0);
    assert.equal(difference(render(cancelled), render(createSynth())), 0);
});

test("explicit SF2 reverb works even when MIDI CC91 is zero", () => {
    const requested = createSynth(700);
    assert.equal(requested.midiChannels[0].midiControllers[91], 0);
    assert.ok(difference(render(requested), render(createSynth())) > 0.001);
});

test("full MIDI resets clear sends; export snapshots preserve explicit sends", () => {
    const synth = createSynth();
    synth.controllerChange(0, MIDIControllers.reverbDepth, 80);
    const exported = createSynth();
    exported.applySnapshot(synth.getSnapshot());
    assert.equal(exported.systemParameters.reverbGain, 1);
    assert.equal(exported.midiChannels[0].midiControllers[91] >> 7, 80);
    for (const system of ["gm", "gs", "xg", "gm2"]) {
        synth.controllerChange(0, MIDIControllers.reverbDepth, 80);
        synth.reset(system);
        assert.ok(synth.midiChannels.every((c) => c.midiControllers[91] === 0));
        assert.equal(synth.systemParameters.reverbGain, 1);
    }
});
