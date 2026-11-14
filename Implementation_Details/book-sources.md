# Book sources and adaptations

Legacy provenance verified 10 November 2026; interactive collection added 11 November 2026. The shelf contains 21 titles: thirteen legacy books (139 pages) under `public/books/` plus eight interactive pairs/sixteen editions under `public/interactive/`. All story images are local; interactive versions are downloaded explicitly before offline use. Reading requires no remote image service.

## Pip Finds a Friend

- Folder: `public/books/pip-finds-a-friend/`
- Eight story pages and an illustrated cover, all original SVG drawings authored for this implementation.
- Original sample text reconstructed from the project’s owl, Rabbit, red ball and four-question story outline. The earlier prototype was not present, so these files do not claim to reproduce its artwork or exact wording.
- The book is explicitly marked `sample: true`; its subtitle and credit identify it as an original sample. It is not presented as a Book Dash book or as third-party open-licensed material.
- All eight pages animate selected parts of the original artwork. On page 3, the fixed tear is removed from a derivative SVG background and two staggered drops fall from Rabbit’s eye. The original illustration remains the static fallback.
- Separate text and alt text accompany each illustration. Four spoken prompts cover two literal details, one feeling, and one personal connection. Hint pages use one-based numbering.

## Sleepy Mr Sloth

- Folder: `public/books/sleepy-mr-sloth/`
- Twelve complete story pages plus original illustrated cover and publisher logo.
- Publisher's book page: https://bookdash.org/books/sleepy-mr-sloth/
- English HTML edition (text, illustrations, alt text and per-book licence): https://bookdash.github.io/bookdash-books/sleepy-mr-sloth/en/index.html
- Original cover listing: https://bookdash.github.io/bookdash-books/sleepy-mr-sloth/
- Licence: **Creative Commons Attribution 4.0 International (CC BY 4.0)**, https://creativecommons.org/licenses/by/4.0/
- Publisher reuse and crediting guidance: https://bookdash.org/re-using-the-book-dash-content/

### Creator and licence evidence

The current publisher book page credits **Graham Paterson (Illustrator), Paul Kennedy (Writer), Nick Mulgrew (Designer), and Arthur Attwell (Editor)**. All four are included in the local `credit` field. The older HTML edition names only Paterson, Kennedy and Mulgrew; the current publisher page supplies the editor's credit.

The English edition has a `blockquote.copyright-text` footer for this specific book containing a link labelled “Creative Commons Attribution 4.0 International License” to `http://creativecommons.org/licenses/by/4.0/`. It expressly permits redistribution and adaptation with credit, a source link and an indication of changes. The local metadata links to the HTTPS form of the same licence.

The current reuse page requests acknowledgement of all four creators, a link to Book Dash, a visible Book Dash logo, and identification of adaptations. The local `logo` is `book-dash-logo.png`, copied from the English edition. The application should display this alongside the credit and publisher source link. No endorsement is claimed.

### Adaptation details

- The English edition's 12 illustrations are used in order without cropping, recolouring or added artwork. The source JPEGs were converted to WebP with Pillow, quality 88, method 6, at original pixel dimensions. The original cover was converted in the same way. The logo remains its original PNG.
- Story wording, paragraph order and source alternative descriptions are preserved. Text remains real text in `story.json`; it is not flattened into page images. The source cover includes its original lettering.
- The subtitle and four spoken conversation questions were added for Bedtime Bookshelf. Questions were written after reading the full text and reviewing all 12 illustrations; their one-based hints are pages 1, 10, 12 and 11.
- The two literal prompts concern sleep and the squawking bird. The feeling prompt refers to the explicitly happy ending. The personal prompt has no wrong answer. All twelve Sloth pages animate selected parts: yawning, torso movement, ear twitching, chewing, bee flight, snake movement, toe shuffling, squawking, closing eyes and sleep marks. These SVG assets embed pixels from the original WebP images; local white and ink repairs replace the original stationary parts. The original drawn flight trails are retained. The original source files are unchanged. Original illustrations remain the loading/error/reduced-motion fallback. Text stays still. Whole-image pan/zoom has been removed. No extra audio or story interactions were added.
- The source is English as supplied by Book Dash; no translation was made.

### Retrieved-source fingerprints

SHA-256 records below identify the source responses inspected at implementation time. They are evidence of the particular material used, not a claim that remote content cannot change.

| Source | SHA-256 of retrieved HTML |
| --- | --- |
| https://bookdash.org/books/sleepy-mr-sloth/ | `0e9f5503b85f74a5f55bc4f2f3878b75310ab3019ed75823d23d19b0b6d1e9ee` |
| https://bookdash.github.io/bookdash-books/sleepy-mr-sloth/en/index.html | `3859b549e35b4ac16cc44718be2682facc5abe413dff852ae3904677ca660ff6` |
| https://bookdash.org/re-using-the-book-dash-content/ | `3eb49d60e6fbaada7fa95f674b1a1859fb58840e8ae8187ace7a733af2bc8144` |

