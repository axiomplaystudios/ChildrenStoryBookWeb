# Add an animated book using another AI

Use a coding AI with access to this project, a terminal and a browser. A chat-only AI can prepare text and art prompts, but someone must save the files, integrate the layers and run the checks.

## Give it the right project

Open the current local project folder in the other coding tool. If transferring to another machine, transfer the current working files, including uncommitted/untracked changes. A fresh clone of the remote repository may not contain the new importer, speed controls or example book. Do not include node_modules, dist, test-results or .superpowers; install dependencies on the destination.

Confirm these exist:

- docs/assisted-book-workflow.md
- scripts/prepare-book.mjs
- scripts/prepare-mouse-art.mjs
- authoring/a-house-for-mouse/story.json
- src/scene-schema.js and src/scene-motion.js

Supply your PDF, ordered page images, or source URL. Include title/language and any source/permission information you have. The current importer requires real HTTPS source and licence links; the AI must not invent them for a private book. If that metadata is unavailable, it should explain the gap and prepare the draft without falsely marking source review complete.

## Master prompt — paste this first

```text
Work in this existing Bedtime Bookshelf project. Add a new animated book using the assisted workflow already implemented here.

Input book: [FILE PATH OR URL]
Book ID: [unique-lowercase-hyphenated-id, or choose one]
Language: [language, or retain the source language]
Source/permission information: [details, or inspect the supplied source]

Read these before editing:
- docs/assisted-book-workflow.md
- docs/another-ai-handoff.md
- authoring/a-house-for-mouse/ (complete worked example)
- scripts/prepare-book.mjs
- src/story.js, src/scene-schema.js and src/scene-motion.js
- src/illustration.js and src/animation-settings.js

Inspect git status and preserve existing work. Use the current code rather than assuming the remote repository is up to date.

Preserve the original story text, language and reading order. Create new, coherent artwork; preserving the original illustrations is unnecessary. Do not silently omit or invent text. Record any grouping of wordless pages. Every page needs meaningful movement of characters or objects: falling tears, flapping wings, wagging tails, swimming fish, breathing, etc. Keep the background composition and story text stationary. Whole-picture zoom or drift does not satisfy this requirement.

Prepare authoring/<book-id>/ with story.json, source.json, animation-plan.json, a cover, per-page static fallbacks, separate backgrounds/moving layers, and source/extraction notes. Prefer layered SVG when it can deliver good artwork; use separate transparent PNG/WebP layers if generating raster art. Keep character appearance consistent. Reuse the existing renderer, motion presets, global/book/page speed controls and offline cache. Do not build a new app or upload backend.

Add four discussion questions: two literal, one feeling and one personal, with source-grounded answers and correct one-based hint pages. Keep visible credits and real source/licence links. Do not copy the Mouse book's attribution into an unrelated book.

Review source extraction and actual rendered animation before marking review flags true. Check rest and extreme poses, portrait/spread/fullscreen, slow/normal/fast speed, pause/replay and reduced motion. Include browser coverage for the new book offline. If you cannot inspect a requirement, state it as unverified.

Then run:
node scripts/prepare-book.mjs check authoring/<book-id>
node scripts/prepare-book.mjs install authoring/<book-id>
npm run check

The installer refuses existing IDs. Never delete an existing book or edit generated catalog.json to bypass it. Correct new installed-book files through reviewable edits if fixes are needed after installation, and keep authoring/installed copies in sync.

Make routine decisions yourself and continue through local installation and verification. Ask only for missing information that prevents accurate work. Do not commit, push or deploy without a separate request. Finish with the preview address, files changed, source/adaptation notes, test results and any unverified checks.

If Superpowers is installed, use its relevant planning, implementation and verification skills. If unavailable, follow this documented procedure without pretending the plugin ran.
```

## Optional staged prompts

Use these if the other AI needs smaller tasks, or you want to review each stage. They deliberately pause at a stage boundary; the master prompt above authorizes the whole workflow.

### 1. Extract and plan

```text
Read the supplied book and docs/assisted-book-workflow.md. Save the source or extraction transcript and a checksum. Produce a table of source page, exact story text, scene description, moving part and proposed action. Verify dialogue and page order. Identify wordless pages and explain any grouping needed because the current story schema requires nonempty text. Propose one consistent visual style and character reference. Record real creators/licence/source information. Do not generate final assets yet. Leave review flags false where inspection is incomplete.
```

