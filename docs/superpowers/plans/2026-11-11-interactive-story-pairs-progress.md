# SDD ledger — plan: docs/superpowers/plans/2026-11-11-interactive-story-pairs.md

Spec: docs/superpowers/specs/2026-11-11-interactive-story-pairs-design.md
Branch: feature/interactive-story-pairs
Baseline: a03e676. Original approved documents remain in f5d1701; original checkout untouched.

## Current scope and recovery point
The user clarified on 2026-11-11: “I will read aloud. No need to complicate this with audio generation and all”. The parent reads both editions. Play by Myself means the child operates activities with picture guidance and replayable visual demonstrations; it does not promise autonomous narration. This clarification amends the approved design and plan without reopening brainstorming or approval.

Audio generation, narration engines, packaged audio, listening/review/start gates and playback controls are removed. Tasks 1 and 5 are superseded, not pending or blocked. The unused validator and its dedicated tests are removed. The audio spike in authoring/interactive/audio-review.md is historical evidence only, with a superseded header; none of its commands or gates govern current work.

**Tasks8/9/10 in progress concurrently with disjoint ownership; Tasks2–4,6,7 complete reviewed. Tasks1/5 superseded.** Preserve eight pairs / sixteen experiences, distinct layered art, deterministic reducers, edition-specific saved runs, versioned verified offline downloads, accessibility, all consequence paths, physics checks and all thirteen legacy books. The Penguin Sound Post works through visual rhythms; parent-made sounds are optional. No new approval is required to continue the already authorized implementation. No push, merge or deployment is authorized.

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
- [x] Task 2: complete, reviewed; commits b3ba037, def05b1.
- [x] Task 3: complete, reviewed; commit 2a713d5.
- [x] Task 4: complete, reviewed; commit56a28fa.
- [x] Task 5: superseded by user clarification; no narrator implementation needed.
- [x] Task 6: complete, reviewed; commits22c9dc5,53301cd,c44e6ac.
- [x] Task7 complete d80323a reviewed.
- [ ] Task8 in progress /root/task8_experiments, base d80323a.
- [ ] Task9 in progress /root/task9_consequences, base d80323a.
- [ ] Task10 in progress /root/task10_discovery, base d80323a.
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

- Scope amendment committed ee874c7: parent reads both editions; Tasks 1 and 5 superseded. 97 tests passed.
- Task 2 started, base ee874c7; implementer /root/task2_packages; task-2-brief.md and task-2-report.md are local artifacts.
- Scope amendment independent review /root/scope_review: spec PASS, quality APPROVED, no material findings.
- Task 2 implementation b3ba037 (base ee874c7) ready; reviewer /root/task2_review pending. 112 unit tests, build passed. Report task-2-report.md; concrete shared contracts docs/interactive-story-authoring.md.
- Task 2: fix round 1/5 (1 addressed, 0 open — shared placement supply matching; commits b3ba037..def05b1). Reviewer approved scoped fix; 17 focused/115 full unit tests passed.
- Task 2: complete (commits ee874c7..def05b1, review clean).
- Task 3: started (base def05b1); next implementer owns state/progress only.
- Task 3: complete (commits def05b1..2a713d5, review clean). Reviewer /root/task3_review PASS/APPROVE. 14 focused,129 full unit tests pass. Report task-3-report.md. Runtime contract docs/interactive-story-authoring.md; use dispatch(run,pair,action).
- Task 4 started (base 2a713d5); transactional bundle store and browser tests.
- Task 4: complete (commits 2a713d5..56a28fa, review approved). 17 browser tests,129 unit tests,build pass. Reviewer /root/task4_review.
- Task 4 integration limits: cross-tab fallback without Web Locks unsupported; same realm coordinated. Actual production nested BASE_URL+SW test still required Task12 (current explicit-base fixture verifies URL/storage scope).
- Task 6 started (base 56a28fa); Task5 superseded. UI must guard late callbacks, show fallback/retry and retained old installed versions, preserve memory runs if storage denied.
- Task 6: fix round1/5 (1 addressed,0 open — settings/disclosure touch targets; commits53301cd..c44e6ac). Scope review approved, targeted portrait/landscape regression passed.
- Task 6: complete (commits56a28fa..c44e6ac, review clean). 49 browser checks +2 focused lifecycle/reduced fixes +1 target-size test;129 unit/build pass. Reviewer /root/task6_review. Full old-app SW upgrade,nested built UI,deferred reload remain Task12.
- Task 7 started (basec44e6ac); first real Bakery pair with real visual inspection required before review flags true.
- Task7 implementation d80323a ready for review /root/task7_review, base87b14c6; source/public Bakery8scenes/2editions,303899bytes,70SVG. 132unit+125full browser pass. Real controller/implementer image inspection recorded in task-7-report.md and bakery-evidence/. Corrections complete, flags attested after inspection.
- Task7: complete (commitd80323a, review /root/task7_review PASS/approved). Reviewer directly inspected completed/phone artwork, no material findings.
- Ruling: user explicitly authorized independent story delegation after framework/Bakery ready. Tasks8,9,10 run concurrently with disjoint story-specific generators/art/tests/packages; shared framework/catalog/tests remain controller coordinated. User execution instruction overrides default SDD serial-implementer guideline; each task still gets independent review.

Concurrency: controller grants build/browser and commit windows (shared dist/git index); story agents own disjoint category helper+generator+assets+tests only. Public catalog rebuilt during reserved windows; controller owns integration.
