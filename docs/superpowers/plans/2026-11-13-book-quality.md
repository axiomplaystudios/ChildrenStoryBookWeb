# Bedtime Bookshelf Quality Improvement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make the ten Learn Together books look like finished picture books, then fix the two layouts that make every book look sparse (reader on a phone, shelf on a tablet), and finally tidy the flat sentences in those ten books.

**Architecture:** The ten books stay code-generated vector art, rebuilt by the scripts in `scripts/learning/`. A new shared art kit (characters with poses and faces, layered scenery, shaded objects, outlined lettering) replaces the current helpers; each book's generator is rewritten so every page has its own composition, and each book gets its own cover. The reader, scene format and installer are reused unchanged in Phase 1.

**Tech Stack:** JavaScript ES modules on Node 24, SVG, `node:test`, Playwright. New development-only packages: `opentype.js@2.0.0` and `@fontsource/andika@5.3.0` (SIL OFL 1.1), used only when pictures are generated.

**Spec:** None. The design conversation was skipped at the user's request ("please do"), so the section "What was asked and what I decided" below stands in for it.

---

## Summary for review

Read this part; the task list after it is the working detail.

### What was asked and what I decided

You asked me to "improve the quality" and told me to go ahead with my own pick. I looked at all thirteen books and the app at phone and tablet sizes. These are my calls, in the order I would do them. Strike or reorder any of them.

| Phase | What changes | What you would see |
| --- | --- | --- |
| 1. Pictures in the ten Learn Together books | All 108 pages and 10 covers are redrawn | Bigger, expressive characters; a different scene on each page; shading and depth; each book has its own cover with its title on it; several things move gently on each page instead of one |
| 2. Reader on a phone | Page layout in portrait | The picture sits directly above the words with no blank bands; long book titles are no longer cut off |
| 3. Shelf on a tablet | Shelf layout | Three books per row on an iPad in landscape, grouped as "Bedtime stories" and "Learn together" |
| 4. Wording in the ten Learn Together books | Flat sentences are polished | I show you a before/after table first; nothing changes until you approve it |

### What does not change

- Story text, questions, page counts and book IDs (until Phase 4, and then only what you approve).
- A House for Mouse, Pip Finds a Friend and Sleepy Mr Sloth.
- How the reader, page turns, full screen, speed controls and offline saving work.
- The teaching rules already written into the books: counted objects, pattern rows, shape examples and position examples never move, and the planet facts stay as checked against NASA.

### Calls I made that you may want to overrule

1. **Redrawn characters.** Pip, Mouse, Rabbit and Bear are redrawn facing the reader, larger, with changeable arms, eyes, mouths and eyebrows. They keep their colours and Mouse keeps the red scarf, so they still match the three books I am not touching, but they will not be line-for-line identical to them.
2. **Lettering as drawn shapes.** Letters, numbers and words inside pictures are currently typed in Verdana, which looks different on an iPad, an Android phone and a laptop. I will draw them as shapes from Andika Bold, a free typeface made for early readers (single-storey "a" and "g", capital "I" with bars). I compared four typefaces; the comparison is at `/tmp/claude-1000/-home-jonathan-AxiomPlayStudios-ChildrenStoryBookWeb/758611b9-5941-4f36-b9f4-afe38d87fd4d/scratchpad/work/fontsheet.png`.
3. **Titles on covers.** Each new cover carries the book's title, like a printed book.
4. **More files to save for offline reading.** Richer pictures and more moving parts roughly double the number of files the app saves (about 530 now, about 1,150 after) and add an estimated 5 to 8 MB. I hold each picture file under 120 KB and report the real total.
5. **Two new development packages** (above). They are not shipped to readers.

### Left out on purpose

- The eight interactive story pairs on `feature/interactive-story-pairs`. That branch is unmerged and untouched by this plan. Its tests do not pin the old pictures, so I expect no conflict beyond `README.md` and `package.json`, to be checked when it merges.
- Redrawing or re-covering the three non-learning books.
- Sounds, narration and tappable pictures.

### Where things stand

- Working branch: `feature/learning-art-quality`, created from `main`. Nothing is committed.
- Task 1 is done: the checks for the new picture standards exist and fail against today's books, as intended (31 failing, all for the expected reasons).
- Implementation is now present in the working tree. See `2026-11-13-book-quality-results.md` for verification and approved wording changes.

### What I need from you

1. Does this plan capture what you want, including the four phases and their order?
2. Any of the five calls above you want changed?
3. Do you want a commit on the branch after each task, or everything left uncommitted until you say?

---

## Global Constraints

