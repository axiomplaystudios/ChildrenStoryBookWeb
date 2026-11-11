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
