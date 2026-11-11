# Eight Interactive Story Pairs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add eight distinct interactive stories, each with Together and Play by Myself editions, while preserving all thirteen existing books.

**Architecture:** A separate declarative pair format and single-scene reader share the existing illustration renderer and speed preferences. Pure reducers own activity and consequence state; an audio controller owns spoken guidance. Versioned, verified on-demand bundles keep narration and all possible endings available offline without enlarging the core precache indiscriminately.

**Tech Stack:** Existing JavaScript ES modules, Vite, DOM/SVG, Node24, node:test and Playwright; Cache Storage plus IndexedDB for committed bundle pointers; local compressed audio files. No backend, account, microphone or paid service assumed.

**Spec:** `docs/superpowers/specs/2026-11-11-interactive-story-pairs-design.md` (approved).

## Global Constraints
- Eight pairs / sixteen experiences; eight new shelf cards, twenty-one total. Keep the existing thirteen books unchanged.
- Together and Play by Myself differ in scaffolding and spoken support. No reading required for independent activities.
- Do not reuse Mouse, Pip/Owl, Rabbit, Bear or the established cast. Each pair gets a distinct visual world.
- Target eight scenes for tasks/experiments/discovery; six binary decision scenes plus one ending for each consequence story (64 routes each).
- No timers, scores, streaks, mandatory physical tasks or automatic next-story playback.
- Every drag has a tap-select/tap-place and keyboard equivalent. New editions show one active scene in every orientation.
- Decorative motion loops; completed actions and consequences do not undo themselves on a loop. Preserve motion speed settings and reduced-motion equivalents.
- Local spoken audio is mandatory for independent mode; no browser speech synthesis as the primary delivery.
- Download target <=15 MiB per pair. Show measured size and only declare readiness for a fully verified bundle.
- Do not publish or merge as part of plan execution without user instruction. Preserve existing work. At execution start create an isolated branch/worktree; commit completed reviewed tasks there.

## Review Focus
1. A delayed download/audio callback after leaving a scene must not revive sound or commit obsolete UI (Tasks4–6).
2. Changing an early choice or switching editions must not produce an ending from mixed runs (Tasks3,6).
3. A stale service worker, nested GitHub Pages base URL or interrupted upgrade must not strand a downloaded story (Tasks4,6,12).
4. A child taps repeatedly or turns while dragging: accept actions once, with no ghost actions from hidden scene copies (Tasks3,6).
5. A muted/blocked-audio or reduced-motion session must still explain tasks and outcomes; independent mode must not silently pretend missing narration is available (Tasks5–7).

## File map and shared contracts
Create `src/interactive/{schema,state,progress,bundles,narration,activities,reader,shelf}.js`; each owns respectively validation, pure transitions, saved runs, downloads, audio lifecycle, activity controls, scene presentation, and edition/download selection. Existing `src/main.js` mounts/disposes the separate reader; `src/reader.js` remains the legacy reader. Add `src/interactive/style.css` scoped under `.interactive-reader`.

Create `scripts/interactive/{catalog,prepare-pair,audio,package,art}.mjs`, `scripts/interactive/stories/<pair-id>.mjs`, `authoring/interactive/<pair-id>/`, and `public/interactive/`. Keep interactive packages outside `public/books` so legacy catalog discovery and all-book loop tests still address legacy books correctly. The public interactive catalog contains only summaries/covers/bundle references, not every scene or audio file. Add catalog generation to dev/build scripts.

`Pair`: `{schemaVersion:1,id,version,title,category,credit,cover,scenes,editions:{together,independent},endings,assets}`. Scene has stable id, narrative, alt, background/layers/tracks compatible with `createIllustration`, and optional activity. Activity is one of `place`, `experiment`, `choice`, `discover`; all rules are declarative and bounded. Editions contain instruction, feedback and clip references by scene. `assets` lists relative paths, SHA256, bytes and media type. `Summary` contains id/version/title/category/credit/cover URL, bundle manifest URL and total bytes.

`Run`: `{schemaVersion:1,pairId,pairVersion,edition,sceneId,actions,trials,completed}`. Store child actions, derive effects; never persist rendered DOM or arbitrary executable content. Use `edition='together'|'independent'` consistently. Saves are keyed by pair and edition; switching does not copy decisions between editions.