- Canvas stays 900 by 720. Book IDs, page counts, page text, alt-text meaning, questions and `learning` metadata stay as they are in Phase 1.
- Every authored track uses `playback: "repeat"` and `restMs <= 1800` (existing importer rule).
- Pictures use only the SVG tags and attributes that `scripts/prepare-book.mjs` accepts. No `<text>`, `style`, `class`, `filter`, scripts or external references.
- Counted objects, pattern rows, shape examples, position examples and all lettering are static. Only characters and surroundings move.
- Calm pace: idle breathing 2600 to 3400 ms, blink cycle 2300 ms, waves 2000 to 3000 ms, surroundings 6000 to 10000 ms. No flashing. No character travels more than 40 px.
- Each SVG file is at most 120 KiB. A book averages at most 110 KiB per page across all its files, and at most 9 files per page.
- Generators are deterministic: the same script run twice writes identical files.
- Regenerating resets review flags. A book is installed only after its pictures and motion have been looked at, as `docs/assisted-book-workflow.md` requires.
- Nothing is committed, pushed, merged or published until the user says so.

## Review Focus

1. **Reduced motion or a failed layer shows the static picture.** Eyelid layers are invisible at rest; if they were flattened into the static picture, every character would have closed eyes on the fallback, the question hint pictures and the cover. Pinned in Task 5.
2. **A slow phone.** A rich background plus five moving layers must not stutter. Measured in Task 16 on the heaviest page with 4x CPU slowdown; a page that averages over 12 ms per frame is simplified.
3. **A small screen.** At 390 px wide the picture is 41% of authored size. Letter pairs are at least 100 px tall as authored, words at least 40 px, and no lettering is under 18 px. `label` refuses anything smaller (Task 2), and each book task checks lettering by eye at phone width.
4. **Saving for offline on a weak connection.** The file count roughly doubles. The existing offline browser tests must pass, and Task 16 reports the precache entry count and size against a 16 MiB ceiling.
5. **A child who knows the other three books.** Pip, Mouse and Rabbit must still be recognisably the same friends. Task 3 compares the new cast side by side with Pip Finds a Friend and A House for Mouse before any book is redrawn.

---

## File map

| File | Responsibility |
| --- | --- |
| `scripts/learning/art.mjs` (rewrite) | Shape helpers, palette, gradient and symbol registry, seeded random, `svg()` wrapper, outlined lettering |
| `scripts/learning/cast.mjs` (new) | Pip, Mouse, Rabbit, Bear, Teddy as posable characters; `actor()` turns one into moving layers |
| `scripts/learning/scenery.mjs` (new) | Skies, hills, trees, garden, pond, rooms, furniture, signs, and moving surroundings |
| `scripts/learning/props.mjs` (new) | The 26 alphabet objects, picnic items, blocks, buckets, carts, wooden shapes |
| `scripts/learning/package.mjs` (modify) | `scene()` assembly, `writeBook()` with guards |
| `scripts/learning/literacy.mjs`, `concepts.mjs`, `world.mjs` (rewrite scenes only) | Per-book page compositions; text, questions, notes and references are carried over unchanged |
| `scripts/learning/review.mjs` (new) | Renders contact sheets and motion sheets for looking at a book |
| `scripts/learning/reinstall.mjs` (new) | Validates a reviewed package and swaps it into `public/books/` |
| `tests/learning-art.test.mjs` (new, done) | The picture standards |
| `tests/helpers/loop-sampling.mjs` (new, done) | `posesSeenByBrowserSampling(track, offset = 0)`, shared by the picture and kit tests |
| `tests/learning-kit.test.mjs` (new) | Art kit, cast, scenery, props and packaging behaviour |
| `tests/learning-books.test.mjs` (modify, done) | Alphabet labels read from outline titles |
| `src/style.css`, `src/reader.js`, `src/main.js` | Phases 2 and 3 only |

---

## Phase 1: Pictures in the ten Learn Together books

### Task 1: Picture standards as failing checks (done)

**Files:** created `tests/learning-art.test.mjs` and `tests/helpers/loop-sampling.mjs`; modified `tests/learning-books.test.mjs`.

- [x] For each of the ten books: the cover differs from page one; no asset contains `<text`; every page has at least two tracks; every track shows more than one pose under the browser loop test's 617 ms sampling at four offsets; no file over 120 KiB, at most 110 KiB per page, and at most 7 layers (9 files) per page.
- [x] The alphabet check reads labels from `<title>` elements and rejects `<text>`.
- [x] Ran `node --test tests/learning-art.test.mjs tests/learning-books.test.mjs`: 31 fail (cover, lettering and moving-parts for all ten books, plus the alphabet label check), 36 pass.

### Task 2: Shape helpers and outlined lettering

**Files:** rewrite `scripts/learning/art.mjs`; modify `package.json` and `package-lock.json`; create `tests/learning-kit.test.mjs`.

**Produces:**
- `ink = '#5d473f'`, `palette` (named hex values for fur, skies, greens, woods and accents)
- `P(d, fill = 'none', stroke = ink, width = 4, extra = {})`, `E(cx, cy, rx, ry, fill, stroke = 'none', width = 4, extra = {})`, `R(x, y, w, h, fill, radius = 0, stroke = 'none', width = 4, extra = {})`, `G(content, {x = 0, y = 0, s = 1, rot = 0, opacity} = {})`, each returning an SVG string
- `gradient(id, kind, stops, attrs)` and `define(id, content)` register reusable pieces; `use(id, x, y, s = 1, rot = 0)` references one; `svg(content)` returns a complete 900 by 720 document containing only the gradients and symbols that `content` references
- `random(seed)` returns a repeatable `() => number` in `[0, 1)`
- `shadow(x, y, rx, ry = rx * 0.28, opacity = 0.16)` returns a soft ground shadow
- `label(text, x, y, size, {fill = ink, anchor = 'middle', outline, outlineWidth = size * 0.22} = {})` returns `<g><title>TEXT</title>...paths...</g>`; `labelWidth(text, size)` returns a number
- `esc(value)`

