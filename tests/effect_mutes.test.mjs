import assert from "node:assert/strict";
import test from "node:test";
import { SpessaSynthProcessor } from "spessasynth_core";
import { EffectMutes } from "../src/website/js/utils/effect_mutes.ts";

function setup() {
    const synth = new SpessaSynthProcessor(22050);
    const mutes = new EffectMutes((effect, gain) =>
        synth.setSystemParameter(effect, gain)
    );
    return { synth, mutes };
}

test("mute switches are independent and restore the previous gain", () => {
    const { synth, mutes } = setup();
    mutes.setGain("reverbGain", 0.65);
    mutes.setGain("chorusGain", 0.4);
    mutes.setMuted("reverbGain", true);
    assert.equal(synth.systemParameters.reverbGain, 0);
    assert.equal(synth.systemParameters.chorusGain, 0.4);
    mutes.setMuted("chorusGain", true);
    mutes.setMuted("reverbGain", false);
    assert.equal(synth.systemParameters.reverbGain, 0.65);
    assert.equal(synth.systemParameters.chorusGain, 0);
    mutes.setMuted("chorusGain", false);
    assert.equal(synth.systemParameters.chorusGain, 0.4);
});

test("editing a muted gain keeps it muted and restores the new gain", () => {
    const { synth, mutes } = setup();
    mutes.setMuted("reverbGain", true);
    mutes.setGain("reverbGain", 0.25);
    assert.equal(synth.systemParameters.reverbGain, 0);
    assert.equal(mutes.settings.reverbGain, 0.25);
    mutes.setMuted("reverbGain", false);
    assert.equal(synth.systemParameters.reverbGain, 0.25);
});

test("saved preferences round-trip without losing the unmuted gains", () => {
    const { mutes } = setup();
    mutes.setGain("chorusGain", 0.35);
    mutes.setMuted("chorusGain", true);
    const saved = JSON.parse(JSON.stringify(mutes.settings));
    const reopened = setup();
    reopened.mutes.load(saved);
    assert.equal(reopened.synth.systemParameters.reverbGain, 1);
    assert.equal(reopened.synth.systemParameters.chorusGain, 0);
    reopened.mutes.setMuted("chorusGain", false);
    assert.equal(reopened.synth.systemParameters.chorusGain, 0.35);
});

test("legacy settings remain unmuted; invalid gains are sanitized", () => {
    const { synth, mutes } = setup();
    mutes.load({});
    assert.equal(synth.systemParameters.reverbGain, 1);
    assert.equal(synth.systemParameters.chorusGain, 1);
    mutes.load({ reverbGain: Number.NaN, chorusGain: -1 });
    assert.equal(synth.systemParameters.reverbGain, 1);
    assert.equal(synth.systemParameters.chorusGain, 0);
});

test("MIDI resets preserve global mutes and export snapshots carry them", () => {
    const { synth, mutes } = setup();
    mutes.setMuted("reverbGain", true);
    mutes.setMuted("chorusGain", true);
    for (const system of ["gm", "gs", "xg", "gm2"]) {
        synth.reset(system);
        synth.controllerChange(0, 91, 127);
        synth.controllerChange(0, 93, 127);
        assert.equal(synth.systemParameters.reverbGain, 0);
        assert.equal(synth.systemParameters.chorusGain, 0);
    }
    const exported = new SpessaSynthProcessor(22050);
    exported.applySnapshot(synth.getSnapshot());
    assert.equal(exported.systemParameters.reverbGain, 0);
    assert.equal(exported.systemParameters.chorusGain, 0);
    assert.equal(exported.midiChannels[0].midiControllers[91] >> 7, 127);
    assert.equal(exported.midiChannels[0].midiControllers[93] >> 7, 127);
});
