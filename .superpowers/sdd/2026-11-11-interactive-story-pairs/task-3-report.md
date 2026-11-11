# Task 3 report

Implemented deterministic interaction state and saved runs in `src/interactive/state.js` and `src/interactive/progress.js`. No schema changes, audio, DOM effects, storage side effects inside the reducer, pushes, merges or deployment.

## Interfaces

- `createRun(pair,edition)` validates the pair and creates the canonical `{schemaVersion,pairId,pairVersion,edition,sceneId,actions}` run.
- `dispatch(run,pair,action)` returns `{run,accepted,effects,reason?}`. `deriveScene(pair,run,sceneId?)`, `deriveEnding(pair,run)` and `validateRun(pair,value)` expose detached state and enforce replay validation.
- PLACE identifies a specific copy with `itemId` and zero-based `copyIndex`. A duplicate cannot consume another copy. Bounded remaining-supply matching rejects a placement that would strand another target with `reason:'save-that-piece'` so the reader can explain the constraint.
- Experiment SELECT/PREDICT/TEST/RETRY all carry zero-based `trialIndex`. Configuration and prediction are independent; one TEST requires both. RETRY keeps trials/configuration, clears prediction and advances the index. Authored outcomes are deterministic and no correctness score exists.
- CHOOSE requests edits using `confirm-choice-edit` effect with `activityId,optionId,token`; explicit CONFIRM_CHANGE must supply the fingerprint token for the unchanged run. It truncates the original decision and every dependent action, stores a new canonical CHOOSE and rewinds. Saved logs normalize away confirmation/restart commands.
- ANSWER accepts bounded match/sequence arrays; physical participation and skip have distinct PHYSICAL and SKIP actions. Completion applies effects once, with no proof or device permission.
- Navigation requires every activity before the destination to be complete. Existing choices/results survive saved back navigation. Ending derivation returns no route text or recap until all activities complete.
- `loadRun(storage,pair,edition)` returns statuses `new|loaded|restart|memory`. `saveRun(storage,run)` returns `saved|memory` and preserves the live run if storage is denied. Keys are per pair and edition; version mismatches offer safe restart. Every saved action is replayed through the reducer's transition rules; cursor and exact run shape must match. Bounds: 2,000 accepted actions and 600,000 saved characters.

The full public action and return contracts, derived activity fields and concrete feedback reason are documented in `docs/interactive-story-authoring.md` for the reader task.

## TDD evidence

1. Wrote state/storage contract and behavior tests before modules existed. First targeted run: 11 failures because the runtime exports/implementation were absent.
2. Implemented the reducer and persistence. Targeted run: 11/11 passed.
3. Added scarce-piece allocation regression. Targeted run: 12 passed, 1 failed because a placement that stranded the remaining target was accepted. Added remaining-supply guard; 13/13 passed.
4. Added malformed getter/sparse/extended-answer regression. Targeted state run: 9 passed, 1 failed because a malformed answer was accepted. Hardened action descriptor/array validation; final targeted run: 14/14 passed.

The six-choice consequence fixture is local to `tests/interactive-state.test.mjs`. It enumerates all 64 routes, asserts all six immutable decision identities and repairable state keys, later repair overriding the early shade value/layer while preserving its explanation, and three meaningful recap beats covering all six decisions. It also asserts deterministic dispatch and unchanged pair/run inputs. Additional tests cover copy quantities, trial requirements/history, confirmation without mutation, stale confirmation, truncated dependent results, safe navigation, discovery paths, exact malformed action rejection, persistence isolation, corrupt/obsolete/forged saves, and denied storage.

## Final verification

- `node --test tests/interactive-state.test.mjs tests/interactive-progress.test.mjs`: 14 passed, 0 failed.
- `npm test`: 129 passed, 0 failed, 0 skipped.

The reducer is ready for controller/UI integration. It emits data descriptors only; the reader owns displaying confirmation and plain retry/constraint feedback, applying visibility to illustrations, saving accepted runs, and retaining an in-memory session while storage is unavailable. No required Task 3 work remains.