- [x] **Step 1: Install the two packages.** Run `npm install --save-dev --save-exact opentype.js@2.0.0 @fontsource/andika@5.3.0`. Expected: `package.json` gains both under `devDependencies`.
- [ ] **Step 2: Write the failing tests** in `tests/learning-kit.test.mjs`:

```js
test('label draws outlines with a readable title and no device font', () => {
  const art = label('A a', 450, 200, 100);
  assert.match(art, /^<g><title>A a<\/title><path d="M[^"]+" fill="#5d473f"\/><\/g>$/);
});
test('label with an outline draws the outline underneath the fill', () => {
  const art = label('red', 450, 200, 54, {fill: '#db4541', outline: '#fff6e0'});
  assert.ok(art.indexOf('stroke="#fff6e0"') < art.indexOf('fill="#db4541"'));
});
test('label escapes its title and centres on its anchor', () => {
  assert.match(label('Pip’s <party>', 450, 80, 40), /<title>Pip’s &lt;party&gt;<\/title>/);
  const width = labelWidth('apple', 40);
  assert.ok(width > 80 && width < 140);
});
test('label refuses lettering too small to read on a phone', () => {
  assert.throws(() => label('tiny', 450, 200, 12), /at least 18/);
});
test('svg() carries only the gradients and symbols a picture uses', () => {
  gradient('kit-test-a', 'linear', [[0, '#fff'], [1, '#000']]);
  gradient('kit-test-b', 'linear', [[0, '#fff'], [1, '#000']]);
  const out = svg(R(0, 0, 900, 720, 'url(#kit-test-a)'));
  assert.ok(out.includes('id="kit-test-a"') && !out.includes('id="kit-test-b"'));
  assert.match(out, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="900" height="720" viewBox="0 0 900 720">/);
});
test('random(seed) repeats for one seed and differs for another', () => {
  const a = random(7), b = random(7), c = random(8);
  assert.equal(a(), b());
  assert.notEqual(random(7)(), c());
});
```

- [ ] **Step 3: Run** `node --test tests/learning-kit.test.mjs`. Expected: FAIL, the named exports do not exist.
- [x] **Step 4: Implement `art.mjs`.** Lettering loads `node_modules/@fontsource/andika/files/andika-latin-700-normal.woff` with `opentype.parse`, and writes path data to one decimal place. Numbers written by helpers are rounded to one decimal place.
- [x] **Step 5: Run** `node --test tests/learning-kit.test.mjs`. Expected: PASS.

### Task 3: The cast

**Files:** create `scripts/learning/cast.mjs`; extend `tests/learning-kit.test.mjs`.

**Consumes:** Task 2 helpers.

**Produces:**
- `mouse(o)`, `pip(o)`, `rabbit(o)`, `bear(o)`, `teddy(o)` each return a `Character`.
- Options `o`: `{x, y, s = 1, armL = 0, armR = 0, look = [0, 0], eyes = 'open', mouth = 'smile', brows, tail = 'R', holdL, holdR, lean = 0, sit = false, tear = false}`. `x, y` is the point between the feet. Arm values are degrees raised from hanging (0 down, 90 level, 160 up). `eyes` is one of `open | happy | closed | wide`; `mouth` one of `smile | grin | o | sad | flat | wavy`; `brows` one of `sad | angry | worried | up` or absent. `holdL` and `holdR` are art strings drawn upright in that hand.
- `Character`: `{art, shadow, parts: {tail, ears, body, armL, armR, lids}, pivots: {tail, earL, earR, armL, armR, feet}, hand(side), top}`. `art` is the whole character without eyelids. `hand('L' | 'R')` returns `[x, y]` in picture coordinates.
- `actor(id, character, {idle = 'breathe', wave, tail = false, ears = false, blink = true, delay = 0} = {})` returns `{shadow, layers, tracks}`. `idle` is `breathe | bob | null`; `wave` is `L | R` or absent. Layer order and ids: `ID-tail` (only when `tail`), `ID-ears` (only when `ears`), `ID`, `ID-arm` (only when `wave`, child of `ID`), `ID-lids` (only when `blink`, child of `ID`, with `restHidden: true`). Parts that are not animated are merged into `ID`.

**Look:** large head (about 45% of height), eyes with two highlights, blush cheeks, belly patch, 4 px ink outline with round joins. Mouse: grey-taupe fur, pink ears and tail, red scarf. Pip: warm brown owl, cream eye discs and belly, ear tufts, wings as arms. Rabbit: cream, long ears, white tail. Bear: brown, tan muzzle and belly, about 1.4 times Mouse's height. Teddy: golden toy bear with red bow and stitched tummy, clearly not Bear.

