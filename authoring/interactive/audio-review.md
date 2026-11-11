# Interactive narration feasibility — 2026-11-11

**Task 1 is blocked at the listening/quality gate.** A free installed engine generated a small disposable sample; no actual audio-listening capability is exposed to this agent. No clip has been heard or approved. All seven real sample manifest entries remain `reviewed: false`. No production narration or independent edition is approved by this spike.

## Inventory and engine decision

Inventory checked executable locations with `shutil.which`, Python module availability without importing models, installed package names/data paths, and available tool names/descriptions. No credentials, environment dump, account configuration, or private voice recordings were read.

| Candidate | Actual availability and decision |
| --- | --- |
| eSpeak NG | CLI absent, but `/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1` and `/usr/lib/x86_64-linux-gnu/espeak-ng-data` installed, Debian packages `libespeak-ng1` / `espeak-ng-data` version `1.51+dfsg-12build1`. Selected for a disposable **technical sample only**, through its C API and Python standard-library `ctypes`. |
| Legacy eSpeak, Festival, Flite | No CLI found. Not selected. |
| Piper | No CLI or Python module found; no Piper cache/model found in the inspected locations. No model downloaded. |
| Kokoro / Coqui TTS / pyttsx3 | Python modules absent; not selected. Installed `torch` and `transformers` alone are not a voice engine/model. No bulk model installation attempted because it would not resolve listening. |
| Speech Dispatcher | Installed `0.12.0~rc2-2build3`, including `sd_espeak-ng`. It brokers speech backends; not a separate selected voice. MBROLA/Open JTalk modules present do not establish their voice data availability or rights; neither used. |
| Browser speech synthesis | Not selected: variable installed voices/offline availability cannot supply the required reliable packaged assets. |
| Connected synthesis/listening services | Rechecked available tool descriptions: no callable speech synthesis or audio-listening tool found. No paid or credential-dependent service used. |
| Local human recording | Supported by the manifest validator; no supplied recording or narrator permission was available in this task. |

The selected voice is `English (Great Britain)`, language `en-gb`, identifier `gmw/en`; 145 words/minute, volume 85, default pitch/range, explicit end pause. It is formant synthesis, with no downloaded neural model, MBROLA backend, cloned voice, or recorded speaker model. C API selection uses the voice's **name**; passing the language tag `en-gb` to `espeak_SetVoiceByName` returned an error. `espeak_ListVoices` confirmed the exact name and identifier before successful synthesis.

## Rights evidence

The installed package copyright files identify GPL-3.0-or-later for the relevant upstream engine/data. Primary upstream sources checked on 2026-11-11:

