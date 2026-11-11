import { build } from 'vite';
import { mkdir, writeFile, cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import {
  pairFixture,
  drawing,
  sourceFixture,
  reviewFixture,
} from '../../fixtures/interactive/pair.mjs';
import { bundleManifest } from '../../../scripts/interactive/prepare-pair.mjs';

// Build the real browser module; preview never serves /src. All generated test
// files live under ignored dist, and no test hooks enter the application.
export async function prepareBundleFixtures({ pairs = 1 } = {}) {
  const temp = await mkdtemp(join(tmpdir(), 'interactive-browser-')),
    publicDir = join(temp, 'public'),
    summaries = [];
  try {
    await cp('public', publicDir, { recursive: true });
    for (let index = 0; index < pairs; index++)
      for (const version of ['v1', 'v2']) {
        const pair = pairFixture();
        if (index) {
          pair.id = `fixture-pair-${index + 1}`;
          pair.title = `A Welcome ${index + 1}`;
        }
        pair.version = version;
        if (pairs > 1) {
          pair.scenes[2].activity.options[0].effects.push({
            type: 'show',
            sceneId: 'scene-3',
            layerId: 'result',
          });
          pair.scenes[2].activity.options[1].effects.push({
            type: 'hide',
            sceneId: 'scene-3',
            layerId: 'result',
          });
          if (index === 1) {
            pair.scenes[0].activity.items[0].quantity = 2;
            pair.scenes[0].activity.targets[0].required = 2;
          }
          if (index === 3) { pair.scenes[2].scene.tracks[0].preset = 'fade-in'; pair.scenes[2].scene.tracks[0].parameters = {}; }
        if (index === 2) {
            pair.scenes[3].activity.screen.mode = 'sequence';
            pair.scenes[3].activity.screen.answer = [
              'round',
              'square',
              'round',
            ];
          }
        }
        const encode = (value) => Buffer.from(JSON.stringify(value) + '\n');
        const files = new Map([
          ['pair.json', encode(pair)],
          ['source.json', encode(sourceFixture(pair))],
          ['visual-review.json', encode(reviewFixture(pair))],
          ['drawing.svg', Buffer.from(drawing)],
        ]);
        const manifest = bundleManifest(pair, files),
          bytes = encode(manifest),
          folder = join(publicDir, 'interactive', pair.id, version);
        await mkdir(folder, { recursive: true });
        for (const [file, data] of [...files, ['bundle.json', bytes]])
          await writeFile(`${folder}/${file}`, data);
        const covers = join(publicDir, 'interactive/covers');
        await mkdir(covers, { recursive: true });
        await writeFile(join(covers, `${pair.id}--${version}.svg`), drawing);
        summaries.push({
          id: pair.id,
          version,
          title: pair.title,
          category: pair.category,
          credit: pair.credit,
          cover: `./covers/${pair.id}--${version}.svg`,
          manifestUrl: `./${pair.id}/${version}/bundle.json`,
          manifestSha256: createHash('sha256').update(bytes).digest('hex'),
          manifestBytes: bytes.length,
          totalBytes:
            bytes.length +
            [...files.values()].reduce((n, b) => n + b.length, 0),
        });
      }
    await writeFile(
      join(publicDir, 'interactive/catalog.json'),
      JSON.stringify(summaries.filter((s) => s.version === 'v1')),
    );
    // Real production config sees fixture versions while generating Workbox. This
    // catches an accidental reintroduction of eager pair precaching.
    await build({ publicDir, logLevel: 'silent' });
    await build({
      configFile: false,
      publicDir: false,
      logLevel: 'silent',
      build: {
        outDir: 'dist',
        emptyOutDir: false,
        lib: {
          entry: 'src/interactive/bundles.js',
          formats: ['es'],
          fileName: () => '__bundle-tests.js',
        },
      },
    });
    return summaries;
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

export async function mountBundleFixture(page, base = '/') {
  await page.route('**/__bundle-fixture.html', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>Bundle fixture</title><script type="module">import {createBundleStore} from "/__bundle-tests.js";window.createBundleStore=createBundleStore;</script>',
    }),
  );
  await page.goto('/__bundle-fixture.html');
  await page.waitForFunction(
    () => typeof window.createBundleStore === 'function',
  );
  await page.evaluate((base) => {
    window.store = window.createBundleStore({
      baseUrl: new URL(base, location.origin),
    });
  }, base);
}

// Other browser specs must see the ordinary application build after this spec.
export const restoreBundleBuild = () => build({ logLevel: 'silent' });