- [ ] **Step 1: Write the failing tests:**

```js
for (const [name, make] of Object.entries({mouse, pip, rabbit, bear, teddy})) test(`${name} stands on its feet point with both hands reachable`, () => {
  const c = make({x: 450, y: 600});
  assert.ok(c.art.length > 500 && c.shadow.includes('<ellipse'));
  assert.ok(c.top < 600 - 150);
  for (const side of ['L', 'R']) assert.equal(c.hand(side).length, 2);
  assert.ok(c.hand('L')[0] < 450 && c.hand('R')[0] > 450);
});
test('raising an arm moves that hand up and outward', () => {
  const down = mouse({x: 450, y: 600}).hand('L'), up = mouse({x: 450, y: 600, armL: 120}).hand('L');
  assert.ok(up[1] < down[1] && up[0] < down[0]);
});
test('a face changes with eyes, mouth and brows', () => {
  const faces = ['happy', 'sad', 'angry', 'worried'].map(brows => bear({x: 450, y: 600, brows: brows === 'happy' ? undefined : brows, mouth: brows === 'happy' ? 'grin' : 'sad'}).art);
  assert.equal(new Set(faces).size, 4);
});
test('actor() returns layers and tracks the reader accepts', () => {
  const a = actor('mouse', mouse({x: 450, y: 600}), {wave: 'L', tail: true});
  assert.deepEqual(a.layers.map(l => l.id), ['mouse-tail', 'mouse', 'mouse-arm', 'mouse-lids']);
  assert.equal(a.layers.find(l => l.id === 'mouse-lids').restHidden, true);
  assert.equal(a.layers.find(l => l.id === 'mouse-arm').parent, 'mouse');
  validateScene({width: 900, height: 720, background: 'b.svg', tracks: a.tracks,
    layers: a.layers.map(l => ({id: l.id, image: 'x.svg', x: 0, y: 0, width: 900, height: 720, pivot: l.pivot, ...(l.parent ? {parent: l.parent} : {})}))});
  for (const t of a.tracks) for (const offset of [0, 137, 290, 451]) assert.ok(posesSeenByBrowserSampling(t, offset) > 1, t.layer);
});
test('an actor with nothing switched on is one still layer', () => {
  const a = actor('bear', bear({x: 450, y: 600}), {idle: null, blink: false});
  assert.deepEqual(a.layers.map(l => l.id), ['bear']);
  assert.equal(a.tracks.length, 0);
});
```

- [ ] **Step 2: Run** `node --test tests/learning-kit.test.mjs`. Expected: FAIL, `cast.mjs` does not exist.
- [x] **Step 3: Implement `cast.mjs`.** Blink uses the `blink` preset with `durationMs: 700, restMs: 1600`. Breathing uses `breathe` with `amount` 0.02 to 0.03 pivoting at the feet. A wave uses `flap` or `gesture` pivoting at the shoulder; a tail uses `flap` pivoting at the tail base.
- [x] **Step 4: Run** the kit tests. Expected: PASS.
- [x] **Step 5: Look at the cast.** Render one sheet with each character in four poses and six faces at scale 1.5, and a second sheet placing new Pip, Mouse and Rabbit beside page one of Pip Finds a Friend and A House for Mouse. Fix until each character reads as cute and expressive at a glance, limbs stay attached at arm angles 0, 90 and 160, and each is recognisably the same friend as in the untouched books.

### Task 4: Scenery and objects

**Files:** create `scripts/learning/scenery.mjs` and `scripts/learning/props.mjs`; extend `tests/learning-kit.test.mjs`.

**Produces (scenery):**
- `outdoor({time = 'day', seed = 1, plain = false, trees = [], pond, path, fence, far = true} = {})` returns art for sky, sun or moon, clouds, three hill layers, grass tufts and flowers. `time` is `morning | day | golden | dusk | night`. `plain: true` leaves out flowers, leafy sprigs and fruit, for counting pages.
- `indoor({seed = 1, wall, window, items = []} = {})` returns a room: papered wall, skirting, plank floor, arched window with a view, and listed furniture.
- Pieces: `sun`, `moon`, `starfield(seed, count)`, `cloud`, `tree(x, y, s, kind, seed)` with kinds `round | apple | plum | pine`, `bush`, `fence`, `pond`, `gardenBed`, `bunting`, `plaque(text, x, y, size, {fill})` (a cream sign carrying a `label`), `letterCard(upper, lower, x, y)`, `easel(x, y, s, picture)`, `stump`, `table`, `blanket`, `basket`, `rug`, `shelf`, `lamp`, `toyBox`, `stool`, `openBox`.
- Moving surroundings, each returning `{layers, tracks}`: `drift(id, art, {dx, ms})`, `flutter(id, x, y, colour, {rx, ry, ms})`, `twinkle(id, art, {ms, delay})`, `sway(id, art, pivot, {angle, ms})`, `fall(id, art, {distance, ms})`.