Original JPEG base URL: `https://bookdash.github.io/bookdash-books/sleepy-mr-sloth/en/images/`. Each source filename below is relative to this URL.

| Original file | Local asset | SHA-256 of source JPEG |
| --- | --- | --- |
| `cover.jpg` | `cover.webp` | `4ab8144bd97bb27ab21668bc2da84dc33627770ad8a921f4cacd1107715fa137` |
| `01.jpg` | `page-01.webp` | `31b4a3e49a01a6fca2e07d40ed6d03726828f6dcea587e1c20e1bbee03fa728c` |
| `02.jpg` | `page-02.webp` | `49238c6a92ede911645b552bce640ea8b912d108b18fb0d526bb6393fc320509` |
| `03.jpg` | `page-03.webp` | `64e4b6a2d325f532dcc38165287e15700fdbf8f6473e5e2ca50aee31943a1165` |
| `04.jpg` | `page-04.webp` | `4d84a371e5541a7d6a704b9765b1f83a043e97235a5121642d3d73f0e2151890` |
| `05.jpg` | `page-05.webp` | `56eb75b4c9f585baabf0758209016953d4e8108b7eeb4cf6967e87d1807b32ec` |
| `06.jpg` | `page-06.webp` | `96ac8f84b2a38852ad2cc3420db1a75c49ae6927dace23dccb59992543317314` |
| `07.jpg` | `page-07.webp` | `f4e65b7b2e19ceade72caf32463765b4b2d915ce0e3addd0f5163976b15d2d18` |
| `08.jpg` | `page-08.webp` | `395fe098ead30ff63999ce32fc8473ee27570f1546fe720ecb2e4b39f64a126c` |
| `09.jpg` | `page-09.webp` | `43837e137e0741ee9beecfd61680e44a7c0c35a61a699ae3e915d183066e2c74` |
| `10.jpg` | `page-10.webp` | `b50f61e19df9f53d760a853e36833342c1b4e95770d05ff29a55097789d76eca` |
| `11.jpg` | `page-11.webp` | `6e22a550e77e02f53bcd2a9a84b391acb7aa5b3ace83325243a550a545c63eda` |
| `12.jpg` | `page-12.webp` | `cb000fc019e64b5e9e878cd6d5975cabf80b75f69af99663db7d94ebf23e8322` |

Original logo: https://bookdash.github.io/bookdash-books/sleepy-mr-sloth/en/images/book-dash-logo.png. SHA-256: `f17d0f4f44db79e3a2170beb549c194828519332627794d9e1d4377aa5c4dc6b`.

## Validation

- Confirmed both JSON files parse, with 8 and 12 pages respectively.
- Confirmed exactly four questions per book: two literal, one feeling, one personal; all hints reference existing pages using one-based numbers.
- Confirmed all cover, page and logo filenames are safe local basenames, and every referenced asset exists and decodes (SVG XML or WebP/PNG).
- Reviewed the complete Book Dash illustration contact sheet and the sample's rendered SVG illustrations.
- No remaining content or attribution gaps were identified. Actual device rendering remains an application-level check.


## A House for Mouse — newly illustrated animated adaptation

- Source English edition: https://bookdash.github.io/bookdash-books/a-house-for-mouse/en/index.html
- Publisher page: https://bookdash.org/books/a-house-for-mouse/
- CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Original creators: Michele Fry (writer), Jennifer Jacobs (designer), Amy Uzzell (illustrator, credited on the current publisher page as Amy Richards (Uzzell)). The source HTML identifies all three and explicitly permits adaptation with attribution.
- Source wording and order are retained. The original has twelve illustrations but eleven text-bearing scenes: the wordless fireplace illustration is grouped with the adjacent warm-and-dry scene. No new narrative text is added.
- All illustrations are newly authored vector artwork for this adaptation, with separate character/object layers. They do not reproduce or claim to preserve the original illustrator's drawings. New motion and four discussion questions are added.
- The authoring package records source, changes and per-page animation review. The source HTML snapshot and SHA-256 record remain under `authoring/a-house-for-mouse/` for reproducibility; only finished local artwork and metadata are installed in `public/books/a-house-for-mouse/`.
- Attribution, a source link, the CC BY link and Book Dash logo remain visible in the book credits. No endorsement is claimed.


## Original learning collection (11 November 2026)

