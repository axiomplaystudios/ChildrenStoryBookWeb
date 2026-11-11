# Interactive pair authoring contract

The parent reads both editions aloud. `independent` means the child operates the activities. Packages contain JSON data and local pictures; there is no narration/audio schema or executable package code. The thirteen legacy books stay under `public/books` and use their existing reader/importer.

The executable reference is [the minimal fixture](../tests/fixtures/interactive/pair.mjs); it exercises all four activity kinds with test-only art. [The validator](../src/interactive/schema.js) specifies bounds and rejects unknown fields. Review booleans in this fixture are test data, not a claim that any real story has been visually reviewed.

## Pair and scene shape

`Pair` contains `schemaVersion:1`, slug `id`, immutable slug `version` (use increasing `v1`, `v2`, …), `title`, `category`, `credit`, `cover`, `initialState`, `scenes`, `editions`, `endings`, and `assets`. Categories are `small-jobs`, `experiments`, `consequences`, `discovery`. Scene/activity/asset/control IDs are stable slugs; reserved prototype keys are rejected. The pair ID `covers` is reserved for catalog thumbnails. State values are finite bounded numbers, booleans or short strings; state has at most 32 declared keys. Versions cannot be overwritten; changing any released content requires a new version.

Every scene is exactly `{id,narrative,alt,image,scene,activity?,hiddenLayers?}`. `image` is its static fallback filename. `scene` is the existing illustration definition `{width,height,background,layers,tracks}`: layers use `{id,image,x,y,width,height,pivot,parent?}`; tracks use existing motion presets. Thus `createIllustration({page:pair.scenes[i],resolveAsset})` consumes a scene directly. Decorative tracks repeat with rest at most 1800 ms. `hiddenLayers` lists initially hidden layer IDs, while omitted layers start visible. Stable completed outcomes belong in layer visibility, not in a looping track. The illustration resolver is synchronous and maps a filename to a verified object URL; omitted resolver preserves legacy `./books/<bookId>/<file>` URLs.

Every picture control is `{id,label,image}`: visible readable parent text and a filename registered in `assets`. Narrative, alt text, instructions and feedback are plain text, never HTML. Packages must be plain JSON values, including nested scene parameters; functions, getters, prototypes and arbitrary rules are rejected.

## Four bounded activity kinds

`place` is `{kind:'place',id,items,targets}`. Each item adds optional `quantity` (1–5, defaults to 1) to a picture control. Each target is `{id,label,image,accepts:[itemId,…],required:1..5,effects}`. A placement consumes one available copy; each copy is placed at most once, and a full target accepts no more. Derive quantities from stored placements rather than incrementing mutable counters. Fire a target's effects only once when its required quantity is reached. Stable target completion layers remain visible on returning to the scene. The reducer owns action/token payload details; authored item and target IDs remain unchanged. Separate targets and accepted item types support counted orders, matching shapes/parts and packed groups.

`experiment` is `{kind:'experiment',id,variable,fixed:[text,…],controls,predictions,outcomes,comparison}`. Controls and predictions are separate lists of 2–6 picture controls. There is exactly one outcome `{controlId,observation,image,effects}` per control. The child selects a configuration and predicts before testing; a prediction does not select an outcome. TEST reveals the deterministic authored outcome for the selected control. RETRY permits another prediction/test and preserves trials for comparison. `variable` names the one changing variable; `fixed` lists unchanged conditions; `comparison` is parent-readable text. This is an authored illustrative model, not a claimed physical simulator, and no correctness score is defined.

`choice` is `{kind:'choice',id,options:[first,second]}`. Each option is `{id,label,image,feedback,effects}` with nonempty distinct effects. `feedback` describes an immediate consequence. A recorded choice supplies the immutable decision identity `choice.<activityId>` for predicates, in addition to any repairable state keys its effects update. All effects are recomputed from the retained ordered actions after a change; navigating back does not replay or stack effects.

`discover` is `{kind:'discover',id,physicalPrompt,adultHelp,screen,effects}`. The physical suggestion is optional, adult assisted and skippable; it needs no proof, device permission or household materials. `screen` is `{label,image,mode,options,answer}`: mode `match` takes one correct option ID; mode `sequence` takes 1–12 option IDs in order (repetition allowed). Options are 2–8 picture controls. This supports a shape search or a completely visual rhythm pattern. Screen answer, optional physical participation and skip remain distinct runtime actions/paths; no screen answer claims proof of a physical task. Completion effects must be idempotent. Both editions remain completable using only the screen alternative.

## State effects, predicates and repairs

The complete effect whitelist is:

```js
{type:'set', key:'shade', value:'canopy', when: optionalPredicate}
{type:'show', sceneId:'finish', layerId:'canopy', when: optionalPredicate}
{type:'hide', sceneId:'finish', layerId:'open-sky', when: optionalPredicate}
```

`set` references a declared `initialState` key and preserves its scalar type. `show`/`hide` reference an existing scene layer. Effects may target the current or a later scene. Apply effects in authored order against derived state after recording the current choice. Later effects can override earlier values or layer visibility, so a repair changes the final state without erasing its earlier decision. Effects have at most 24 entries; empty effects are permitted outside choices.

Predicates are only `{op:'equals',key,value}`, `{op:'all',conditions:[…]}`, or `{op:'any',conditions:[…]}`. A key is a declared state key or `choice.<choiceActivityId>`; choice values must be valid option IDs. There are 1–8 children per boolean operator and at most four nested levels. An unanswered choice does not equal any option ID. No comparisons, expressions, interpolation, callbacks, JS or remote references are evaluated.

