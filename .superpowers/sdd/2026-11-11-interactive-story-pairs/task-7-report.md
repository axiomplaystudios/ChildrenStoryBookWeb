# Task 7 — Amara’s Busy Bakery

Implemented the first real interactive pair, `amaras-busy-bakery/v1`: eight connected read-aloud scenes, opening + six breakfast jobs + welcome resolution. Both editions retain adult read-aloud framing, with separate Together arrangement/discussion scaffolds and Independent one-step picture prompts. Jobs fill orders (one, two, five buns), match the star shape, and pack groups (three buns, four stars). No cooking/heat/cutting, audio, scores or required discussion gate.

Original code-native SVG art introduces Amara, Grandpa and a distinct neighbouring family. Scene compositions include storefront, counter, basket, shape close-up, box packing, doorway tray, long table and community breakfast. `scripts/interactive/art.mjs` contains reusable SVG primitives and new human cast helpers; it imports no old story cast. `package.mjs` already supplied the required metadata/review-reset helper, so it needed no change. Story generator writes70 artwork assets and resets review flags false through that helper. Regeneration invalidates review; do not regenerate the released immutable version in place.

## Red / green

Independent content expectations were authored first. `node --test tests/interactive-content.test.mjs` initially failed2/2 with the deliberate assertion “the authored Bakery package must exist.” After implementation it passes3/3. Checks use an independent recipe for all eight scene IDs, food types, quantities and target IDs; target SVG and completed-layer food counts match1–5; both editions complete with real reducer actions; completion layers remain hidden until the final placement. Loop checks sample every scene at speed0.5/1/2 around cycles1/17/101 and require continuous positions/angles and actual ribbon rotation. Completed food has no motion track.

Production importer rejected the false provenance review flags before actual inspection. After the inspections below, reviewed provenance/art records were set true, then `prepare-pair.mjs check`, `prepare-pair.mjs install`, interactive catalog generation and `npm run build` passed. The package has74 files including bundle.json,70 SVG assets, and303,899 actual bytes (0.290MiB), below15MiB. Largest asset14,507 bytes. Catalog manifest14,331 bytes. Shelf retains13 legacy books plus one pair card, total14 cards.

`npm test`:132/132 passed. `npx playwright test tests/browser/interactive-bakery.spec.js`:6/6 passed (33.6s). This covers both editions online with saved ending resume, both editions offline after app reload, and both editions on390×844 touch-emulated phone with reduced motion. Each journey traverses all six recipes, exercises wrong-shape retry, replays demonstrations without completing work, verifies incomplete quantities cannot advance, verifies completed food is stable, and checks back-navigation retains completion. `npm run test:browser`:125/125 passed (5.6minutes), including the legacy complete-scene/offline/speed/fullscreen journeys and synthetic interactive download/shelf/reader suites. Final fresh `npm test` rerun remains132/132 after adding main-scene pictured-order count assertions. `git diff --cached --check` passed.

The fixture builder now removes only its temporary copied `interactive` directory before creating synthetic bundles. Fixture counts remain independent of new real stories; production public content is untouched.

## Actual visual inspection

Agent viewed via `view_image` (rendered PNGs, not hash/decoder inference):

- `bakery-evidence/assets-1.png` through `assets-6.png`: every exact asset, including cover, static fallbacks, separate human/ribbon/background/foreground/result layers and all picture controls/examples.
- `rest-contact.png`, `completed-contact.png`, `reduced-completed.png`: all eight compositions and every distinct result layer combination (empty versus complete; intermediate placements intentionally retain the empty vessel and show actual control progress).
- `guidance-welcome.png`, `guidance-first-plate.png`, `guidance-two-for-the-door.png`, `guidance-star-place.png`, `guidance-three-for-the-bench.png`, `guidance-four-for-friends.png`, `guidance-five-for-the-table.png`, `guidance-breakfast.png`: both editions’ instructions, feedback and every demonstration step.
- `motion-0.5-a.png`, `motion-0.5-b.png`, `motion-1-a.png`, `motion-1-b.png`, `motion-2-a.png`, `motion-2-b.png`: actual existing-renderer sampled frames showing articulated ribbon motion and stationary countable food.
- `phone-together.png`, `phone-independent-demonstration.png`, and production `journey-together-phone-completed.png`, `journey-independent-phone-completed.png`: readable parent text, recognisable controls/demonstration and complete quantities in portrait.

Controller separately viewed initial and corrected rest/completed/guidance contact sheets, reduced completed, phone guidance and all six motion frames. Corrections from actual inspection: made the neighbour distinct, placed ending table foreground in front of lower bodies, occluded first-plate Grandpa’s lower body behind the counter, brought star-scene gesture within frame, adjusted basket/five-bun positions, and removed the ending caption that overlapped bunting. Final caption-free art appears in `assets-6.png` and updated contact sheets. All review flags stayed false until these inspections.

Artifacts are under `.superpowers/sdd/2026-11-11-interactive-story-pairs/bakery-evidence/`. They are local review evidence; the installed public package contains only validated JSON/SVG assets. A temporary Vite/test harness displayed unreviewed authoring data for early review without changing production importer gates.

## Limits

Touch interaction used Chrome’s mobile/touch emulation; no physical phone/tablet hardware was available. Long portrait narrative/control screens require scrolling. Ribbon motion is deliberately gentle; completed food stays fixed. No push, merge or deployment performed.
