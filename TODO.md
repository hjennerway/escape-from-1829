# Escape from 1829 — Gameplay To-Do

This file captures planned gameplay improvements for **Asylum Escape**. These are design/development tasks only; implementation should be reviewed before work begins.

## 1. Multi-stage escape objective

Replace or expand the current simple exit-finding loop with a connected sequence of objectives.

- [ ] Design a multi-stage escape chain rather than relying primarily on finding one active exit.
- [ ] Example progression:
  - discover a possible escape route;
  - gain access to a restricted/staff corridor;
  - reach the upper floor;
  - avoid, distract or bypass staff/security;
  - locate the required key/tool/information;
  - unlock or access the grounds;
  - cross the grounds;
  - reach the final escape point / radio mast sequence.
- [ ] Ensure each stage naturally reveals or hints at the next instead of using obvious quest markers.
- [ ] Allow more than one solution for selected stages where practical.
- [ ] Keep the current random-exit system available as a possible ingredient in the larger puzzle rather than necessarily removing it entirely.

## 2. Capture consequences instead of immediate game-over

Make being caught part of the gameplay loop rather than always ending the run immediately.

- [ ] Define multiple possible consequences when the player is caught.
- [ ] Possible outcomes:
  - returned to a ward or another part of the asylum;
  - moved to a different floor/room;
  - one or more carried items confiscated;
  - NPC/security patrols changed;
  - temporary restriction or delay before the player can resume escaping;
  - occasionally reveal a previously inaccessible or undiscovered area.
- [ ] Decide when repeated capture should still trigger the historical diagnosis/treatment game-over screen.
- [ ] Balance consequences so capture is meaningful without forcing excessive repetition.
- [ ] Consider tracking capture count during a run and escalating consequences.

## 3. Replay randomisation

Increase replayability by randomising selected puzzle and escape elements while keeping the building itself learnable.

- [ ] Randomise a small set of meaningful variables per run rather than procedurally generating the whole experience.
- [ ] Candidate variables:
  - active escape route;
  - which staff/security NPC carries a required key;
  - location of selected clues or documents;
  - accessible/blocked staircase or route;
  - patrol direction/timing;
  - location of a required item;
  - which clue variant is used to reveal the next objective.
- [ ] Ensure every generated combination remains solvable.
- [ ] Add safeguards so required clues/items cannot spawn behind their own locked dependency.
- [ ] Consider a seeded run/debug mode to make randomised layouts reproducible during testing.

## 4. Player notebook / clue journal

Add a notebook that records useful information as the player discovers it, replacing conventional quest markers where possible.

- [ ] Design a notebook/journal UI accessible during Asylum Escape.
- [ ] Automatically add entries when the player discovers important clues.
- [ ] Potential notebook content:
  - rough floor-plan sketches;
  - discovered rooms and routes;
  - staff/patient names;
  - dates and historical facts relevant to puzzles;
  - diagnoses/treatments found in records;
  - copied or paraphrased document clues;
  - observations such as "The east and west wings appear symmetrical";
  - known locked doors and possible ways around them.
- [ ] Distinguish discovered facts from deductions/hints.
- [ ] Avoid turning the notebook into a conventional objective checklist.
- [ ] Consider allowing entries to update as the player learns more.
- [ ] Decide whether opening/reading the notebook pauses NPC movement, similar to close inspection of artwork.

## 5. Upper/lower floor transition

Investigate removing the current loading-screen transition between floors.

### Preferred approach: continuous stairs

- [ ] Review how the upper and lower floors are currently represented and loaded.
- [ ] Determine whether both floors can coexist in the same playable scene/world without unacceptable browser performance or memory usage.
- [ ] Investigate connecting the floors spatially so the player can physically walk up/down the staircase.
- [ ] Verify:
  - player controller works reliably on stairs;
  - collision/navigation meshes connect correctly;
  - NPCs can traverse floors if desired;
  - lighting/occlusion remains acceptable;
  - artwork/interactions continue to work;
  - browser/mobile memory and frame rate remain acceptable.
- [ ] If both floors can stay loaded, consider distance/visibility based optimisation instead of scene changes.

### Fallback approach: seamless-feeling transition

If continuous stairs are not practical:

- [ ] Replace the visible loading screen with a short fade-to-black/fade-in transition.
- [ ] Trigger the transition naturally while the player is travelling on the staircase.
- [ ] Preserve player orientation and expected position on the destination floor.
- [ ] Hide loading/scene switching behind the fade where possible.
- [ ] Keep audio continuous or cross-fade it so the transition feels like one building.
- [ ] Avoid showing a loading indicator unless the transition genuinely takes long enough to require one.

## 6. Puzzle integration with the building

Use the asylum layout and historical material as puzzle mechanics rather than relying mainly on arbitrary locks/codes.

- [ ] Explore puzzles based on the mirrored wings/building symmetry.
- [ ] Use documents, patient records, historical photographs and artwork as discoverable clues.
- [ ] Link some notebook deductions to architectural observations.
- [ ] Prefer clues that make sense in-world over generic keypad-code puzzles.
- [ ] Ensure historical content remains respectful and clearly framed as period material.

## Design goals

- Make escaping feel like learning and exploiting the asylum rather than simply searching for an exit.
- Reward observation and exploration.
- Keep the environment understandable enough that players build useful spatial knowledge over multiple runs.
- Make capture alter the run rather than merely reset it.
- Add replayability without making success feel random.
- Keep the browser build performant and retain mobile support unless a future engine decision explicitly changes those goals.
