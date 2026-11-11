# Eight interactive story pairs

Status: user approved the design and implementation on 2026-11-11, then clarified: “I will read aloud. No need to complicate this with audio generation and all”. This amended scope is authoritative; no new design approval is needed. Implementation is recorded in the progress ledger and validation document. Deployment is not authorised.

## Intent and agreed scope
The user wants curiosity, enjoyment, agency and understandable consequences for a four-year-old. They selected eight paired stories: two small-job stories, two prediction/experiment stories, two choices/consequences stories, and two real-world discovery stories. Each has Together and Play by Myself editions (16 experiences). They explicitly request considerable variety and no reuse of Mouse, Pip/Owl, Rabbit, Bear or the established cast. English continues from the existing collection.

## Approaches
Selected by user: eight paired stories with shared settings/art and distinct guidance/activity presentations. Alternative: sixteen unrelated stories, more variety but less familiarity and substantially more content. Paired editions must differ in activity scaffolding and adult prompts, not merely a mode label. The parent reads both editions aloud.
Implementation proposal: eight new shelf cards, each offering two clearly labelled editions. Avoid doubling the shelf with near-identical covers. Preserve the thirteen existing books unchanged. Shared assets and story definitions avoid duplicating art; progress records remain separate by edition.

## Proposed collection and creative decisions
These titles/casts are the approved collection. Every pair needs its own setting, palette, compositions, props and movement. Reusing technical primitives is acceptable; reskinning identical scenes is not.

| Pair | Category | Cast and setting | Story and actions |
| --- | --- | --- | --- |
| Amara’s Busy Bakery | Small jobs | A young human baker and her grandfather; bright neighbourhood bakery | Prepare a welcome breakfast: count 1–5 items, match pictured orders and pack treats. No child-operated heat or real cooking instruction. Together can discuss different arrangements; independent mode demonstrates one placement then offers picture orders. |
| Bolt and the Toy Parade | Small jobs | A small robot and expressive wind-up toys; inventive workshop | Repair three parade toys by matching shapes, sizes and parts, then see the repaired toys join the parade. Tap-select/tap-place alternative to every drag. Tools remain fictional on-screen props. |
| Tavi’s Dinosaur Ramp Rally | Predict/experiment | A young triceratops and dinosaur neighbours; colourful outdoor track | Help toy carts reach a delivery line. Predict, test gentle versus steeper ramps with the same cart/surface, observe and retry. This is an idealised illustration; never claim every real cart/surface behaves identically. |
| Mina and the Shadow Stage | Predict/experiment | Two human siblings; indoor paper-puppet theatre | Prepare a shadow show. Predict whether a puppet’s shadow becomes larger or smaller as it moves relative to a fixed light and screen; test and combine discoveries in the show. Diagram and movement must reflect valid light geometry. |
| Nori’s Seaside Picnic | Consequences | An elephant family; beach, grassy cove and sheltered picnic spot | Six decisions about preparations, seating, sharing and clearing up produce concrete changes to the picnic. Show trade-offs, repair opportunities and a personalised final scene; no dangerous locations or weather. |
| Zuri’s Rooftop Garden | Consequences | A child and a grandparent; enclosed city rooftop garden with insect visitors | Six decisions about plants, shade, paths and water use shape the garden. Different choices support different uses and visitors; depict growth with explicit passage of days. No unrestricted rooftop exploration invitation. |
| Imani and the Lost Shape Map | Real-world discovery | A child explorer and a talking map; imaginative geometric island | Recover map pieces by noticing shapes, then optionally find a round object, compare edges and arrange familiar objects nearby with an adult. On-screen alternatives allow completing the story without materials. |
| The Penguin Sound Post | Real-world discovery | A penguin postal crew; snowy coastal village | Deliver messages by matching visual rhythms and patterns. Optional parent-made sounds, quiet listening or gentle clapping can accompany the visual rhythm; every activity is complete on screen without sound. No loud noises, microphones or recordings. |

Cast variety: human-led, mechanical and animal-led worlds; visual diversity without stereotyped cultural assignments. Content review checks new cast names/appearances against old recurring characters. Draft titles may be polished without changing topic/cast/setting intent.

## Together and independent editions
Together: the parent reads the short narrative and instructions aloud, with optional adult prompts and predictions discussed before testing.
Play by Myself: the parent reads the narrative, instructions, options, feedback and endings aloud; the child operates the activities with one instruction at a time, picture choices and replayable visual demonstrations. Written text remains available to the parent. No child reading or speech recognition needed. Adult initially chooses/downloads edition; 'independent' means the child operates the on-screen activities, with parent-led reading and adult assistance for optional physical activities. It does not promise autonomous narration.
Both: no timers, streaks, leaderboards, correctness scores or rewards for staying longer. Permit stopping, returning and replaying. Feedback describes outcomes and offers another attempt. Animation follows actions; completed tasks never endlessly undo themselves. Decorative motion continues to loop, while task results and consequences remain stable. Existing motion speed settings and reduced-motion behavior persist.

