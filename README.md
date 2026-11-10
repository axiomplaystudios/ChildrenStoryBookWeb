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

Wait for “Ready for offline reading” before disconnecting. Both complete books are cached together (about 1 MB of precached assets). Browser storage can be evicted, so offline availability is subject to browser/device storage rules. Use the HTTPS GitHub Pages address for home-screen installation. Physical iPad/Android installation and wake-lock behavior still need device checks.

## What is included

- Cover shelf, realistic StPageFlip turns, edge taps, touch swipes and arrow-key navigation.
- One page in portrait; two-page spreads in landscape. A **Full screen** button expands the reader to the available display, with page controls and an exit button always visible. Rotation keeps the current page in view. Escape exits full screen first; outside full screen it returns to the shelf.
- A static tap/swipe reader when reduced motion is enabled or the page-turn library fails.
- Four spoken questions with relevant pictures and a hidden suggested answer. No scoring or recording.
- Warm palette, optional quiet page rustle/chime, gradual reader tint and best-effort wake lock.
- Completion stars and preferences saved only in this browser. Blocked storage does not prevent reading.
- **Pip Finds a Friend:** an original eight-page sample reconstructed from the plan, not the unavailable earlier prototype.
- **Sleepy Mr Sloth:** twelve pages by Book Dash, with original illustrations converted to WebP and full attribution.
- Offline support and an install manifest through `vite-plugin-pwa`. Updates are offered from the shelf instead of interrupting a story.

See [book provenance and adaptations](Implementation_Details/book-sources.md). Book Dash content is CC BY 4.0; those licences and creator credits remain attached to the book. No licence for the rest of the project is implied.

## Full-screen reading

Open a book and tap **Full screen** in the reader toolbar. Rotate your device freely: portrait shows a single page, landscape shows a two-page spread. Tap **Exit full screen** to return to normal reading. Returning to the shelf or starting the questions also exits full screen.

The app requests native full screen directly from your tap and does not lock orientation. On browsers that do not support or allow it, it uses an **expanded view** filling the browser viewport; browser bars may remain. For more space on iPhone, use Safari’s **Share → Add to Home Screen**, then launch the installed app. Safari supports the unprefixed Fullscreen API on iPadOS 16.4 and later; capability detection and the expanded fallback also cover other browser versions. [WebKit release notes](https://webkit.org/blog/13966/webkit-features-in-safari-16-4/).

Automated checks cover native entry/exit, denied/unavailable APIs, phone/tablet rotation, short landscape displays, and navigation during pending requests. Actual iPad Safari fullscreen transitions and device safe-area behavior still need physical-device checks. At unusually short viewport heights (around 240 px), illustrations may become small so text and controls remain accessible.

## Add a book

1. Create `public/books/a-book-slug/` and put its cover, illustrations and `story.json` there.
2. Follow either included story as the schema. Each page has `image`, `text`, and `alt`. Four questions use `q`, `a`, `type` and **one-based** `hintPage` values. Include two `literal`, one `feeling` and one `personal` question.
3. Include a real `credit`, optional HTTPS `sourceUrl` and `licenseUrl`, and an optional local `logo`. Verify reuse terms for that particular edition. Use safe local filenames, not remote URLs.
4. Restart `npm run dev` or run `npm run build`. The catalog generator discovers book folders, validates metadata and checks every referenced asset. A production rebuild also includes new books in the offline cache.

Do not edit `public/books/catalog.json` by hand; it is generated from the folders. Books are trusted, repository-authored content. SVG assets are displayed as images.

## Verify

```sh
npm test                 # schema, asset discovery, reading state and storage
npm run build            # catalog validation, Vite and PWA build
npm run test:browser     # complete reading flow, layouts, fallback, offline
```

Browser tests use installed Google Chrome at `/usr/bin/google-chrome` when available. Otherwise install Playwright Chromium with `npx playwright install chromium`. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use another Chromium executable. Browser tests cover the complete reading flow, responsive layouts, touch gestures, fallback navigation and offline reading.

`npm audit --omit=dev` reports no runtime advisories at implementation time. The current PWA build toolchain reports six transitive development advisories (two low, four moderate); npm's proposed automatic fix is a major downgrade of the PWA plugin. No forced downgrade was applied. Recheck the upstream build dependencies when updating packages.

## Scope and device checks

This implements the first-version reading experience with GitHub Pages deployment. Book provenance is included in this repository; local planning notes and diagnostic logs stay in the development workspace.

Still check on real hardware: iPad Safari page dragging, Android touch behavior, home-screen installation, wake-lock behavior after backgrounding, and text size at your usual reading distance. Small landscape phones may scroll vertically to keep text readable. Character animation, hand-cut art and story-specific tappable sounds remain later polish; page turns provide motion in this version.

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