**Produces (objects):**
- `prop(kind)` returns `{art, base}`, centred on x = 0 with `base` the y of its lowest point. Kinds: the 26 alphabet words (`apple ball cup drum egg fish gift hat insect jug kite leaf moon nest orange paintbrush quilt rabbit sock teddy umbrella vase wagon x-ray yarn zip`) and `sandwich carrot napkin spoon strawberry flower`.
- `place(kind, x, groundY, s = 1)` returns the object standing on `groundY` with its shadow.
- `block`, `bucket(full)`, `cart`, `woodShape(kind, x, y, size, colour)` with exact circle, square, triangle and rectangle outlines.

**Look:** scenery has no ink outlines so characters and objects stand forward. Every object has a lighter highlight and a darker shade. The insect has exactly six legs.

- [ ] **Step 1: Write the failing tests:**

```js
test('every alphabet and picnic object is drawn', () => {
  for (const kind of 'apple ball cup drum egg fish gift hat insect jug kite leaf moon nest orange paintbrush quilt rabbit sock teddy umbrella vase wagon x-ray yarn zip sandwich carrot napkin spoon strawberry flower'.split(' ')) {
    const p = prop(kind);
    assert.ok(p.art.length > 100 && Number.isFinite(p.base), kind);
  }
  assert.throws(() => prop('unicorn'));
});
test('outdoor scenery repeats for one seed and differs for another', () => {
  assert.equal(outdoor({seed: 3}), outdoor({seed: 3}));
  assert.notEqual(outdoor({seed: 3}), outdoor({seed: 4}));
  assert.notEqual(outdoor({seed: 3, time: 'day'}), outdoor({seed: 3, time: 'dusk'}));
});
test('plain scenery has nothing a child could count by mistake', () => {
  assert.doesNotMatch(svg(outdoor({seed: 3, plain: true})), /href="#(flower|sprig|fruit)"/);
  assert.match(svg(outdoor({seed: 3})), /href="#flower"/);
});
test('moving surroundings loop in a way the browser test can see', () => {
  for (const m of [drift('cloud', '<g/>', {dx: 40, ms: 9000}), flutter('fly', 300, 200, '#eaa85c'), twinkle('stars', '<g/>'), sway('kite', '<g/>', [500, 300]), fall('leaf', '<g/>')])
    for (const t of m.tracks) assert.ok(t.playback === 'repeat' && t.restMs <= 1800 && posesSeenByBrowserSampling(t) > 1, t.layer);
});
```

- [ ] **Step 2: Run** the kit tests. Expected: FAIL, the modules do not exist.
- [x] **Step 3: Implement** both modules.
- [x] **Step 4: Run** the kit tests. Expected: PASS.
- [x] **Step 5: Look at the kit.** Render one sheet of the five times of day, one of the room, and one of all 32 objects at scale 2. Fix anything muddy, flat or unrecognisable.

### Task 5: Scene assembly, packaging guards and review tools

**Files:** modify `scripts/learning/package.mjs`; create `scripts/learning/review.mjs` and `scripts/learning/reinstall.mjs`; extend `tests/learning-kit.test.mjs`.

**Produces:**
- `scene({text, alt, action, learning, back = [], cast = [], movers = [], front = []})` returns `{text, alt, action, learning, bg, layers, tracks}`. `back` is still art (shadows from `cast` are appended to it). Layer order is: movers marked `behind: true`, then cast, then other movers, then `front` (still art above everything, written as one untracked layer named `front`).
- `writeBook(book, {root = 'authoring'} = {})`. `book.cover` is required art. The static picture `page-NN.svg` is `bg` plus every layer except those with `restHidden`.
- `writeBook` throws when: the cover is missing or equals page one's static picture; any file contains `<text`; a track names an unknown layer; a page has fewer than two tracks; a track shows one pose under the 617 ms sampling; any file exceeds 120 KiB.
- `node scripts/learning/review.mjs <out-dir> <book-id>...` writes, per book, `BOOK-pages.png` (every static page and the cover) and `BOOK-motion.png` (each page at three moments of its loop).
- `node scripts/learning/reinstall.mjs <book-id>...` runs `checkPackage` on `authoring/BOOK`, then replaces `public/books/BOOK` with it, restoring the old folder if anything fails. It never sets review flags.

- [ ] **Step 1: Write the failing tests** using a temporary `root`: a two-page book writes `cover.svg`, backgrounds, layers and static pictures; `source.json` has `reviewed: false` and every plan page `reviewed: false`; the static picture of a page with a blinking actor does not contain the eyelid art; each of the six guard conditions throws with a message naming the page.
- [ ] **Step 2: Run** the kit tests. Expected: FAIL.
- [x] **Step 3: Implement** `scene`, the guards, `review.mjs` and `reinstall.mjs`.
- [x] **Step 4: Run** the kit tests. Expected: PASS.

### Tasks 6 to 15: One book each

Every book task follows the same steps. The art direction and the checks that are special to that book are listed under its heading.