## Narrative and interaction structure
Task, experiment and discovery pairs: target eight story scenes (opening, six purposeful scenes, conclusion). Build beginning/problem/resolution rather than disconnected exercises. Builder may vary by one scene if necessary and record why.
Consequence pairs: six decision scenes, beginning with an opening that includes the first decision, followed by one outcome scene. Every story scene before the ending has two meaningful picture choices. Each decision produces an immediate visible effect and a retained state change used in the ending. Six binary decisions yield 64 paths per pair, all testable. The ending scene offers replay/finish, not an unresolved new branch.
Prefer cumulative state with authored conditional passages/art layers over an exponentially branching page tree. Endings combine a coherent story resolution, a personalised illustration and three brief recap beats covering all six decisions. Every choice must visibly or verbally affect the recap; no decorative choices. Outcomes follow established story facts, never random punishments or moral judgements. Give at least one later repair opportunity in each consequence story, and explain repairs in the recap.
Experiments use a predictable authored model with one variable changed at a time. Prediction is recorded before testing; no correctness reward. Show actual result, allow retry, and optionally compare attempts. No fabricated claim of physical simulation.
Discovery activities are optional and adult-assisted when physical materials/movement are involved. No camera, location, upload or proof of completion. Keep equivalent on-screen activities available in the independent edition.
Keep four optional end discussion prompts per Together edition. Play by Myself uses a short parent-readable reflection and finish/replay choices; do not force the existing four text questions.

## Reader and state integration
Current session stores page/question/completion only; current reader renders static text plus looping illustrations and duplicates page DOM for page turns. Add schema-validated, declarative interaction definitions and deterministic story-state reducers; never execute package-provided code.
For new interactive editions use one active scene at a time in portrait and landscape, preserving book framing, navigation and fullscreen. This avoids two simultaneous instructions or actionable pages. Keep the existing 13-book spread reader unchanged. Use a lightweight page transition for new editions; activity touches must not trigger page turns. Interaction controls belong only to the active page and cannot execute in transition copies.
Persist edition, scene, choices, task state and experiment trials locally with versioned validation. Navigating back views saved state without automatically replaying effects. Explicitly changing an earlier decision clears dependent later decisions/results and explains this before mutation. Restart creates a fresh run; old cached saves migrate safely or offer restart. No accounts or server storage. Denied storage still permits the current session.
Visual guidance belongs only to the active scene. Leaving a scene disposes its activity listeners and pending demonstrations; replaying guidance never resets completed actions. No automatic next-story opening.

## Art production and offline operation
Use original layered illustrations with real part motion and clearly visible interaction targets. Objects being counted keep their quantities consistent; pattern/spatial examples remain legible. Art is reviewed at rest, in motion and after each interaction outcome.
The parent reads both editions aloud. Audio generation, narration engines, packaged audio assets, listening reviews and playback controls are outside this scope. Story text, picture choices, concise instructions and visual demonstrations provide the complete experience. Conditional endings use complete authored sentences for the parent to read.
Keep the existing core offline bookshelf cache. New pair artwork, text and interactions install on demand as a versioned bundle via an adult-facing download control showing actual size and readiness. A failed/interrupted update preserves the last complete version, supports retry and never claims readiness prematurely. Uncached new books need connectivity; downloaded editions function fully offline, including all endings. Budget target <=15 MiB per pair; measure and report actual size. No requirement to preload all 16 experiences.

## Delivery and verification gates
1. Define interaction/state/bundle schemas and acceptance cases.
2. Build one complete paired vertical slice (Amara’s Bakery) including persistence, visual guidance, input accessibility and offline behavior.
3. Add the experiment model, cumulative consequences and discovery support with one pair each.
4. Finish the second pair in each category; review all eight, both editions and the complete shelf.
5. Full regression, documentation and release readiness. This plan does not itself authorise publishing.

Tests: deterministic state transitions, no duplicate action execution, pointer/keyboard/tap alternatives, save/resume/back/edit/restart, all 64 paths per consequence story, every ending effect matching choices, all authored experiments, replayable visual guidance and interrupted downloads, offline all routes, reduced-motion equivalents, mobile/fullscreen, existing thirteen books and their late-cycle loops. Do not assert learning gains from test passes.
Review: all narrative/activity/outcome states, all visual guidance, selected complete journeys on touch hardware, scientific claims against authoritative sources before content production, physical prompts for household practicality. Completion evidence includes changed behavior, full test results, inspected art and visual guidance, actual bundle sizes and remaining device limitations.
Success means the child can choose, try, observe, revisit and stop easily. Parent observation of enjoyment and spontaneous questions informs later iteration; no hidden child analytics.

## Approval and handoff
User approved the proposed collection, design and implementation, and explicitly removed generated audio in the read-aloud clarification. Continue the amended implementation plan with explicit tasks and tests. Technical details not constrained above are delegated to the builder. No publishing is authorised by this design approval.