`dispatch(run,pair,action) -> {run,effects}` is pure. Actions: PLACE, PREDICT, TEST, RETRY, CHOOSE, DISCOVER_DONE, NAVIGATE, CONFIRM_CHANGE, RESTART. `deriveScene(pair,run) -> {text,visibleLayers,activity,clips}`; `deriveEnding(pair,run) -> {text,visibleLayers,recap,clips}`. Effect descriptors only request narration, transition or a confirmation; they never execute code.

`createNarrator({resolveAsset,onStatus}) -> {startFromGesture(),play(clips),repeat(),pause(),mute(value),stop(),destroy()}`. Resolve assets using the pinned bundle version, not mutable latest URLs.

`createBundleStore({baseUrl}) -> {status(summary),install(summary,{onProgress,signal}),open(pairId,version),remove(pairId,version)}`. `open` returns `{pair,resolveAsset,dispose}`; resolved media URLs are local object URLs from the verified cache. Bundle pointers use IndexedDB transactions. All caches and storage are scoped to this application base path.

## Task 1: Prove spoken-audio production before bulk authoring
**Files:** create `scripts/interactive/audio.mjs`, `authoring/interactive/audio-review.md`; test `tests/interactive-audio-manifest.test.mjs`.
**Produces:** CLI `node scripts/interactive/audio.mjs validate <manifest>` and a documented reproducible generation command using an available authorised voice engine. Manifest entries: `{id,text,file,voice,provider,license,reviewed}`.
- [ ] Inventory available local speech engines and callable synthesis tools without reading/exposing secrets. No speech tool is currently exposed by name; recheck at execution. Verify redistribution terms before choosing a voice/model.
- [ ] Generate a short non-production sample: welcome, instruction, two choices, feedback and a conditional recap. Listen to every clip; check warmth, pronunciation of proposed names, pauses, speed and ending silence. Record actual provider/model/voice/rights and reproducible commands. Never mark audio reviewed based on file existence alone.
- [ ] Write failing validation cases for missing text/file, absent rights/review, invalid path, corrupt media and duplicate clip id. Run `node --test tests/interactive-audio-manifest.test.mjs` (red).
- [ ] Implement manifest validation and browser media decode/duration verification; accept locally supplied reviewed recordings too. Run the test (green). Record sample bytes and estimate full-pair size.
- [ ] If no acceptable authorised voice exists, report that precise blocker; do not bulk-author independent editions or claim this gate passed. Otherwise commit the feasibility tooling/evidence, excluding disposable samples.

## Task 2: Validate and package interactive stories separately
**Files:** create `src/interactive/schema.js`, `scripts/interactive/{prepare-pair,package,catalog}.mjs`; modify `src/illustration.js`; tests `tests/interactive-schema.test.mjs`, `tests/interactive-package.test.mjs`.
**Produces:** `validatePair(pair) -> pair`, `pairAssets(pair) -> string[]`, `checkPair(folder)`, `installPair(folder,root='public/interactive')`; illustration accepts optional `resolveAsset(file)` retaining legacy bookId behavior.
- [ ] Build minimal fixtures; assert rejection of unknown interaction kinds, missing choice effects/audio, invalid scene references, unsafe SVG/path/symlink, duplicate asset ids, script/function rules, invalid conditional expressions and unreviewed provenance/art/audio. Run the two tests (red).
- [ ] Implement explicit bounded predicates (equals, all, any), whitelisted effects, source/visual/audio review records and independent asset decoding/hash checks. Reuse/extract existing importer safety logic rather than weakening it. Stage and atomically install packages; never overwrite a published version in place.
- [ ] Build versioned output `public/interactive/<id>/<version>/...`; catalog includes summaries and lightweight covers. Add optional illustration resolver without changing legacy outputs. Run new tests plus `node --test tests/book-workflow.test.mjs tests/story.test.mjs` (green).
- [ ] Commit schema/importer/renderer extension after review.