- [ ] **Step 1:** Add any book-specific check listed below and run it. Expected: FAIL.
- [x] **Step 2:** Rewrite that book's scenes and cover in its generator. Carry text, questions, `learning`, notes and references over unchanged. Rewrite `alt` and `action` to describe the new picture truthfully.
- [x] **Step 3:** Run the generator (`node scripts/learning/literacy.mjs`, `concepts.mjs` or `world.mjs`). Expected: `Prepared BOOK: N pages (review pending).`
- [x] **Step 4:** Run `node scripts/learning/review.mjs <out-dir> BOOK` and look at both sheets against the checklist: nothing cut off at the picture edge; no part detaches at the far end of a movement; no gap opens behind a moving part; lettering clear at phone width; the learning target is the largest and strongest thing on the page; the count, pattern order, position or fact is right; consecutive pages do not look the same; alt text matches the picture.
- [x] **Step 5:** Fix and repeat Steps 3 and 4 until the checklist is clean.
- [x] **Step 6:** Set `reviewed: true` in `authoring/BOOK/source.json` and on every page of `authoring/BOOK/animation-plan.json`, then run `node scripts/learning/reinstall.mjs BOOK`.
- [x] **Step 7:** Run `npm test`. Expected: this book's checks in `tests/learning-art.test.mjs` and `tests/learning-books.test.mjs` PASS; no other test changes result.
- [x] **Step 8:** Open the book in the reader at 390 by 844 and 1180 by 820 and in full screen. Check normal speed, 0.5x, 2x, pause, replay and reduced motion.

#### Task 6: Pip's Alphabet Adventure (28 pages, `literacy.mjs`)

- A walk that gathers things for the party, through six places: orchard (A to E, morning), pond (F to J), breezy hill (K to O), the art corner under the big tree (P to T), the party field (U to Z, late afternoon), and the finished party at golden hour.
- Letter pages: the letter pair on a card at top left, at least 100 px tall; the object large at centre right on something that suits it (stump, table, blanket, easel, the sky for the kite); the word on a plaque under it; Pip on the left at about 40% of picture height, reacting.
- Guests follow the text: Mouse on B, G, Q, T and X. On R, Rabbit herself is the picture.
- Things the text says were drawn (egg, fish, moon, nest) appear as Pip's pictures on a card or easel. The real nest stays up in a tree.
- Moves: Pip breathes, waves a wing and blinks; one surrounding thing per place (cloud, butterfly, ripple, falling leaf). The object and lettering stay still.
- Cover: Pip holding an "A" card with Mouse, letters on bunting, title on a banner.
- Existing checks that must stay green: A to Z in order, each page's titles include the pair (for example `A a`) and the word.

#### Task 7: Mouse's Counting Picnic (12 pages, `literacy.mjs`)

- Page 1: Mouse with the open basket and the spread cloth under a tree.
- Pages 2 to 11: a close view of the gingham cloth. Numeral at least 150 px tall on a card at top left; "N things" on a plaque; the items in fixed, well-spaced arrangements (1 centre, 2 pair, 3 row, 4 two by two, 5 one row, 6 two by three, 7 four and three, 8 four and four, 9 three by three, 10 five and five); Mouse at the left pointing at the set.
- Counting pages use `outdoor({plain: true})`. The counted flowers and leaves are drawn from `prop`, not from scenery symbols.
- Page 12: all four friends around the cloth at golden hour. Not a counted set.
- Moves: Mouse's tail, pointing paw and blink; a cloud or butterfly. Counted items never move.
- Cover: Mouse with the basket and a big "1 2 3".
- **Book-specific check to add:** on pages 2 to 11 the static picture contains no `href="#flower"`, `href="#sprig"` or `href="#fruit"`.
- Existing checks that must stay green: exactly N unique `count-target-N` groups on each counting page, none targeted by a track.

#### Task 8: Rabbit's Rainbow Garden (10 pages, `world.mjs`)

- One garden seen from a new spot each page as it fills up: the gate (red), the vegetable bed (orange), the sunflower wall (yellow), the leafy nook (green), the stepping-stone path with Mouse (blue), the plum tree (purple), the corner by the shed (pink).
- On each colour page the surroundings are muted grey-greens, straw and soft wood, so the named colour is the only strong colour. The colour word sits on a cream plaque in its own colour (yellow uses dark ochre lettering, as now).
- Rabbit does something on every page: planting, watering, reaching up, peeking, greeting Mouse, picking, admiring.
- Page 9: seven flowers above seven matching pots with their words. Page 10: the whole garden in bloom with every earlier bed in view, Rabbit and Mouse sitting. No rainbow in the sky.
- Moves: Rabbit's ears, arm and blink; a butterfly in the page's colour; water drops on the carrot page. Colour examples stay still.
- Cover: Rabbit with a watering can among seven coloured flowers.

#### Task 9: The Little Shape Builders (8 pages, `concepts.mjs`)

