# SDD ledger — plan: docs/superpowers/plans/2026-11-11-interactive-story-pairs.md

Spec: docs/superpowers/specs/2026-11-11-interactive-story-pairs-design.md
Branch: feature/interactive-story-pairs
Baseline: a03e676. Original approved documents remain in f5d1701; original checkout untouched.

## Current scope and recovery point
The user clarified on 2026-11-11: “I will read aloud. No need to complicate this with audio generation and all”. The parent reads both editions. Play by Myself means the child operates activities with picture guidance and replayable visual demonstrations; it does not promise autonomous narration. This clarification amends the approved design and plan without reopening brainstorming or approval.

Audio generation, narration engines, packaged audio, listening/review/start gates and playback controls are removed. Tasks 1 and 5 are superseded, not pending or blocked. The unused validator and its dedicated tests are removed. The audio spike in authoring/interactive/audio-review.md is historical evidence only, with a superseded header; none of its commands or gates govern current work.

**Resume at Task 2.** Preserve eight pairs / sixteen experiences, distinct layered art, deterministic reducers, edition-specific saved runs, versioned verified offline downloads, accessibility, all consequence paths, physics checks and all thirteen legacy books. The Penguin Sound Post works through visual rhythms; parent-made sounds are optional. No new approval is required to continue the already authorized implementation. No push, merge or deployment is authorized.

## Preflight after scope amendment
| Tasks | Shared contract / consistency | Finding |
|---|---|---|
| 1 | Former audio feasibility | Superseded; no dependency. |
| 2 | Schema, importer, renderer resolver | Next; reject executable content and validate art/text/guidance. |
| 3 | Pure actions and separate edition saves | Depends on Task 2 contracts. |
| 4 | Pinned verified caches and atomic pointers | Resolve art through pinned bundle; test base path and upgrades. |
| 5 | Former narration engine | Superseded; visual guidance replay belongs to Task 6. |
| 6 | Single-scene reader, legacy separation | Active scene owns controls and pending demonstrations; dispose on transitions. |
| 7 | Bakery full vertical slice | Extend package.mjs created in Task 2. |
| 8 | Experiments | Verify physics sources before authoring. |
| 9 | Consequences | Enumerate each of 64 routes for both pairs. |
| 10 | Discovery | Physical actions optional; visual rhythm tasks need no sound. |
| 11 | Collection | Includes second small-job pair; verify all 16 experiences. |
| 12 | Release verification | Final regression, measured bundles and review; no publishing. |
| 2 / 3–11 | Pair schema | Freeze and document validated shapes before consumers. |
| 2 / 4,6,7 | Resolver, packaging, catalog | Retain legacy defaults; no duplicate package helper. |
| 3 / 6,7–11 | Run/actions/derived states | Edition keys and early-edit confirmations remain consistent. |
| 6 / 7–11 | Controls, visual guidance and scene layers | Preserve completed actions when replaying demonstrations. |
| 7 / 8–11 | Generators, art helper, content tests | Story work follows the reviewed Bakery slice. |
| 1–11 / 12 | Evidence and authoring docs | Keep superseded work distinct from current completion evidence. |

## Tasks
- [x] Task 1: superseded by user clarification; abandoned tooling removed, not claimed as passed.
- [ ] Task 2: next — schema, importer and packaging; no audio gate.
- [ ] Task 3: pending Task 2.
- [ ] Task 4: pending preceding shared contracts.
- [x] Task 5: superseded by user clarification; no narrator implementation needed.
- [ ] Task 6: pending Tasks 2–4; includes replayable visual guidance.
- [ ] Task 7: pending Task 6; parent-read Bakery vertical slice.
- [ ] Task 8: pending working Bakery slice.
- [ ] Task 9: pending shared content foundations.
- [ ] Task 10: pending shared content foundations.
- [ ] Task 11: pending collection content.
- [ ] Task 12: pending all current implementation tasks and final review.

## Baseline and historical work
- Baseline npm ci completed (pre-existing glob deprecation warning); npm test: 97 passed, 0 failed.
- Baseline production build passed; browser regression: 89 passed (4.7m), 0 failed. Existing environment emits NO_COLOR/FORCE_COLOR conflict warning.
- Historical Task 1 partial tooling: commit 96a0a51 (base f5d1701), implementer /root/task1_audio; review /root/task1_review found no code findings in that partial work. Its 37 validator tests raised the then-suite to 134 passes. No perceptual review occurred and the old gate was not passed.
- The former listening limitation is superseded by the user’s removal of audio. Do not resume synthesis, request a listener or treat unreviewed disposable samples as a blocker.
- Tasks 2–12 application implementation has not started (Task 5 is now superseded). No application runtime, legacy book or deployed site changes. No push, merge or deployment performed.

## Scope amendment verification
- Fresh npm test after deleting the abandoned validator/test: 97 passed, 0 failed, 0 skipped (2026-11-11).
- git diff --check: passed. Active spec/plan audit found only explicit out-of-scope or superseded audio mentions; executable references remain solely inside the historical audio-review evidence.
- Spec/plan/task-number consistency reviewed: eight pair titles, sixteen experiences, all Tasks 1–12 retained, Tasks 1/5 superseded, Task 2 next. No application runtime changes; build/browser tests were not repeated for this documentation/tooling removal.