## Task 3: Deterministic interactions, consequences and saved runs
**Files:** create `src/interactive/{state,progress}.js`; tests `tests/interactive-state.test.mjs`, `tests/interactive-progress.test.mjs`.
**Consumes/produces:** Pair/Run and reducer contracts above; `createRun(pair,edition)`, `loadRun(storage,pair,edition)`, `saveRun(storage,run)`.
- [ ] Write failing cases: placements change quantities exactly once; TEST requires PREDICT; retry retains trial history; choice effects persist; early-choice edit requests confirmation before clearing dependent actions; back navigation preserves choices; edition saves do not mix; corrupt/obsolete saves offer safe restart; denied storage keeps memory session working. Run both tests (red).
- [ ] Implement reducers without random outcomes. Return effect descriptors; derive all visual/results state from validated actions. Reject duplicate/out-of-order actions and unknown ids. NAVIGATE cannot silently assign unanswered choices. RESTART clears only the selected edition.
- [ ] Add a six-decision fixture; enumerate all64 bit patterns and assert expected effects and recap coverage for each decision, including a repair overriding its earlier consequence without losing explanation. Assert identical run+action produces identical output and input objects remain unchanged.
- [ ] Run both tests (green); commit reviewed reducer/storage module.

## Task 4: Transactional offline bundles
**Files:** create `src/interactive/bundles.js`; modify `vite.config.js`; tests `tests/browser/interactive-downloads.spec.js`.
**Produces:** createBundleStore contract above; status distinguishes not-downloaded/downloading/ready/update-available/error and reports verified bytes.
- [ ] Add fixture browser tests: offline before download, complete offline opening, abort halfway, hash mismatch, quota failure, concurrent installs, failed v2 preserving v1, removal, storage eviction and nested base path. Assert no ready state until every asset verifies. Run targeted Playwright test (red).
- [ ] Download to versioned staging caches, verify hashes/lengths, then transactionally publish the version pointer. Retain a complete older version on failure; pin open readers until dispose. On open verify asset presence and degrade to retry/download if eviction occurred. Revoke object URLs on dispose.
- [ ] Exclude versioned interactive bundles from Workbox precache; include only catalog/covers and core code. Content-hashed immutable versions use direct fetch/cache storage without accidentally reading an old precached catalog. Catalog update failure retains existing usable metadata. Defer cache deletion while a reader pins that version.
- [ ] Run targeted test with production build; assert thirteen legacy books still fully precached, undownloaded pair audio absent, downloaded pair works offline. Commit.

## Task 5: Narration with explicit playback ownership
**Files:** create `src/interactive/narration.js`; tests `tests/browser/interactive-narration.spec.js`.
**Consumes:** pinned bundle resolveAsset and reviewed clip sequences. **Produces:** createNarrator contract above and status idle/playing/paused/blocked/error.
- [ ] Test rejected autoplay, repeat, mute/unmute, scene change mid-clip, delayed old play promise, backgrounding, user pause, disposal and broken media. Assert at most one clip plays and no stale clip resumes. Run targeted test (red).
- [ ] Implement a generation token for every play request and one active audio element. Gesture unlock, captions, retry feedback and deterministic clip queues; stop on visibility loss and require explicit resume rather than surprising speech. Animation speed never changes narration speed.
- [ ] Test complete conditional sentence clips in correct order, offline playback and visible fallback for blocked playback. Missing mandatory assets blocks independent start, while a playback error after start offers retry or Together with explanatory visuals. Run test (green); commit.