- [eSpeak NG 1.51 README](https://github.com/espeak-ng/espeak-ng/blob/1.51/README.md): formant synthesis and GPL version 3 or later.
- [eSpeak NG 1.51 license](https://github.com/espeak-ng/espeak-ng/blob/1.51/COPYING): GPL section 2 discusses when generated output is covered by the license.
- [eSpeak NG 1.51 C API](https://github.com/espeak-ng/espeak-ng/blob/1.51/src/include/espeak-ng/speak_lib.h): synchronous retrieval, voice selection, rate/volume, UTF-8 and end-pause flags.
- [GNU GPL output FAQ](https://www.gnu.org/licenses/gpl-faq.html#GPLOutput): output licensing depends on the output's contents.

Practical interpretation for this spike: synthesizing the original short text below with the built-in formant voice does not copy a supplied recording or redistribute the engine/data. GPL on a tool does not automatically license unrelated generated output. This is an interpretation of those primary terms, not an upstream voice-specific endorsement or an automated rights determination. No engine/data/model binaries or disposable audio are committed/distributed. A different voice/model or redistributed engine requires its own terms check. Preserve original-text and narrator permissions for recordings too. The validator requires a nonblank `license` attestation; it cannot establish that an attestation is correct.

The `web` tool failed with a proxy error, so primary documents were fetched successfully over HTTPS using Python `urllib.request`; no third-party summary supplied the rights conclusion.

## Reproduce the disposable sample

Run from the repository root on this Linux environment. This uses the already installed library and Python standard library, writes ignored local artifacts only, and never opens a playback device. No installation or credentials are needed.

```bash
python3 - <<'PY'
import ctypes as c
import ctypes.util
import json
from pathlib import Path
import wave

root = Path('authoring/interactive/.audio-samples')
root.mkdir(parents=True, exist_ok=True)
engine = c.CDLL(ctypes.util.find_library('espeak-ng'))
engine.espeak_Initialize.argtypes = [c.c_int, c.c_int, c.c_char_p, c.c_int]
engine.espeak_SetVoiceByName.argtypes = [c.c_char_p]
engine.espeak_SetParameter.argtypes = [c.c_int, c.c_int, c.c_int]
engine.espeak_Synth.argtypes = [c.c_void_p, c.c_size_t, c.c_uint, c.c_int,
                               c.c_uint, c.c_uint, c.c_void_p, c.c_void_p]
callback_type = c.CFUNCTYPE(c.c_int, c.POINTER(c.c_short), c.c_int, c.c_void_p)
engine.espeak_SetSynthCallback.argtypes = [callback_type]
engine.espeak_SetSynthCallback.restype = None
sample_rate = engine.espeak_Initialize(2, 0, None, 0x8000)  # synchronous retrieval, no playback
assert sample_rate > 0
assert engine.espeak_SetVoiceByName(b'English (Great Britain)') == 0
assert engine.espeak_SetParameter(1, 145, 0) == 0  # words per minute
assert engine.espeak_SetParameter(2, 85, 0) == 0   # volume
chunks = []
@callback_type
def receive(samples, count, events):
    if samples and count:
        chunks.append(c.string_at(samples, count * 2))
    return 0
engine.espeak_SetSynthCallback(receive)
texts = [
    ('welcome', 'Welcome to Amara\u2019s Busy Bakery. Let\u2019s get ready for breakfast.'),
    ('instruction', 'Tap one plate. Then choose a treat for your guest.'),
    ('choice-a', 'Choose the round bun.'),
    ('choice-b', 'Choose the star biscuit.'),
    ('feedback', 'You found the round bun. Put it on the plate.'),
    ('recap', 'You chose a round bun, so your guest has a round treat for breakfast.'),
    ('names', 'Amara. Bolt. Tavi. Mina. Nori. Zuri. Imani.'),
]
entries = []
try:
    for clip_id, text in texts:
        chunks.clear()
        encoded = text.encode('utf8') + b'\0'
        assert engine.espeak_Synth(encoded, len(encoded), 0, 1, 0, 1 | 0x1000, None, None) == 0
        filename = clip_id + '.wav'
        with wave.open(str(root / filename), 'wb') as output:
            output.setnchannels(1)
            output.setsampwidth(2)
            output.setframerate(sample_rate)
            output.writeframes(b''.join(chunks))
        entries.append(dict(id=clip_id, text=text, file=filename,
            voice='en-gb (English, Great Britain)', provider='local eSpeak NG 1.51, formant synthesis',
            license='Engine/data GPL-3.0-or-later; original sample text; generated output interpretation: see audio-review.md. No MBROLA/model recordings.',
            reviewed=False))
finally:
    engine.espeak_Terminate()
(root / 'manifest.json').write_text(json.dumps(entries, indent=2) + '\n')
print('Generated', len(entries), 'unreviewed WAV clips at', sample_rate, 'Hz')
PY
```

The recap is one complete sentence for a selected branch, not words assembled into a sentence. The extra `names` clip probes every proposed named protagonist; the penguin crew has no individual name in the approved proposal. These are disposable feasibility lines, not authored production story content.

Optional reproducible MP3 encoding, using the installed FFmpeg encoder:

```bash
python3 - <<'PY'
from pathlib import Path
import subprocess
for source in Path('authoring/interactive/.audio-samples').glob('*.wav'):
    subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-loglevel', 'error',
                    '-y', '-i', str(source), '-c:a', 'libmp3lame', '-b:a', '64k',
                    '-ac', '1', str(source.with_suffix('.mp3'))], check=True)
PY
```

WAV is mono, 16-bit PCM at 22,050 Hz. MP3 is mono at 64 kbps. The WAV sample manifest intentionally stays unreviewed; `node scripts/interactive/audio.mjs validate authoring/interactive/.audio-samples/manifest.json` exits 1 with `Clip welcome: reviewed must be true after listening to this exact clip`. Do not change flags to obtain a passing command.

## Measured technical evidence

The actual files were decoded with Chrome `AudioContext.decodeAudioData` through Playwright, network requests blocked. This measures compatibility/duration only. It does **not** mean the agent listened, checked transcript correctness, approved pronunciation, or assessed clipping/silence/warmth. Small sub-millisecond WAV/MP3 timing differences can arise from decoder resampling/encoder padding.

| Clip | WAV bytes | MP3 bytes | MP3 browser duration | Listening status |
| --- | ---: | ---: | ---: | --- |
| welcome | 203,998 | 37,869 | 4.626 s | Pending |
| instruction | 172,316 | 32,017 | 3.906 s | Pending |
| choice-a | 76,710 | 14,672 | 1.738 s | Pending |
| choice-b | 82,384 | 15,717 | 1.867 s | Pending |
| feedback | 155,480 | 28,883 | 3.525 s | Pending |
| recap | 210,400 | 38,914 | 4.770 s | Pending |
| names | 270,212 | 49,781 | 6.126 s | Pending |
| **Total** | **1,171,500** | **217,853** | **26.559 s** | **None reviewed** |

Six story clips excluding the name probe: 901,288 WAV bytes; 168,072 MP3 bytes; 20.432 seconds. At this measured average, 100 similarly sized clips would use about 2,801,200 bytes (2.67 MiB). A separate duration-based estimate of 12 minutes at 64 kbps is 5,760,000 payload bytes (5.49 MiB), plus per-file/container overhead. These are planning assumptions, not an authored full-pair measurement. The approved **15 MiB per-pair target includes artwork and interactions**; actual final clip counts, all endings, acceptable spoken quality/encoding, and bundle bytes must be measured later. No complete pair exists from this task.

## Validator contract

```bash
node scripts/interactive/audio.mjs validate path/to/manifest.json
```

Manifest is a nonempty JSON array. Each entry is `{id,text,file,voice,provider,license,reviewed}`. All six text fields must be nonblank strings; IDs must be unique; `reviewed` must be boolean `true` after listening to that exact file. `provider` may be `local recording`, with narrator/consent details in `voice` and `license`; synthesis is not required. Files are relative to the manifest directory. Use simple local paths, for example `clips/welcome.mp3`; no absolute paths, traversal, URLs, backslashes, encoded paths, or symlinks. Supported filename extensions are WAV, MP3, OGG, M4A, WEBM; the actual bytes must decode in Chrome to finite positive-duration audio regardless of the filename.

The command reads assets without modifying them, checks every metadata attestation, then actually decodes the bytes in headless Chrome. It prints clip count, total bytes, and summed decoded duration; invalid manifests/media exit 1. Browser setup follows the repository convention: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`, otherwise `/usr/bin/google-chrome`, otherwise installed Playwright Chromium. Browser absence fails explicitly rather than skipping validation. These technical checks establish neither perceptual quality nor playback support on every target device. Unit fixtures use a generated PCM tone and fictional test-only reviewed metadata; they are not reviewed speech assets.

## Required unblock path

An actual listener must hear **every final encoded clip**, including both choices and the conditional recap, and record listener/date/file identity plus notes for warmth, all proposed name pronunciations, word accuracy, pauses, speed, clipping, and ending silence. All these quality checks remain pending here. Use the local files above, regenerate with the documented command, or supply recordings with original-text and narrator redistribution permission. If this voice is unacceptable, select an authorized alternative with checked voice/model terms, or use a consenting narrator. Regenerate/re-record rejected clips and listen again; edits or re-encoding require review of the final bytes. Only that evidence permits setting the corresponding `reviewed` values to true and rerunning the CLI. Do not bulk-author independent editions or claim Task 1 passed before this listening gate is satisfied.
