# Changes from upstream

This repository is an unofficial fork of [SpessaSynth](https://github.com/spessasus/SpessaSynth)
by spessasus, which is licensed under the Apache License 2.0. It is not affiliated with or
endorsed by the upstream author.

This file records the modifications made in this fork, as required by Section 4(b) of the
Apache License 2.0. The original `LICENSE` and all upstream copyright notices are kept intact.

- **Upstream:** https://github.com/spessasus/SpessaSynth
- **Forked from commit:** `d7b0657606602bb2072b8e28900271f1762409bb`
- **Fork maintained by:** Louie ([@Bloomy52](https://github.com/Bloomy52))
- **Last updated:** 2026-11-20

## Summary

This fork adjusts SpessaSynth to work better with my own SoundFont and MIDI files. The main
changes are persistent global reverb and chorus mute controls, more faithful handling of effect
sends, and fixes for channel 10 preset lookup in melodic-only sound banks.

## Behavior differences from upstream

- **Global reverb and chorus mute:** added persistent global mute controls for reverb and
  chorus. The toggles live in the program settings, and their state is saved between sessions.
- **Effect sends:** MIDI and SoundFont effect sends are honored as authored, instead of being
  muted wholesale.
- **Channel 10 presets:** channel 10 presets now resolve correctly in sound banks that only
  contain melodic presets, in both the main thread and the audio worklet.

## Changes by commit

| Commit                 | Change                                                                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `024dec87`             | Fixed the reverb controls from the previous local edition. Superseded by the later codebase update and the follow-up commits below. |
| `8cf0f293`             | Fixed build issues.                                                                                                                 |
| `60a8701d`             | Fixed channel 10 preset resolution in melodic-only sound banks.                                                                     |
| `bbabdcd7`             | Aligned restored files with the installed synth libraries.                                                                          |
| `4880afc6`             | Fixed effect sends so MIDI and SoundFont values are honored without blanket muting.                                                 |
| `e09d1253`             | Added persistent global reverb and chorus mute controls.                                                                            |
| `cbed9c6b`, `2aa0398e` | Updated `.gitignore` (added `pwsh.log`) and `package.json`.                                                                         |
| `7324a3a1`             | Moved the reverb and chorus mute toggles into the program settings.                                                                 |

## Modified files

| File                                                                            | Change                                                  |
| ------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `src/server/saved_settings.ts`                                                  | Persist the reverb and chorus mute state                |
| `src/website/js/settings_ui/settings.ts`                                        | Reverb and chorus mute toggles in program settings      |
| `src/website/js/settings_ui/settings_html.ts`                                   | Settings markup for the effect mute toggles             |
| `src/website/js/settings_ui/saving/load_settings.ts`                            | Load the saved effect mute state                        |
| `src/website/js/settings_ui/saving/serialize_settings.ts`                       | Save the effect mute state                              |
| `src/website/js/synthesizer_ui/synthetizer_ui.ts`                               | Hook the effect mutes into the synthesizer UI           |
| `src/website/js/synthesizer_ui/methods/create_convolver_reverb_controller.ts`   | Reverb controller respects the global mute              |
| `src/website/js/synthesizer_ui/methods/create_gs_effect_controller.ts`          | GS effect controller respects the global mute           |
| `src/website/js/manager/manager.ts`                                             | Effect send handling, reverb fixes and build fixes      |
| `src/website/js/manager/worker.ts`                                              | Channel 10 preset fallback                              |
| `src/website/js/manager/export/render_audio_data.ts`                            | Channel 10 preset fallback during export                |
| `src/website/js/manager/export/utils/reverb_capture.ts`                         | Aligned with the installed synth libraries; build fixes |
| `src/build/build_script.ts`                                                     | Build changes for the drum preset fallback              |
| `src/website/locale/locale_en/settings/settings.ts`                             | English strings for the new settings                    |
| `src/website/locale/locale_en/synthesizer_controller/synthesizer_controller.ts` | English strings for the effect mute controls            |
| `package.json`, `package-lock.json`                                             | Dependency updates                                      |
| `.gitignore`                                                                    | Added `pwsh.log` and other ignored files                |

## Added files

| File                                                       | Purpose                                           |
| ---------------------------------------------------------- | ------------------------------------------------- |
| `CHANGES.md`                                               | This file.                                        |
| `src/website/js/utils/effect_mutes.ts`                     | Global reverb and chorus mute logic               |
| `src/website/js/utils/drum_preset_fallback.ts`             | Channel 10 preset fallback for melodic-only banks |
| `src/website/js/utils/worklet_drum_preset_fallback.ts`     | Same fallback, for the audio worklet              |
| `src/website/locale/locale_en/settings/effect_settings.ts` | English strings for effect settings               |
| `tests/effect_mutes.test.mjs`                              | Tests for the effect mutes                        |
| `tests/reverb_policy.test.mjs`                             | Tests for the effect send policy                  |

## Removed files

None.

## Per-file notices

Each modified source file carries a header comment like this:

```ts
// Modified by Louie (Bloomy52), 2026: <short description of change>.
// Based on SpessaSynth by spessasus, licensed under Apache-2.0.
```