- A garden workshop. Wooden pieces with grain and exact outlines. The shape's name on a plaque.
- The playhouse grows across the book: walls, then the round window, the square window, the triangle roof, the rectangle door, then finished.
- Page 6: the circle and square beside dotted outlines of their openings. Page 8: the door open on cushions and a book, Rabbit holding the book.
- Moves: whichever friend the text names waves and blinks, the other blinks; a butterfly or cloud. Shapes stay still.
- Cover: Mouse and Rabbit carrying a triangle roof.

#### Task 10: Pip's Planet Journey (10 pages, `world.mjs`)

- Pages 1 and 10: Pip's bedroom at night with the cardboard rocket, a star mobile and the moon in the window. Page 1's thought cloud shows the Sun marked "star" and the Moon marked "not a planet".
- Pages 2 to 9: deep space with a different soft tint per planet. The planet is at least 45% of picture height with a shaded side and its true features: Mercury grey and cratered; Venus pale yellow cloud swirls; Earth oceans and land; Mars red with a pale cap; Jupiter bands and its spot; Saturn rings; Uranus tilted on its side with a faint ring; Neptune deep blue with pale streaks. Name and "N from the Sun" at the top. A strip along the bottom shows the Sun and eight dots in order with the current one lit.
- "NOT TO SCALE" is lettered on pages 1 to 10 wherever a planet, the Sun or the Moon is drawn.
- Moves: the rocket with Pip at its window floats, its flame flickers, two groups of stars twinkle. The planet and lettering stay still.
- Cover: Pip in the rocket passing Saturn.
- Existing checks that must stay green: planet order, each page's text names its planet, each planet picture matches `/not to scale/i`.

#### Task 11: Big Bear, Little Mouse (8 pages, `concepts.mjs`)

- A back-garden play space with a sandpit, fence and tree. Bear is about twice Mouse's height in every picture.
- Page 2: two red balls identical except for size. Page 3: six blue blocks and two blue blocks on one ground line. Page 4: a path in perspective, the near pot large beside Mouse, the far pot small beside Bear. Page 5: two identical buckets, one heaped with sand, one showing its dark inside. Page 6: two identical carts in side-by-side lanes travelling the same distance in 1400 ms and 4400 ms. Page 7: everything parked together. Page 8: the two sitting with the ball.
- Each opposite word sits on a plaque beside the thing it names.
- Moves: the friends breathe and blink; on page 6 the carts are the movement, as now.
- Cover: Bear and Mouse back to back, big and small.

#### Task 12: Where Is Teddy? (8 pages, `concepts.mjs`)

- One cosy playroom seen from a different corner each page. Teddy is at least 15% of picture height and stands out from the furniture.
- Position rules: *in* shows the box front hiding Teddy's lower half; *on* shows the whole of Teddy on the stool top; *under* shows Teddy fully visible below the tabletop between the legs; *behind* shows only ears and the top of the head above a solid box; *beside* shows a clear gap. The word sits on a plaque.
- Mouse searches differently on each page: eyes closed, peeking in, pointing up, bending low, on tiptoe, pointing, paw at chin, cuddling Teddy. Rabbit appears on pages 1, 7 and 8.
- Moves: Mouse's arm, tail and blink; Rabbit's ears; a clock pendulum. Teddy and the furniture stay still, except the cuddle on page 8.
- Cover: Teddy peeking from behind a box with Mouse looking the wrong way.

#### Task 13: The Weather Window (8 pages, `world.mjs`)

- The golden arched pretend window fills about 70% of the picture. Mouse and Pip stand at the bottom corners looking up.
- Each view is a small landscape: sunny meadow, rainy pond, windy hill, cloudy moor, snowy fir wood. The weather word sits on a plaque under the window.
- The wall and frame are a still layer above the moving weather, so rain, clouds, the kite and snow never spill outside the window.
- Page 7: sun hat, rain boots and warm coat on three hooks with their words, Mouse choosing. Page 8: the real small window with a pale sky and the clothes ready.
- Moves: the weather itself (turning sun rays, falling rain, swaying kite, drifting cloud, falling snow) plus Pip's wing and both friends' blinks.
- Cover: Mouse and Pip at the window with four small weather pictures in its panes.

#### Task 14: The Pattern Parade (8 pages, `concepts.mjs`)

- A village-green parade. On pattern pages the items are large badges hanging from one ribbon between two poles, read left to right. Nothing else on those pages repeats in a way that could be read as a second pattern (no multicoloured bunting).
- Fills and shapes are kept exactly: red `#cf564d`, blue `#508cb5`, yellow `#e9bc50`, green `#749763`; circle, square and triangle outlines.
- Page 7: five badges and a dotted empty place with "?". Page 8: the finished row above Mouse, Rabbit and Bear marching.
- Moves: the friends bob in turn and blink, a flag waves. Badges stay still.
- Cover: Mouse leading the parade under a red-blue row.
- Existing checks that must stay green: each `pattern-item-N` group keeps its `<title>`, exact fill and shape element, in order.

#### Task 15: A Day of Feelings (8 pages, `concepts.mjs`)

