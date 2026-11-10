# Bedtime Bookshelf

A quiet, local-first picture-book reader for a parent and child. Pick a book, turn the pages, talk through four gentle questions, and say goodnight.

## Run locally

Requires Node.js **22.12 or newer** (verified with Node 24).

```sh
npm ci
npm run dev
```

Open the address Vite prints. On an iPad or Android phone connected to the same Wi-Fi, open its **Network** address. The development server listens on your local network. Plain LAN HTTP supports reading, but browsers require **HTTPS or localhost** for service workers, installation and screen wake lock.

To try the production build, including offline caching on localhost:

```sh
npm run build
npm run preview
```

Wait for “Ready for offline reading” before disconnecting. All three complete books and their animation assets are cached together. Browser storage can be evicted, so offline availability is subject to browser/device storage rules. Use the HTTPS GitHub Pages address for home-screen installation. Physical iPad/Android installation and wake-lock behavior still need device checks.

## What is included

- Cover shelf, realistic StPageFlip turns, edge taps, touch swipes and arrow-key navigation.
- One page in portrait; two-page spreads in landscape. A **Full screen** button expands the reader to the available display, with a small exit icon and a collapsible illustration-settings panel. Swipe or tap the left/right page edges to navigate. Rotation keeps the current page in view. Escape exits full screen first; outside full screen it returns to the shelf.
- All 31 story pages have illustration animations: falling tears, flapping wings, moving ears, flying bees, a swaying snake tail, an articulating beak, and sleepy breathing. Individual parts move while the picture and text stay fixed.
- A tap/swipe reader when reduced motion is enabled or the page-turn library fails. Reduce Motion disables both page turns and picture movement; a library failure still allows the pictures to move.
- Four spoken questions with relevant pictures and a hidden suggested answer. No scoring or recording.
- Warm palette, optional quiet page rustle/chime, gradual reader tint and best-effort wake lock.
- Completion stars and preferences saved only in this browser. Blocked storage does not prevent reading.
- **Pip Finds a Friend:** an original eight-page sample reconstructed from the plan, not the unavailable earlier prototype.
- **Sleepy Mr Sloth:** twelve pages by Book Dash, with original illustrations converted to WebP and full attribution.
- **A House for Mouse:** an eleven-page adaptation of the Book Dash story with newly authored layered artwork and motion, prepared through the assisted workflow.
- Offline support and an install manifest through `vite-plugin-pwa`. Updates are offered from the shelf instead of interrupting a story.

See [book provenance and adaptations](Implementation_Details/book-sources.md). Book Dash content is CC BY 4.0; those licences and creator credits remain attached to the book. No licence for the rest of the project is implied.

## Full-screen reading

Open a book and tap **Full screen** in the reader toolbar. Rotate your device freely: portrait shows a single page, landscape shows a two-page spread. The book fills the display without top/bottom bars, progress dots or page numbers. Tap the small **Exit full screen** icon at the top right to return to normal reading; it overlaps the page instead of reserving space. Swipe or tap a page edge to turn pages. A forward tap or swipe on the final page opens the questions and exits full screen.