## Task 6: Edition shelf, activity controls and single-scene reader
**Files:** create `src/interactive/{activities,reader,shelf}.js`, `src/interactive/style.css`; modify `src/main.js`, `src/illustration.js`, `package.json`; tests `tests/browser/interactive-reader.spec.js`, `tests/browser/interactive-shelf.spec.js`.
**Interfaces:** `mountInteractiveReader({root,pair,bundle,run,onSave,onExit,speedForPage}) -> {destroy()}`; `renderActivity({activity,view,onAction}) -> {element,destroy()}`. Existing speed resolver uses pair id plus stable scene index; no new settings hierarchy.
- [ ] Test eight paired cards vs sixteen duplicates; download size/status; edition selection; one active scene in landscape/portrait; taps/keyboard equivalent to drag; double taps execute once; activity gestures do not turn pages; back/edit confirmation; resume/restart; exit stops audio; mute/reduced motion keeps outcome legible. Use a minimal fixture catalog initially. Run targeted tests (red).
- [ ] Mount interactive path separately from legacy session/reader. Active scene controls only, one narration owner, event listeners disposed on every transition. Add scene-state layer visibility to illustration controller through a documented `setLayerVisibility(ids)` method defaulting to all layers; static reduced-motion rendering uses composed visible layers so it reflects choices too. Never hide critical interaction state inside decorative motion.
- [ ] Integrate existing fullscreen/wake lock/speed controls. Together has four optional discussion prompts (two literal, one feeling, one personal), with valid scene hints; independent ends in spoken recap and finish/replay controls. Physical activity alternatives remain visible. Touch targets >=48CSSpx, visible focus, accessible labels/live outcome messages, no colour-only instructions.
- [ ] Show a visible bookshelf update action outside collapsed install details. Check for updates on returning online/focusing the shelf; defer reload while reading. Test old-service-worker upgrade to new catalog without clearing progress, plus update failure. Existing cached clients get this behavior after accepting their first update.
- [ ] Run targeted tests plus existing reading/fullscreen/animation-setting tests; commit.

## Task 7: Complete Amara’s Bakery as the first paired story
**Files:** create `scripts/interactive/{art,package}.mjs` (extend package helper from Task2), `scripts/interactive/stories/amaras-busy-bakery.mjs`, authoring/public package; test `tests/interactive-content.test.mjs`.
**Produces:** first real Pair, eight scenes, both editions, fully reviewed audio/art.
- [ ] Write independent expected content checks: eight scenes, orders use1–5 items, pictured quantities match requested/placed totals, exactly two editions, required narrated instructions/options/feedback, truthful credits. Run test (red).
- [ ] Author opening, six purposeful preparation scenes and welcome-breakfast ending. Three concrete activity types: fill pictured order, match item, pack group. Together invites discussing arrangements; independent demonstrates then gives one-step prompts. No heat/cooking tasks.
- [ ] Generate layered art and approved local audio; all review flags default false. Inspect all rest/moving/task-result states and listen to every clip. Mark reviewed only after corrections; install via Task2.
- [ ] Run importer, content tests and full paired journey online/offline/phone/reduced-motion. Measure bundle size against15MiB. Produce screenshots and an audible preview for user review without making it an unnecessary new approval gate. Commit working slice.

## Task 8: Prediction and experimentation pairs
**Files:** create generators/packages `tavis-dinosaur-ramp-rally`, `mina-and-the-shadow-stage`; extend content tests and `tests/browser/interactive-experiments.spec.js`.
- [ ] Write independent expectations for predictions before trials, only one variable changing, repeatable outcomes, comparison of trials, and no correctness scoring. Run tests (red).
- [ ] Verify mechanics against authoritative physics references; record sources in editorial notes. Ramp comparisons fix cart/surface and label model illustrative. Shadow comparisons fix light/screen while varying puppet distance, avoiding ambiguous geometry.
- [ ] Author eight scenes per pair with a shared purpose and ending. Narrate choices and observations, not praise for guessing correctly. Produce distinct dinosaur-track and human-theatre artwork and all audio.
- [ ] Review every experiment outcome, all clips and three later decorative loops at .5/1/2 speed; install reviewed versions. Run content/browser tests and record bundle sizes; commit each pair separately.

## Task 9: Two cumulative consequence stories
**Files:** generators/packages `noris-seaside-picnic`, `zuris-rooftop-garden`; tests `tests/interactive-consequences.test.mjs`, `tests/browser/interactive-consequences.spec.js`.
- [ ] Write independent expected maps for six decisions/two options each, immediate state changes, eventual impact, repair dependencies and recap references. Enumerate64 paths per story before authoring endings. Run tests (red).
- [ ] Author six decision scenes plus one final scene for each. First decision is part of the opening. Ending includes three recap beats covering all six choices; compose complete clauses/sentences and matching layers. Each choice matters; no random punishment, threats or good/bad-child labels.
- [ ] Picnic decisions cover practical preparations, place/sharing/cleanup with safe authored weather. Garden decisions show trade-offs for visitors, plants, shade/paths/water and explicitly advance days for growth. Include at least one later repair per story.
- [ ] Validate all128 route outcomes and narration references automatically. Visually inspect every distinct consequence layer combination where overlap is possible, every distinct ending sentence/clip, plus representative full routes covering each decision and repair. Back-edit tests recompute outcomes and clear future dependent answers.
- [ ] Install after review; run both test files, offline representative routes and bundle measurement; commit each pair.