For example, choosing an uncovered picnic earlier sets `shade:'open'`; a later repair can set `shade:'canopy'`, hide the sunlit result and show the canopy. An ending predicate can still explain that repair:

```js
{op:'all', conditions:[
  {op:'equals',key:'choice.picnic-place',value:'open'},
  {op:'equals',key:'shade',value:'canopy'}
]}
```

## Editions and replayable picture guidance

The exact keys are `editions.together` and `editions.independent`. Each has `scenes:{[sceneId]:guidance}` covering every scene, including the ending. Guidance is `{instruction,feedback:{complete,retry},demonstration:[step,…]}`. Independent text should give one short instruction at a time. Together guidance should offer a distinct adult scaffold rather than copying the independent wording.

A visual step is `{action,image,label,itemId?,targetId?,controlId?,predictionId?,layerId?}`. Actions are `point`, `select`, `place`, `predict`, `test`, `reveal`; references, when supplied, must exist in the current scene/activity. `image` provides a reusable visual example; `label` gives a parent-readable description and reduced-motion equivalent. There are 1–12 finite steps. Demonstrations illustrate an example without dispatching activity actions, changing completed outcomes or resetting the run. The reader owns replay/cancellation on scene exit; there are no authored executable callbacks or time limits.

Together additionally has exactly four `prompts:{type,question,answer,sceneId}` (two `literal`, one `feeling`, one `personal`). Independent additionally has a short parent-readable `reflection`. These are optional discussion/finish experiences, not required reading or a quiz score.

## Endings and six-decision recaps

`endings` is `{sceneId,text,variants,recap}`. `sceneId` must be the last scene, which has no activity. `variants` contain `{when,text,showLayers?,hideLayers?}`. Use the first matching variant in authored order to replace the base `text`; if none match, use the base. Its optional layer lists modify the final scene's derived visibility. Each text must be a complete readable passage. Apply the same first-match rule independently for each recap beat.

A recap beat is `{decisions:[choiceActivityId,…],text,variants}`. Consequence packages require six binary decision scenes plus the ending, and exactly three recap beats whose `decisions` cover all six choices once. Recap predicates can reference both original option IDs and repaired state. Declaration coverage is validated; authors/content tests must additionally enumerate all 64 routes and prove that each decision has a meaningful visible or verbal effect and that repair explanations agree with resulting layers. Merely listing a decision in recap metadata is not a content-quality proof.

## Files, review and publication

Authoring folders contain `pair.json`, `source.json`, `visual-review.json`, and flat local image files. The assets manifest is `[{id,file,sha256,bytes,mediaType}]`; every referenced picture is declared, IDs and filenames are unique, filenames have no paths/URLs, SHA256 is lowercase hexadecimal, and each image is at most 5 MiB. SVG uses the same restrictive, non-executable local dialect as the legacy importer. Every image must decode in Chrome with dimensions at most 8192. The complete package, including JSON and bundle manifest, must be at most 15 MiB.

`writePairPackage(folder,pair,{source})` computes hashes/lengths from existing artwork. It resets every source/art/scene review flag to **false**, even on regeneration; it never generates or asserts review of illustrations. Supply honest provenance with creators, license and changes. `source.json` is `{kind:'original'|'adaptation',title,license,creators:[name,…],changes,reviewed:false,url?,licenseUrl?}`; adaptations require HTTPS source and license URLs. Original work must not invent an external attribution URL.

`visual-review.json` is `{reviewed:false,assets:[{assetId,reviewed:false}],scenes:[{sceneId,rest:false,motion:false,outcomes:false,guidance:false}]}`. Inspect every asset, scene rest/motion, distinct outcome/layer combination, both editions' guidance and reduced-motion equivalents before marking the corresponding flags true. Review records attest actual human/visual inspection; automated decoder/hash tests cannot provide that attestation.

```sh
node scripts/interactive/prepare-pair.mjs check authoring/interactive/<id>
node scripts/interactive/prepare-pair.mjs install authoring/interactive/<id>
node scripts/interactive/catalog.mjs
```

`checkPair` is read-only and returns `{pair,source,review,files,manifest,manifestBytes}`. Installation retains those exact validated bytes, stages the whole bundle and atomically renames it to `public/interactive/<id>/<version>/`; an import lock prevents two writers publishing the same version. An existing version is never replaced. No CLI here pushes, merges or deploys.

The generated `bundle.json` is `{schemaVersion:1,id,version,pairFile:'pair.json',files:[{file,sha256,bytes,mediaType}]}`. It lists `pair.json`, both review/provenance records and every image. It excludes itself to avoid a self-hash. Bundle consumers verify the catalog's manifest hash/length, then every listed file, before declaring readiness. JSON files use `application/json`; image records use matching image media types. `files` returned by `checkPair` contains validated metadata and assets but not `bundle.json`.

The public catalog contains one latest version summary per pair: `{id,version,title,category,credit,cover,manifestUrl,manifestSha256,manifestBytes,totalBytes}`. Natural version sorting selects increasing `v1`, `v2`, etc. URLs resolve relative to the catalog URL (including nested application base paths). `totalBytes` includes the manifest and all its files, and is measured from actual bytes. Covers under `covers/<id>--<version>.<ext>` are at most 64 KiB: small originals are copied; larger images are reduced to at most 320 pixels and encoded as WebP. Catalogs contain no scenes or activity art manifest. Missing initial content produces an empty catalog, allowing dev/build before any real story exists. Dev/build scripts generate both catalogs; interactive offline caching and runtime download behavior belong to the later bundle-store task.