Ten new books—Pip’s Alphabet Adventure, Mouse’s Counting Picnic, Rabbit’s Rainbow Garden, The Little Shape Builders, Pip’s Planet Journey, Big Bear, Little Mouse, Where Is Teddy?, The Weather Window, The Pattern Parade and A Day of Feelings—were written and illustrated for this project with AI assistance. No external story text or illustrator's artwork was adapted for these books. They contain 108 pages and reuse locally authored character components for visual continuity.

Each authoring package records `kind: original`, creators, a truthful licensing statement, the educational topic, per-page review records and editorial notes. Original content has no fabricated publisher/source/licence URL and is not labelled Book Dash. No new project-wide or Creative Commons licence is granted by this addition.

Editorial calibration: [CDC four-year guidance](https://www.cdc.gov/act-early/milestones/4-years.html) was read for examples of shared conversation, familiar-object counting, colours and story prediction. This collection is not a developmental checklist or certified curriculum. Planet facts are checked against [NASA's planets overview](https://science.nasa.gov/solar-system/planets/) and individual planet pages recorded in the planet book's notes. Factual references are not story authorship credits.

Illustrations, learning labels and all motion remain local. Static fallbacks preserve the same lesson. Counted sets and pattern sequences remain stable during animation; all authored moving layers loop, with short rests. Original packages and installed copies are checked for parity, independently expected learning sequences, actual image decoding and continued browser motion.


### Learning picture generation and review

The learning art kit lives in `scripts/learning/art.mjs`, `cast.mjs`, `scenery.mjs` and `props.mjs`. The three book generators (`literacy.mjs`, `concepts.mjs`, `world.mjs`) assemble scenes with `package.mjs`; `book-data.mjs` preserves the story text, learning metadata, questions and source notes independently of illustration changes.

Lettering inside the learning-book pictures is drawn from Andika, SIL Open Font License 1.1, converted to outlines. `opentype.js` and `@fontsource/andika` are development-only dependencies; readers download SVG paths, not fonts. Each book has a separate title cover. Static fallback pictures omit blinking eyelids, and counted sets, patterns, shape examples and position examples remain still.

After regeneration, create visual review sheets:

```sh
node scripts/learning/review.mjs /tmp/book-review mouses-counting-picnic
```

Inspect every page and its motion sheet, plus the real reader at phone/tablet sizes and different speeds. Only after review, set the source and every animation-plan page's `reviewed` flag to true. Replace an existing installed learning book with:

```sh
node scripts/learning/reinstall.mjs mouses-counting-picnic
npm run check
```

The replacement command validates the reviewed bytes, stages them, uses the same per-book import lock as the importer, and restores the previous folder if the final rename fails. It never grants review approval. Regenerating resets review flags again. A production rebuild updates the full offline cache; wait for the offline-ready message before disconnecting.

## Original interactive pairs (11 November 2026)

Amara’s Busy Bakery; Bolt and the Toy Parade; Tavi’s Dinosaur Ramp Rally; Mina and the Shadow Stage; Nori’s Seaside Picnic; Zuri’s Rooftop Garden; Imani and the Lost Shape Map; and The Penguin Sound Post are original connected stories and code-native layered SVG illustrations created for Axiom Play Studios with OpenAI Codex. New human, robot, dinosaur, elephant, rabbit and penguin casts/settings are credited in their own packages. They do not adapt external story text or artwork, reuse the legacy cast, or claim Book Dash attribution. Their source records state **All rights reserved. Original work for Axiom Play Studios.** No new project-wide or Creative Commons licence is granted.

Each title provides Read Together and Play by Myself. The adult reads both editions aloud. Four optional Together questions, distinct edition guidance, visible picture demonstrations and local saved activities are part of the same paired package. There is no generated narration or microphone requirement; The Penguin Sound Post uses visual rhythm sequences, with optional adult/child-made sounds.

Truthful provenance and exact image hashes live in `authoring/interactive/<id>/source.json` and `pair.json`; `visual-review.json` records the reviewed assets, scenes, outcomes and guidance. Installed immutable versions include those records and a complete `bundle.json`. Actual art/motion inspection and editorial corrections are recorded in per-task evidence; automatic image decoding alone is not a visual review. See [authoring](../docs/interactive-story-authoring.md) and [validation](../docs/interactive-story-validation.md).

The experiment stories are explicitly illustrative models. Tavi changes the tilt/release height of one same-length hinged ramp while keeping cart, load, bottom hinge and surface fixed; the editorial inference uses [OpenStax’s gravitational potential energy explanation](https://openstax.org/books/college-physics-2e/pages/7-3-gravitational-potential-energy). Mina changes only a puppet’s position between a fixed lamp and screen; straight-ray geometry was checked against [Institute of Physics: Shadows and rays](https://spark.iop.org/shadows-and-rays-screen). Retrieval details and exact model assumptions are retained in each source record. These references support factual calibration, not story/art authorship or promises about every real-world experiment. No child instruction to handle lamps is required.
