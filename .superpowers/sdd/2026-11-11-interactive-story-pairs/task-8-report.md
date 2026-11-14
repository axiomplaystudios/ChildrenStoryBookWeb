# Task 8: Prediction and experimentation pairs

Implemented Tavi’s Dinosaur Ramp Rally and Mina and the Shadow Stage: eight scenes each, six purposeful experiment scenes, new cast and original layered SVG art, two distinct parent-read guidance editions, comparisons, retries and optional discussion/reflection. No narration, correctness scoring or legacy cast.

## Red / green evidence
- Before authoring: node --test tests/interactive-experiments.test.mjs failed six tests with the explicit authored-package-missing assertion.
- After authoring and scope-alignment correction: seven focused tests pass. Real reducer journeys exercise SELECT, prediction gating, TEST, retained RETRY comparisons, repeat determinism, stable mutually exclusive outcomes and both editions. Added numeric SVG geometry checks for equal ramp length/fixed hinge and exact point-light boundary rays.
- Importer check and install passed for both reviewed packages, 68 local files each. Initial importer check rejected unsupported data-* markers; changed only author SVGs to supported id attributes, re-reviewed and revalidated.
- Production build passed; interactive catalog contained five installed pairs at this point (other categories under separate tasks).
- npx playwright test tests/browser/interactive-experiments.spec.js --reporter=line:12/12 pass (1.5min). All four pair/edition combinations complete online, resume at ending, complete after offline reload, and complete with touch-emulated phone/reduced motion. Every experiment tests both outcomes, retains two trial history entries, gates Test/Next until predicted/tested and keeps completed layers still.
- npm test:160/160 pass,0 failures (4.6s), after browser verification.
- git diff --check:clean.

## Science/editorial review
Primary references previously retrieved by controller and retained in source.json editorial changes:
- https://openstax.org/books/college-physics-2e/pages/7-3-gravitational-potential-energy : inferred that higher start increases available gravitational potential energy. The SAME length hinged ramp is raised: tilt and starting height change together, fixed bottom/cart/load/surface. Gentle rise140 vs steep rise240; both ramp lengths sqrt(147600). This deterministic near/far rollout is explicitly illustrative with assumed unchanged resistance; no claim about same-height steepness.
- https://spark.iop.org/shadows-and-rays-screen : straight-ray shadow model. Light x120, screen x800 fixed; same upright tree height80 at x370 or600. Shadow height is 80*680/(puppetX-120), thus217.6 or113.333. Upper/lower rays pass through puppet tips at y300/380 and corresponding screen tips. Only puppet position changes. Story stays on screen with no lamp-handling instruction.
No source text or illustrations copied. New dinosaur and human sibling designs, no Bakery or legacy cast assets.

## Actual art inspection
PNG contact sheets were generated through headless Chrome and actually opened with view_image before review flags were set. Every registered asset, all8 scenes rest, both outcomes on all6 experiments, both editions’ every visual guidance step, all-scene decorative poses, three later scenes at .5/1/2 speeds after101 cycles and their reduced-motion outcomes were inspected.
Evidence under experiments-evidence/: for each pair, all-assets.png, all-scenes-outcomes.png, all-guidance.png, all-scene-motion.png, late-motion-reduced.png, individual-model.png. Later browser screenshots capture full production ending views on desktop and touch-emulated phone; four were opened with view_image and inspected for legibility and composition. Controller independently opened refreshed all-scenes/outcomes for both pairs and the shadow model, confirming geometry and corrected character-focused compositions.
Review found and corrected clipped sibling hair, shadow screen width, weak caption contrast, starting cart orientation, flag overlap and scope alignment from fixed slope/release positions to same hinged ramp tilt. Openings/conclusions focus on large characters and delivery/show props, distinct from the six fixed-apparatus model views. Scene-specific parcel/notebook/grove props support the story purpose. Stable outcome layers receive no decorative motion.

## Measured installed sizes
- Tavi v1:258,820 bytes including bundle manifest, far below15MiB.
- Mina v1:231,355 bytes including bundle manifest, far below15MiB.

## Limits
Physics is an authored illustrative model, not simulation or a promise of real-world cart distance. Browser touch emulation does not replace physical device/child observation. Contact sheets inspect sampled animation poses; numeric continuity assertions additionally check late loop boundaries. Full current unit suite passed; broader release browser regression belongs to integration task. No publishing performed.

## Fix round 1: setup-independent prediction pictures

Important review finding: prediction cards reused complete outcome diagrams. The example selected control0, predicted prediction1, then tested control0, so the predict picture appeared to change the ramp or puppet setup without a SELECT action. Verified the finding against the helper and actual package SVGs.

Changed `scripts/interactive/stories/experiments-art.mjs` to render result-only prediction cards: the same rollout line with the cart at a nearer/farther stop, or the same pale screen with a larger/smaller tree shadow. Prediction pictures contain no ramp, lamp, puppet position, boundary rays or named setup. Existing selection and actual test-result diagrams retain their reviewed geometry. New helper and touched construction block are formatted across readable lines. The remaining pre-existing compact generator formatting is deferred as a minor readability issue, with no runtime effect.

Covering test: `tests/interactive-experiments.test.mjs`, “prediction pictures describe only an expected result, without implying another setup selection”. It checks every prediction asset and both editions’ demonstration references across all12 experiment scenes. RED: the added assertion failed on the original SVGs with `a prediction must not depict or name a selected apparatus configuration`. GREEN command `node --test tests/interactive-experiments.test.mjs`:8 tests,8 pass,0 failures (final run226.9ms).

Actually rendered and opened PNGs with view_image before setting review flags: `experiments-evidence/fix1-prediction-icons.png` (all4 new pictures), `tavis-dinosaur-ramp-rally-fix1-guidance.png` and `mina-and-the-shadow-stage-fix1-guidance.png` (all48 demonstration steps per pair across both editions). No predict step now depicts an apparatus change. Controller independently inspected Tavi’s refreshed guidance sheet. Asset SHA comparisons prove only the2 prediction images changed per pair; previously inspected rest/motion/outcome art remains byte-identical. Regeneration reset review flags; after these checks the prior unchanged-art attestations and new-picture/guidance inspection were recorded again.

Controller approved replacement of unpublished local v1 packages. Existing public directories were backed up to `/tmp/task8-fix1-unpublished-backup`, removed locally, then installed through the unchanged importer; the importer never overwrote an existing version. The initial attempted cross-filesystem rename failed EXDEV, corrected by copying to backup first. An obsolete browser run against unchanged installed packages was interrupted and excluded from evidence.

Final commands/output against corrected installed packages:
- `node scripts/interactive/prepare-pair.mjs check authoring/interactive/tavis-dinosaur-ramp-rally`:Validated8 scenes,68 local files.
- Equivalent Mina check:Validated8 scenes,68 local files. Both `install` commands completed successfully.
- `npm run build`:exit0,13 legacy books and8 interactive pairs validated; Vite build and PWA generation passed.
- `npx playwright test tests/browser/interactive-experiments.spec.js --reporter=line`:12 passed (1.1min), both editions online/saved return, full offline reload journeys and touch/reduced-motion phone journeys. These journeys replay every example then test both outcomes per scene.
- `npm test`:165 tests,165 pass,0 failures (3.9s).
- `git diff --check`:clean.

Updated measured bundle sizes including manifests: Tavi255,717 bytes; Mina228,405 bytes. No runtime/schema changes, audio, publishing or shared catalog changes included in the fix commit.