## Task 10: Real-world discovery pairs
**Files:** generators/packages `imani-and-the-lost-shape-map`, `the-penguin-sound-post`; tests `tests/browser/interactive-discovery.spec.js` and content tests.
- [ ] Test each physical prompt has an on-screen alternative and can be skipped without penalty; no timer/permission/upload; muted sound tasks have visual rhythm equivalents. Run tests (red).
- [ ] Author eight scenes each. Shape island progresses through map clues to nearby-object observations. Sound post uses quiet listening/clapping/repeating patterns to deliver messages. Required physical help is spoken before activity, not hidden in parent copy.
- [ ] Make both editions complete with zero household materials. Together encourages conversation; independent demonstrates the equivalent screen activity. Review media, prompts, alt text and optional transitions; install.
- [ ] Run content/discovery/offline tests, inspect phone targets and measure bundles; commit each pair.

## Task 11: Bolt’s repair story and collection consistency
**Files:** generator/package `bolt-and-the-toy-parade`; content tests; `tests/browser/interactive-collection.spec.js`.
- [ ] Assert exactly eight ids and both editions per id, category counts2/2/2/2, distinct covers, required narration coverage and absence of old cast. Assert21 shelf cards alongside all13 legacy stories. Run tests (red).
- [ ] Author Bolt’s eight scenes with three toy repairs, clear size/shape matches and a visible final parade reflecting completed repairs. Do not clone bakery composition or replace counting labels with parts.
- [ ] Review/install Bolt; review all16 complete experiences for pacing and distinct scaffolding, proper captions, useful hints and easy stopping. Exercise .5/1/2 motion and reduced motion on every new scene/outcome.
- [ ] Run collection/content tests and full browser journeys. Confirm no pair exceeds budget without a recorded optimisation/exception decision; commit.

## Task 12: Documentation, independent review and release readiness
**Files:** modify README.md, docs/assisted-book-workflow.md, docs/another-ai-handoff.md, Implementation_Details/book-sources.md; create `docs/interactive-story-authoring.md`, `docs/interactive-story-validation.md`; update CI only if new catalog/test commands require it.
- [ ] Document authoring schema, reviewed audio provenance, consequence truth tables, edition differences, bundle versioning, download/update behavior, progress reset semantics and maintenance commands. Counts:21 titles;13 legacy plus8 paired; sixteen interactive experiences, not sixteen unrelated new books.
- [ ] Add automated fixture upgrade test: install released legacy build, navigate offline, return online, accept new build, discover pair catalog, download/reopen and preserve prior completion preferences. Test GitHub Pages nested base path and failure/retry.
- [ ] Run `npm run check` on final code and content, `git diff --check`, importer checks for every new pair, audio manifest checks and bundle report. Require zero failures; record totals and measured sizes, not estimates.
- [ ] Review on actual available touch hardware; if none available, state that limitation explicitly. Do not present browser emulation as physical iPad/Android validation.
- [ ] Request fresh whole-change review against approved spec; fix important findings and rerun affected checks. Record evidence in validation doc. Keep local preview available, report completion and any blockers. Do not publish automatically.
- [ ] Commit reviewed docs/fixes; leave branch ready for the user's integration instruction.

## Execution order and checkpoints
Tasks1–7 are sequential because audio format, asset resolution, state and UI depend on each other. Task1 is an early feasibility gate, not permission to buy services. After the working Bakery slice, Tasks8–11 can be delegated by pair with disjoint generator/assets ownership; one integrator owns shared code and tests. Review each task before starting dependent work. Task12 is the release gate.

## Plan self-review
Spec coverage checked: all eight approved casts/settings, both editions, six meaningful choices/64 paths, replay/repair, four optional Together questions, spoken independent endings, real-world alternatives, pause/mute/offline/download controls, existing speed settings and thirteen-book regression are assigned above. Interface names and edition keys consistent. Review Focus items map to explicit tests. No implementation or deployment has begun.