- The playroom. Bear is at least 55% of picture height so his face reads clearly. Each feeling is shown with eyebrows, eyes, mouth and posture together.
- Happy: arms open. Sad: head low, a tear, Mouse's paw on his arm. Angry: brows down, tight mouth, blocks set down, a breath puff. Worried: brows up and in, wavy mouth, paws together. Excited: wide eyes, open mouth, arms up. Calm: eyes closed, small smile, sitting.
- The feeling word sits on a plaque. Mouse responds on every page.
- Moves: the tear falls on the sad page, the breath puff rises on the angry page, slow breathing on the calm page; blinks and Mouse's tail elsewhere.
- The existing notes stay: Bear names his own feelings, and the faces illustrate this story rather than a way to judge anyone else.
- Cover: Bear and Mouse with six small faces around them.

### Task 16: Documents and full verification

**Files:** modify `README.md`, `docs/assisted-book-workflow.md`, `Implementation_Details/book-sources.md`.

- [x] **Step 1:** Update the three documents: the new generator files, `review.mjs` and `reinstall.mjs`; the lettering credit ("Lettering inside the learning-book pictures is drawn from Andika, SIL Open Font License 1.1, converted to outlines"); the offline-ready wording if the file count is mentioned.
- [x] **Step 2:** Run each generator twice and confirm `git status` shows the same files changed and no new differences after the second run.
- [x] **Step 3:** Run `npm run check`. Expected: all unit tests pass, the build succeeds, all browser tests pass. Record the three counts and the precache entry count and size from the build output; the size must be under 16 MiB.
- [ ] **Step 4:** Measure the page with the most moving layers in Chrome with 4x CPU slowdown for ten seconds. Expected: average frame time at or under 12 ms. Simplify and re-review any page that exceeds it.
- [x] **Step 5:** Render before and after sheets for all ten books and give the user the paths.

---

## Phase 2: Reader on a phone

### Task 17: Picture and words sit together in portrait

**Files:** modify `src/style.css` (and `src/reader.js` only if the picture's shape must be passed to CSS); create `tests/browser/page-layout.spec.js`.

**Behaviour:** In single-page portrait, the picture is drawn at full page width directly above the words, and the pair is centred on the page. The spread layout, full screen and the Sloth's nearly square pictures keep working. The reader title wraps to two lines on a phone instead of being cut off.

- [ ] **Step 1: Write the failing test** at 390 by 844 on page 1 of Mouse's Counting Picnic and of Sleepy Mr Sloth: the painted picture (stage width times the scene's height over width) ends no more than 40 px above the top of the paragraph; no more than 60 px of blank page above the picture; the paragraph is fully inside the page; and `.reader-title` has `scrollWidth <= clientWidth` for all thirteen titles.
- [ ] **Step 2: Run** `npx playwright test tests/browser/page-layout.spec.js`. Expected: FAIL on the gap and on the cut-off title.
- [x] **Step 3: Implement** in CSS for the non-expanded portrait reader.
- [x] **Step 4: Run** `npm run test:browser`. Expected: the new test and every existing reader, scene and full-screen test PASS.

---

## Phase 3: Shelf on a tablet

### Task 18: Three columns and two groups

**Files:** modify `src/style.css`, `src/main.js`; extend `tests/browser/learning-shelf.spec.js`.

**Behaviour:** The shelf shows two headed groups, "Bedtime stories" (books without `category: "LEARN TOGETHER"`) then "Learn together". The grid fills the page width: three columns at 1180 px, two at 820 px, one at 390 px. All thirteen cards remain, in title order within each group.

- [ ] **Step 1: Write the failing test:** at 1180 by 820 the first three cards share one row and the grid's right edge is within 40 px of `#main`'s content edge; at 820 by 1180 two cards per row; at 390 by 844 one; both headings exist; `.book-card` count is 13.
- [ ] **Step 2: Run** `npx playwright test tests/browser/learning-shelf.spec.js`. Expected: FAIL on columns and headings.
- [x] **Step 3: Implement.**
- [x] **Step 4: Run** `npm run test:browser`. Expected: PASS.

---

## Phase 4: Wording in the ten Learn Together books

### Task 19: Polished sentences, approved first

**Files:** modify the text strings in `scripts/learning/literacy.mjs`, `concepts.mjs`, `world.mjs`; regenerate and reinstall affected books.

**Rules:** An edit may change rhythm and word choice only. It may not change who or what a picture shows, any fact, any letter, word, number, colour, shape, position, weather or feeling a check looks for, or push a page past 260 characters. Questions and answers are edited only if a page they quote changes.

- [x] **Step 1:** Write a before/after table of every proposed change, book by book, and give it to the user. Wait for approval of each line.
- [x] **Step 2:** Apply only approved lines. Regenerate. Because the pictures are unchanged, confirm that every SVG is byte-identical to the reviewed one, then restore the review flags and run `node scripts/learning/reinstall.mjs` for the affected books.
- [x] **Step 3:** Run `npm run check`. Expected: PASS.

---

## Execution note

Tasks 2 to 5 build one kit that all ten books lean on, and each book is judged by eye against the same cast and scenery sheets, so the work is best done in one continuous session rather than handed between workers.
