# Interactive story validation and maintenance

The release gate covers **21 titles: 13 legacy books / 139 pages plus 8 pairs / 16 interactive editions**. The adult reads both editions aloud. Audio generation and microphone checks are outside the approved scope. Authoring and provenance rules are in the [authoring contract](interactive-story-authoring.md) and [book sources](../Implementation_Details/book-sources.md).

## Repeatable checks

Use Node 22.12 or newer and `npm ci`. Image validation and browser tests use `/usr/bin/google-chrome` when available; otherwise run `npx playwright install chromium` or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

```sh
# Read-only validation of every final authoring package, including image decoding:
for pair in authoring/interactive/*/pair.json; do
  node scripts/interactive/prepare-pair.mjs check "${pair%/pair.json}" || exit 1
done

# Schema/state/content unit tests, catalog generation, production build and browser suite:
npm run check
git diff --check

# The regenerated catalog reports actual complete package bytes:
node -p "JSON.stringify(require('./public/interactive/catalog.json').map(({id,totalBytes}) => ({id,totalBytes})), null, 2)"

# Standalone real legacy-to-current upgrade at the GitHub Pages base path:
npx playwright test --config tests/browser/helpers/upgrade.config.mjs --reporter=line

# Production preview after checks (local only):
npm run preview -- --port 4173 --strictPort
```

`npm run check` includes the upgrade test through the default browser test directory. The standalone config avoids starting the shared preview, making that regression independently runnable. It exports released commit `a03e676` with `git archive` into ignored `.superpowers/scratch/`, copies the current source/public snapshot, builds both with `--base /ChildrenStoryBookWeb/`, and serves them on one isolated ephemeral origin. It never checks out/reset the active worktree or writes shared `dist` or public catalogs. The legacy git object must exist locally; fetch the project history if it is absent. Scratch trees are removed on completion.

The upgrade journey completes a legacy book through the UI; retains its completion, warm and sound settings; reloads/navigates offline; returns online and accepts the released client’s update control; discovers eight pair cards and thirteen legacy cards; verifies nested service-worker scope; exercises a real server download failure/retry; defers a subsequent shell update during interactive reading; accepts it from the shelf; retains usable catalog cards on refresh failure; and reopens downloaded artwork after an offline reload. Server errors operate below the service worker rather than injecting a fake base URL or bundle-store import.

## Content and visual gates

Both editions must finish through real activities, reopen saved progress, restart only their own run, and work entirely on screen. Consequence tests independently enumerate each 64-route truth table, checking repair, final layers and readable recaps. Experiment tests separate configuration from prediction, require prediction before Test, retain comparison trials and verify both outcomes. Discovery checks include match/sequence alternatives, optional participation and skip. Placement checks independently count pictured orders, pieces and completed groups.

Inspect every exact final asset and scene, all outcomes and guidance, motion at 0.5×/1×/2× after later cycles, and reduced-motion composed outcomes before setting review flags. Review records and creator credits travel in each downloaded package. Asset hashes/decodes and automated motion calculations supplement actual visual inspection. Regeneration invalidates review; create and review a new version before installing changes to a released package.

Legacy book assets must remain byte-identical to `a03e676`. The shared renderer retains existing defaults, page turns, fullscreen, speed overrides, pause/replay and offline legacy caching. Pair versions are excluded from shell precaching; only summaries and small covers join the shell, and full packages use explicit verified downloads. Failed or cancelled updates retain usable prior versions. Cache/IndexedDB keys are scoped to the real application base. Web Locks provide cross-tab coordination where available; the fallback coordinates the same JavaScript realm only.

## Measured release evidence

All eight final authoring packages passed `prepare-pair.mjs check` on 11 November 2026, including actual image decoding and complete review records. A separate `checkPair` pass compared every validated authoring file and generated manifest byte-for-byte with its installed immutable version. The measured totals include every image, metadata file and bundle manifest:

| Pair (v1) | Scenes | Package files | Manifest bytes | Total bytes |
| --- | ---: | ---: | ---: | ---: |
| Amara’s Busy Bakery | 8 | 74 | 14,331 | 303,899 |
| Bolt and the Toy Parade | 8 | 92 | 17,498 | 222,305 |
| Imani and the Lost Shape Map | 8 | 82 | 15,833 | 191,861 |
| Mina and the Shadow Stage | 8 | 69 | 13,270 | 228,405 |
| Nori’s Seaside Picnic | 7 | 62 | 11,594 | 188,340 |
| Tavi’s Dinosaur Ramp Rally | 8 | 69 | 13,257 | 255,717 |
| The Penguin Sound Post | 8 | 82 | 15,833 | 185,410 |
| Zuri’s Rooftop Garden | 7 | 64 | 12,016 | 212,816 |

The eight packages total **1,788,753 bytes**, each below the 15 MiB limit. Catalog counts are 21 titles / 16 interactive editions / 13 legacy titles / 139 legacy pages. `git diff a03e676 --exit-code -- public/books` passed with no changes.

The final integration run on 11 November 2026 used stable content through `d72b579` (including the experiment prediction correction `622634e`). **`npm run check` passed: 166 unit tests, production build, and 174 browser tests; zero failures.** The browser suite took 9.3 minutes. Its real nested legacy-upgrade regression passed in 12.3 seconds. The build validated both catalogs and generated 538 shell precache entries (6,830.63 KiB); full pair versions remain on demand. `git diff --check` passed.

Content task reviews are approved. Their exact-art evidence includes all scene/control/guidance pictures, outcome combinations, both editions’ journeys, late-cycle motion at 0.5×/1×/2× and reduced-motion outcomes. The final collection supplement inspected 42 additional motion/still contact sheets for the preceding seven pairs; Bolt has its own complete asset/scene/guidance review. Package review records retain the attestations. A fresh whole-branch review against the approved spec follows the integration checkpoint; its findings and any affected reruns must be recorded before claiming final release readiness.

## Device limitations

Physical touch hardware was unavailable for this integration review. Chromium phone/touch emulation covers automated interaction/layout paths; it is **not** physical iPad Safari or Android validation. Real-device page dragging, safe areas, fullscreen, home-screen installation, storage eviction and wake-lock behavior remain unverified. No push, merge or deployment is part of this release gate.