### 2. Create the illustrated scenes

```text
Use the agreed extraction and scene plan. Create original layered artwork for every page in authoring/<book-id>/. Give each recurring character a consistent silhouette, palette, proportions and clothing. Separate parts that move and use suitable pivots/parent relationships. Do not draw a moving part again on its background. Compose a static fallback from the same artwork for every scene. Match the existing scene schema and motion presets exactly. Keep narrative text as HTML/story.json text, not baked into page images. Create the cover, alt text, credits and four questions. Leave visual-review flags false until the next stage.
```

### 3. Review and fix

```text
Run a browser preview of every scene using the real illustration renderer. Inspect actual playback, not only screenshots or JSON. Compare 0.5×, 1× and 2×. Capture resting and extreme poses. Check character consistency, detached limbs, clipped layers, background holes, text legibility, static fallbacks and reduced motion. Fix issues and record evidence by page. Only then set that page's animation-plan reviewed flag true. Verify the extracted story and source information separately before source.reviewed=true. Report any checks you cannot perform.
```

### 4. Install and verify

```text
Validate the reviewed authoring package with scripts/prepare-book.mjs check. Install it under a new book ID with scripts/prepare-book.mjs install. Extend the existing all-page offline browser coverage to include this book; check authoring and installed files match. Run npm run check, inspect the actual bookshelf/reader, and fix regressions. Update README and Implementation_Details/book-sources.md with accurate provenance and page counts. Do not push or deploy. Report results and the local preview address.
```

## Optional raster image-generation prompts

These prompts make art assets only; a coding AI still needs to assemble them into a scene and choose pivots/tracks. A single flattened image is insufficient for clean independent movement.

Character/style reference:

```text
Create a character reference sheet for [CHARACTER] in a children's picture book for [AGE RANGE]. Style: [STYLE]. Fixed traits: [SHAPE, COLOURS, CLOTHES, PROPORTIONS]. Show front, side and three-quarter views with calm, happy, sad and sleepy expressions. Use a plain background. No lettering or watermarks. Keep the design simple enough to animate individual ears, wings, arms or tail. This sheet will be the reference for all pages.
```

Background:

```text
Create the background for page [N]: [SETTING AND COMPOSITION]. Match the attached style reference. Leave clear space at [POSITION] for [CHARACTER/OBJECT], which will be added as a separate layer. Do not draw that character/object or its shadow into this background. No story text, lettering, borders or watermarks. Canvas [WIDTH] by [HEIGHT]; framing must match the planned scene.
```

Moving part or character:

```text
Using the attached character reference, create [CHARACTER/PART] for page [N] in this exact pose: [POSE, ANGLE, EXPRESSION]. Match its design, palette and lighting. Transparent background, no checkerboard drawn into the image, no setting, no lettering. Leave padding around the full silhouette. This will be a separate moving layer over [BACKGROUND DESCRIPTION]. Keep [ATTACHMENT POINT] suitable for rotation around [PIVOT].
```

Ask the coding AI to inspect generated transparency, registration, proportions and overlap; generation alone does not establish that layers fit.

## Commands and expected outputs

Use Node 22.12 or newer. In a newly transferred checkout:

```sh
npm ci
# If Google Chrome /usr/bin/google-chrome is unavailable:
npx playwright install chromium

node scripts/prepare-book.mjs check authoring/your-book-id
node scripts/prepare-book.mjs install authoring/your-book-id
npm run check
npm run dev
```

Open the URL printed by Vite. Restart the dev server after adding a book so its catalog refreshes. For offline verification use the production build/preview and wait for the offline-ready message; development mode does not enable the service worker.

Successful delivery includes:

- A new title on the bookshelf with every story page animated.
- Exact source wording or explicitly documented adaptations, consistent art and full credits.
- Working page/book/global speeds, pause/replay, reduced-motion fallback and offline reading.
- A complete reusable authoring folder and installed public/books/<book-id>/ folder.
- Passing validation, build and applicable tests, with honest visual-review evidence.
- No publication unless you explicitly requested it.

An AI without browser/filesystem tools should provide the draft assets and metadata plus an explicit handoff to a coding agent; it should not claim the book was installed or tested.