The app requests native full screen directly from your tap and does not lock orientation. On browsers that do not support or allow it, it uses an **expanded view** filling the browser viewport; browser bars may remain. For more space on iPhone, use Safari’s **Share → Add to Home Screen**, then launch the installed app. Safari supports the unprefixed Fullscreen API on iPadOS 16.4 and later; capability detection and the expanded fallback also cover other browser versions. [WebKit release notes](https://webkit.org/blog/13966/webkit-features-in-safari-16-4/).

Automated checks cover native entry/exit, denied/unavailable APIs, phone/tablet rotation, edge-to-edge geometry, short landscape displays, last-page swipes, and navigation during pending requests. Actual iPad Safari fullscreen transitions and device safe-area behavior still need physical-device checks. At unusually short viewport heights (around 240 px), illustrations may become small so text and controls remain accessible.

## Illustration speed controls

Open a book, then expand **Illustration settings** above the picture. Choose **Default speed** for all books, override it with **This book**, or select a visible page and set **This page**. Page settings win over book settings, then the global default. **Inherit** removes an override. Choices are 0.5×, 0.75×, 1×, 1.5× and 2×; settings are saved in this browser.

**Pause illustrations** freezes movement; **Replay illustrations** starts the visible scenes again. Controls remain available in fullscreen. Speeds include pauses/delays within an illustration, preserve its current position, and do not affect page-turn speed. Device reduced-motion settings always keep illustrations still.

## Add an animated book with another AI

Use a coding AI with access to this project, a terminal and a browser. Supply an existing book as a **PDF, ordered page images, or a source URL**. The assistant extracts the story, creates new artwork with moving parts, reviews it, and installs the finished book into the bookshelf.

The [AI handoff guide](docs/another-ai-handoff.md) contains the complete master prompt, separate prompts for each stage, and image-generation prompts. The [assisted authoring workflow](docs/assisted-book-workflow.md) explains the package format and review requirements. Use [A House for Mouse](authoring/a-house-for-mouse/) as a complete worked example.

### 1. Give the AI the current project and your book

Open this repository in the other AI's coding tool. When transferring to another machine, include current uncommitted and untracked project files: a fresh clone may not contain the latest importer, speed controls or example. Install dependencies with `npm ci`; do not transfer `node_modules` or `dist`.

Provide the book's file path or URL, language, and any source/permission information you have. The assisted importer currently requires real HTTPS source and licence links. If these are unavailable for a private book, the assistant should identify the missing information rather than invent links or mark its source review complete.

### 2. Paste this prompt

Replace the bracketed input before sending. For more control, use the staged prompts in the [handoff guide](docs/another-ai-handoff.md).

```text
Add this existing book to the Bedtime Bookshelf project:
Input: [PDF/image-folder path or source URL]

Read docs/assisted-book-workflow.md and docs/another-ai-handoff.md.
Use authoring/a-house-for-mouse/ as a package example, and inspect
src/story.js, src/scene-schema.js and src/scene-motion.js.
Preserve existing uncommitted work.

Preserve the story text, language and reading order. Create new,
consistent illustrations with meaningful character/object movement
on every page. Whole-picture zoom or drift is insufficient. Reuse
the existing reader, animation presets and speed controls.

Prepare authoring/<unique-book-id>/ with source.json, story.json,
animation-plan.json, a cover, local backgrounds/moving layers and
static fallback images. Record real credits and source/licence links.
Add four discussion questions: two literal, one feeling, one personal.

Review the extracted story and actual animation before setting
review flags true. Check every page at slow, normal and fast speeds,
portrait/spread/fullscreen, pause/replay and reduced motion.

Validate and install the reviewed package using scripts/prepare-book.mjs.
Extend offline browser coverage for the new book, run npm run check,
and fix failures. Update the book-source documentation and README.
Make routine decisions yourself; ask only for information needed to
complete accurate work. Report the preview URL, test results and any
unverified checks. Do not commit, push or deploy without a separate request.
```

### 3. Prepare and review the book

The assistant should complete these stages in order:

1. **Extract:** verify the exact text and page order against the source; document any grouping of wordless pages.
2. **Plan:** establish consistent characters and choose a meaningful action for every page.
3. **Illustrate:** create separate backgrounds and moving parts, then compose matching static fallback images. Keep story text separate from pictures.
4. **Review:** inspect actual playback and extreme poses for clipping, detached parts and background gaps. Verify source details separately. Set review flags only after inspection.
5. **Install and test:** validate the complete package, add it under a new ID, and verify the real reader and offline behavior.

The resulting authoring folder contains:

```text
authoring/your-book-id/
  source.json             # Source, creators, licence, changes and review
  story.json              # Story, questions, assets and animation tracks
  animation-plan.json     # Per-page action and visual-review record
  cover.svg               # SVG or supported raster artwork
  page-01.svg             # Static fallback; repeated for every page
  page-01-background.svg
  page-01-moving-part.svg
  ...                     # Remaining layers, pages and source notes
```

### 4. Validate, install and preview

From the repository root, after the package is prepared and reviewed:

```sh
# If Google Chrome at /usr/bin/google-chrome is unavailable:
npx playwright install chromium

# Replace your-book-id with the new package's ID:
node scripts/prepare-book.mjs check authoring/your-book-id
node scripts/prepare-book.mjs install authoring/your-book-id
npm run check
npm run dev
```

`check` is read-only and validates metadata, reviews, animation definitions and image decoding. `install` copies a complete validated package into `public/books/<book-id>/`; it refuses to overwrite an existing book. The Mouse example is already installed, so repeating its installation intentionally fails. Do not delete existing books to bypass that protection.

`npm run check` runs unit tests, the production build and browser tests. Open the address printed by Vite to inspect the new title. Restart an existing development server after installation to refresh its catalog. Do not edit generated `public/books/catalog.json` by hand.

For offline reading, use the production build/preview and wait for **Ready for offline reading** before disconnecting. Development mode does not enable the service worker. Confirm the new book's page/book/global speeds, pause/replay and reduced-motion fallback all work.

This is an **assisted workflow**, not an unattended PDF-to-animation converter. A chat-only AI can prepare content and art prompts, but a coding tool or person must save the files, assemble the layers and run verification. No upload backend or paid generation service is required; adding a local book does not publish the website.

## Add a book manually

1. Create `public/books/a-book-slug/` and put its cover, illustrations and `story.json` there.
2. Follow an included story as the schema. Each page has `image`, `text`, and `alt`. Four questions use `q`, `a`, `type` and **one-based** `hintPage` values. Include two `literal`, one `feeling` and one `personal` question.
3. Include a real `credit`, optional HTTPS `sourceUrl` and `licenseUrl`, and an optional local `logo`. Verify reuse terms for that particular edition. Use safe local filenames, not remote URLs.
4. Restart `npm run dev` or run `npm run build`. The catalog generator discovers book folders, validates metadata and checks every referenced asset. A production rebuild also includes new books in the offline cache.

Do not edit `public/books/catalog.json` by hand; it is generated from the folders. Books are trusted, repository-authored content. SVG assets are displayed as images.

## Verify

```sh
npm test                 # schema, asset discovery, reading state and storage
npm run build            # catalog validation, Vite and PWA build
npm run test:browser     # complete reading flow, layouts, fallback, offline
```

Book-package image validation and browser tests use installed Google Chrome at `/usr/bin/google-chrome` when available. Otherwise install Playwright Chromium with `npx playwright install chromium`. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use another Chromium executable. Browser tests cover the complete reading flow, responsive layouts, touch gestures, fallback navigation and offline reading.

`npm audit --omit=dev` reports no runtime advisories at implementation time. The current PWA build toolchain reports six transitive development advisories (two low, four moderate); npm's proposed automatic fix is a major downgrade of the PWA plugin. No forced downgrade was applied. Recheck the upstream build dependencies when updating packages.

## Scope and device checks

This implements the first-version reading experience with GitHub Pages deployment. Book provenance is included in this repository; local planning notes and diagnostic logs stay in the development workspace.

Still check on real hardware: iPad Safari page dragging, Android touch behavior, home-screen installation, wake-lock behavior after backgrounding, and text size at your usual reading distance. Small landscape phones may scroll vertically to keep text readable. All 31 pages include character or object motion. Story-specific tappable sounds remain future work.

## GitHub Pages

Website: **https://axiomplaystudios.github.io/ChildrenStoryBookWeb/**

Source: **https://github.com/axiomplaystudios/ChildrenStoryBookWeb**

`.github/workflows/deploy-pages.yml` installs locked dependencies, runs unit tests, builds for the repository's Pages path, and publishes only `dist/`. Push changes to `main` to redeploy. The workflow can also be run manually from the repository's **Actions** tab. View deployment status and the published address in **Settings → Pages**; its source must be **GitHub Actions**.

HTTPS access works independently of your computer and home Wi-Fi. Wait for the offline-ready message before disconnecting, then use your browser's Add to Home Screen/Install option.

For a fork, enable **Settings → Pages → Source → GitHub Actions**, then run the deployment workflow. The workflow derives the correct base path from GitHub Pages configuration.

Official references: [Vite deployment guide](https://vite.dev/guide/static-deploy.html#github-pages), [GitHub Pages setup](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Phone cannot reach the local development server

Keep `npm run dev` running on the computer and use its current **Network** URL, including `http://` and the printed port. `localhost` on a phone refers to the phone itself. If port 5173 is occupied, Vite may select another port; check its output.

- On newer Android versions, check **Settings → Apps → Chrome → Permissions → Nearby devices**. If denied, allow it and reopen Chrome. This resolved local access on the Samsung S25 tested during development. [Android local-network permission documentation](https://developer.android.com/privacy-and-security/local-network-permission).
- Check that the phone and computer use the same regular home Wi-Fi network. Guest networks and router settings called AP/client/wireless isolation can prevent communication between devices.
- Temporarily disconnect any VPN and confirm the browser keeps the URL as `http://` instead of upgrading it to HTTPS.
- If the issue persists, inspect active firewall rules and connection attempts before changing settings. Public GitHub Pages access does not require exposing a development port through your router.

## Illustration animations

The scene renderer uses the original image for loading/error/reduced-motion fallback. Optional `page.scene` metadata describes a background, ordered image layers in original illustration coordinates, and validated motion tracks. The catalog checks all nested assets; SVG viewBoxes keep layers aligned in fullscreen and portrait/spread layouts. Hidden pages and tabs pause playback; temporary page-turn copies inherit frozen SVG poses without their own timers.

Run `node scripts/prepare-animation-samples.mjs`, `node scripts/prepare-pip-scenes.mjs`, and `node scripts/prepare-sloth-scenes.mjs` to rebuild the Pip and Sloth scene assets and metadata from the untouched originals. Pip uses a small vector tear asset styled to match the illustration; the Sloth cutouts embed original pixels with SVG masks. Local white and ink repairs replace stationary parts; the original flight trails remain. Generated background-edit drafts were evaluated but not used because they changed surrounding linework. No runtime image service is required.

The Mouse book uses new vector illustrations designed as separate parts. `node scripts/prepare-mouse-art.mjs` rebuilds its authoring assets; re-review them before updating the installed copy.
