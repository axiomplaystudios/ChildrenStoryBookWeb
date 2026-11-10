# Turn an existing book into an animated bookshelf book

This is an **assisted authoring workflow**: give the coding assistant a book, and it prepares the story, artwork, moving parts and review package. The included command validates and installs that prepared package. It does not automatically turn an arbitrary PDF into finished animation, and it does not call a paid image service.

## Ask the assistant

> Use docs/assisted-book-workflow.md to prepare this existing book for the bookshelf. Preserve the story, create new coherent illustrations with meaningful movement on every page, review the animation and add the finished book locally. Record the source and credits. Use the existing scene renderer and speed controls.

Provide a local PDF, ordered images with text, or a source URL. If there is no input, ask the assistant to choose an openly licensed book. Writing stories from a short idea is outside this version.

## 1. Extract and record the story

Read the actual source and its reuse terms. For a PDF, extract text and inspect page images together; for image-only books, transcribe and visually verify; for HTML, associate each illustration with its following paragraphs. Check ordering, dialogue, punctuation and wordless pages against the source. Do not substitute a remembered story or invent missing text silently.

Create `authoring/<book-id>/source.json`:

```json
{
  "title": "A House for Mouse",
  "url": "https://bookdash.github.io/bookdash-books/a-house-for-mouse/en/index.html",
  "license": "CC BY 4.0",
  "creators": ["Michele Fry", "Amy Uzzell", "Jennifer Jacobs"],
  "changes": "New illustrations and animation. Wordless fireplace page grouped into adjacent scene. Four discussion questions added.",
  "reviewed": false
}
```

Keep the original source or an extraction transcript beside this file, plus a checksum and extraction notes. These working references are not installed into the reading app. For a private/local source use a stable HTTPS provenance link supplied by the owner; the current installer requires a source and licence URL. It does not establish ownership or licence rights automatically.

## 2. Plan the illustrations and motion

Create one consistent character/style reference. Decide composition, characters, colours, proportions, expression and background for every page. Prefer reusable character drawings for continuity. New vector artwork is directly editable and light enough for offline use; raster generation is also possible, but its layers and repaired backgrounds still need preparation.

Choose a story action for **each page**: tears fall, a tail wags, a bird flaps, fish swim, Mouse curls up. Move the relevant parts; keep the whole picture and text stationary. Write `animation-plan.json`:

```json
{"pages":[{"page":1,"action":"Mouse steps toward the house; its tail sways.","reviewed":false}]}
```

Give each page exactly one entry, in reading order. The review flags are a record of actual inspection, not switches to bypass unfinished work.

## 3. Prepare local artwork and story metadata

Follow `authoring/a-house-for-mouse/` as a complete worked example. Its generator is `scripts/prepare-mouse-art.mjs`; other stories need their own art decisions, not the same pictures with different text.

Create `story.json` using the schema in `src/story.js` and `src/scene-schema.js`:

- A stable lowercase hyphenated `id`, title, cover filename and visible attribution.
- `sourceUrl` matching `source.json`, `licenseUrl`, and a publisher logo where appropriate.
- Every page has real `text`, descriptive `alt`, a static `image`, and a `scene`.
- Each scene has dimensions, a stationary background, image layers, pivots and motion tracks. Use parent layers for attached moving parts.
- Four discussion prompts: two literal, one feeling, one personal, with valid one-based hint pages. Answers must fit the supplied story.

Available motion presets and parameters are in `src/scene-motion.js`. Timing is in milliseconds. Global/book/page speed controls scale the scene clock, including delays and rests, without editing this metadata. Page-turn timing is separate.

Compose each static fallback from the same background and layers at a sensible resting pose. It must remain understandable with reduced motion, while loading, or if animation assets fail.

Use local filenames without directories. The importer accepts SVG and PNG/JPEG/WebP. SVG uses a restricted static drawing subset: paths, shapes, groups, text, local gradients/masks/clips and local `use` references. No scripts, inline CSS, external references, foreign objects or embedded images. Export elaborate raster layers as separate files. Each file is limited to 5 MiB and the prepared package to 32 MiB; browser offline storage is still finite.

## 4. Review before installation

Review source/licence, exact extracted wording, character continuity, static fallbacks, and every motion at rest and maximum extent. Look for detached limbs, clipped parts, uncovered holes and inappropriate looping. Inspect at normal speed and both slow/fast settings. Verify portrait/spread/fullscreen and reduced motion. Set `source.reviewed` and each animation plan `reviewed` only after the relevant review.

A convenient development preview can import `/src/illustration.js` directly and render draft assets; the demo generator also produces an authoring review page when supplied. Do not publish working source files or review artifacts as book assets.

## 5. Validate and add to the shelf

```sh
node scripts/prepare-book.mjs check authoring/a-house-for-mouse
node scripts/prepare-book.mjs install authoring/a-house-for-mouse
npm run check
```

`check` is read-only. Image validation uses installed Google Chrome or Playwright Chromium (the same browser setup as the test suite); run `npx playwright install chromium` if neither is installed. Each asset is actually decoded, so corrupt files cannot pass on a matching filename/header alone. `install` validates metadata, reviews and every referenced asset; then stages the validated bytes and installs the complete folder under `public/books/<id>`. It refuses symlinks and existing destinations. Concurrent imports of the same ID are rejected. Working HTML and generator scripts are not copied.

The Mouse example is already installed, so repeating its install command intentionally reports that the book exists. Use a new ID for a new book. To update an existing book, review a source-controlled change to that book's files; the importer deliberately has no force-overwrite option.

`npm run build` regenerates the catalog and offline cache. Restart `npm run dev` after adding a book to refresh its catalog. Adding a local book does not publish the site. An installed PWA needs the new version and its offline-ready message before the new book is available without a connection.

## What is automated, and what remains assisted

The scripts validate metadata, motion definitions, review coverage, asset files and packaging. The assistant does extraction, story interpretation, illustration generation, layer preparation and visual review. Those creative steps are not a general-purpose unattended engine. No upload UI, backend queue, external generation credentials or new runtime service is required.
