# Task 9 report — cumulative consequence pairs

Implemented and locally installed immutable v1 pairs **Nori’s Seaside Picnic** and **Zuri’s Rooftop Garden**. Each has exactly six binary decision scenes (the first in the opening), one ending scene, three complete recap passages covering all six decisions once, and four optional Together prompts. An adult reads both editions; there is no audio. Together offers comparative adult scaffolds and a third demonstration step; Independent uses short instructions and two comparison pictures.

## Meaning and repairs

The independent route oracle was written before authored pair data. Its first substantive RED run failed because neither authoring package existed. `tests/interactive-consequences.test.mjs` explicitly declares option IDs, expected visible layers and required recap clauses separately from the generators, then enumerates all 64 paths per story.

| Story | Decisions | Later repair |
| --- | --- | --- |
| Nori | wide/small mat; dune/open cove; shared tray/separate bowls; sail/open sky; sort now/carry pouch; cart/carried basket | An open cove initially sets breezy air. Mum later adding the sail changes derived air to sheltered, while retaining the original cove choice, view layer and explicit “later put up the sail” explanation. |
| Zuri | beds/pots; bench/table visitors; flowers/herbs; cloth/sunny rest; loop/direct path; drip/morning can | A sunny corner followed by the drip setup changes derived shelter to parasol, immediately shows the parasol beside the tank, hides the final sunny marker, and keeps the original sunny decision in the explanation. |

All decisions have immediate option feedback and a selected scene layer, plus visible ending differences and complete recap clauses. The two repairs preserve original identities. Zuri explicitly advances days for growth and care. Flower outcomes include a butterfly; herbs include a bee visiting small herb blossoms. Nori uses safe mild authored weather, adult help, dry ground away from water, enough fruit either way and complete cleanup. Neither story scores children or imposes random punishment.

## Artwork and actual inspection

Original code-native layered SVG artwork uses a blue-grey elephant family at a sandy coast for Nori, and a human child with grandmother inside an enclosed city rooftop for Zuri. The shared helper is private to these two generators; no shared framework/art module, legacy book or runtime was changed.

Every review flag began false through `writePairPackage`. Review records were marked true only after actual PNG inspection with `view_image`. Evidence is in `.superpowers/sdd/2026-11-11-interactive-story-pairs/consequences-evidence/`:

- `<id>-scenes-options.png`: all six scenes unresolved and both immediate choices.
- `<id>-controls.png`: all twelve option pictures, readable labels and immediate feedback.
- `<id>-endings-1.png` through `-endings-4.png`: every one of the 64 derived final combinations per story, including every repair combination and overlap risk.
- `<id>-guidance-together.png` and `-guidance-independent.png`: all scene guidance pictures and still readable step labels, including the ending.
- `<id>-all-motion-no-preference.png` and `-all-motion-reduce.png`: real `createIllustration` output for all seven scenes, inspected at motion time and under reduced motion.
- `<id>-reader-no-preference.png` and `-reader-reduce.png`: actual reader and picture example.
- `<id>-recap-passages.png` and `-all-recaps.txt`: all twelve distinct beat passages and the complete 64-route composed memories.
- `zuris-rooftop-garden-immediate-repair.png`: conditional parasol shown immediately after the later choice.

Inspection caught cropped shade-control poles, duplicate sun imagery, a dune overlapping Nori and initially mature plants at planting time. These were corrected before installation and the relevant contact sheets regenerated. Cousin Luma was added from sharing onward. Garden sheets were refreshed and inspected again after adding insect visitors. The controller additionally viewed refreshed Zuri scene/options and ending-sheet 4, including butterfly and bee variants.

## Validation

- `node --test tests/interactive-consequences.test.mjs`: **5/5 passed**, including all 128 complete routes, immediate effects, mutually exclusive final layers, repairable state, original choice identities, 64 distinct composed recaps per story, earlier-change suffix clearing and insect explanations.
- `prepare-pair.mjs check` and `install` for both authoring folders: passed, including Chrome decode, exact package integrity and complete review requirements.
- `npm run build`: passed during the controller’s reserved shared integration window; validated 13 legacy books and 7 currently installed interactive pairs.
- `npx playwright test tests/browser/interactive-consequences.spec.js`: **18/18 passed (38.2 s)**. Both titles and editions complete repair routes and complementary routes, covering both options at every decision. Tests also complete fully offline after service-worker reload, resume saved endings, operate on touch-emulated phones with reduced motion, and confirm earlier edits while checking that future work is cleared.

| Pair | Assets | Scenes | Full bundle bytes | Largest asset |
| --- | ---: | ---: | ---: | ---: |
| Nori v1 | 58 | 7 | 188,340 | 8,747 |
| Zuri v1 | 60 | 7 | 212,816 | 10,627 |

Measured bytes include bundle manifests and all metadata/art. Both are well below 15 MiB; every asset is below 5 MiB. No deployment or remote publication was performed. Browser coverage uses representative and complementary full routes; all route combinations are covered by the independent reducer oracle and exhaustive visual ending contacts. Shared catalog regeneration is left for controller integration and excluded from these story commits.
