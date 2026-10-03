# Escape from 1829 — Gameplay To-Do

This file captures planned gameplay improvements for **Asylum Escape**. These are design/development tasks only; implementation should be reviewed before work begins.

## 1. Multi-stage escape objective

Replace or expand the current simple exit-finding loop with a connected sequence of objectives. The player should work out how to escape by exploring the asylum, interpreting clues and building up knowledge in the **Notebook**, rather than following conventional quest markers.

### Core design principles

- [ ] Make the escape feel like a chain of discoveries rather than a visible list of objectives.
- [ ] Use the Notebook as the player's memory and reasoning aid throughout the chain.
- [ ] Do **not** add a separate quest log or on-screen objective arrow for the main escape route.
- [ ] Only add information to the Notebook after the player has genuinely discovered, observed or inferred it.
- [ ] Allow Notebook entries to evolve as new evidence changes what the player knows.
- [ ] Keep important clues understandable without making the Notebook solve the puzzle for the player.
- [ ] Ensure the route remains solvable even if the player explores areas in an unexpected order.
- [ ] Keep some stages variable between runs so replaying does not reduce the entire escape to memorising one fixed sequence.

### Proposed escape chain

The exact rooms/items can change during implementation, but the intended structure should be:

#### Stage 1 — Realise there may be a way out

- [ ] Give the player one or more environmental clues that suggest an escape is possible without immediately identifying the final exit.
- [ ] Possible sources:
  - overheard staff conversation;
  - a note or record mentioning a staff/service route;
  - a door seen from the opposite side of a courtyard;
  - evidence of deliveries, maintenance or staff movement;
  - a historical plan, sketch or photograph that does not quite match the accessible layout.
- [ ] Add the first Notebook entry as a **fact or observation**, not an instruction such as "Go to X".
- [ ] Example Notebook wording: "Staff seem to use a passage that is not accessible from the main ward."
- [ ] If several possible escape leads exist, allow the Notebook to record them independently until the player has enough evidence to decide which is useful.

#### Stage 2 — Identify the restricted route

- [ ] Require the player to explore enough of the building to work out where the restricted/staff route is likely to be.
- [ ] Make use of the existing fog-of-war map so discovering corridors, doors and stairs gradually gives the player enough spatial context to reason about the route.
- [ ] Use the building's mirrored layout where appropriate: discovering the arrangement of one wing may allow the player to infer something about the other.
- [ ] When the player has enough evidence, update the Notebook with a **deduction** rather than automatically revealing the exact destination.
- [ ] Example deduction: "If the east and west wings mirror one another, there may be another staircase beyond the locked west corridor."
- [ ] Mark already-observed locked doors/stairs on the Notebook map only after the player has physically found them.

#### Stage 3 — Gain access to a staff/restricted area

- [ ] Require one obstacle before the player can enter the restricted route.
- [ ] Support at least two approaches where practical, for example:
  - obtain or temporarily take a staff key;
  - distract a member of staff and pass while a door is open;
  - find an architectural/service route that bypasses the locked door;
  - use knowledge found in a record or note to locate a less obvious entrance.
- [ ] Avoid generic "find the glowing key" design. The player should first learn **why** a particular key, person or route matters.
- [ ] Record relevant observations in the Notebook, such as which staff member was seen using a door or where a key was last observed.
- [ ] If a route fails or becomes unavailable, the Notebook should retain what the player learned so they can try another approach.

#### Stage 4 — Reach and investigate the upper floor

- [ ] Use the upper floor as a meaningful part of the escape chain rather than simply another area to search.
- [ ] Require the player to obtain information, access or an item upstairs that advances the escape.
- [ ] Tie this to the planned continuous-stairs/fade transition work in item 5 so moving between floors feels like part of the same building.
- [ ] Let exploration of the upper floor reveal its own fog-of-war map in the Notebook.
- [ ] Candidate discoveries upstairs:
  - a staff office containing a building/service plan;
  - a record identifying a little-used exit or service gate;
  - a key cabinet or information about who carries the relevant key;
  - a window/viewpoint that lets the player see the grounds and radio mast;
  - architectural evidence confirming a Notebook deduction made downstairs.
- [ ] Do not require every run to use exactly the same upstairs clue or location.

#### Stage 5 — Work out how to reach the grounds

- [ ] Once enough evidence has been collected, let the player infer which door, service route or gate can lead outside.
- [ ] The Notebook should bring together earlier facts and deductions without turning them into a step-by-step walkthrough.
- [ ] Example evolution:
  - Fact: "The rear service door is locked."
  - Fact: "A porter was seen entering with a brass key."
  - Fact: "The service passage continues toward the rear of the building."
  - Deduction: "The porter's key may open the route to the grounds."
- [ ] Where randomisation is enabled, vary at least one dependency such as the relevant key holder, clue location or usable outside route.
- [ ] Make sure alternate solutions converge cleanly on the next stage.

#### Stage 6 — Get outside and cross the grounds

- [ ] Treat reaching the grounds as progress, not the immediate end of the game.
- [ ] Once outside, create a short final traversal in which the player must reach the true escape point.
- [ ] Use sight lines, cover, patrols and the layout of the grounds rather than adding a new abstract puzzle.
- [ ] Update the grounds section of the Notebook map as the player explores it.
- [ ] Allow previously discovered information to matter outside; for example, a view from an upstairs window may have shown the safest direction or a landmark.
- [ ] If the player is captured outside, use the capture-consequence system in item 2 rather than always resetting the entire run.

#### Stage 7 — Reach the final escape point / radio mast sequence

- [ ] Make the radio mast or its surrounding area the final navigation goal only after the player has successfully escaped the asylum grounds.
- [ ] Foreshadow the mast earlier where possible, especially from windows or exterior viewpoints, so it feels like a real landmark rather than a newly introduced endpoint.
- [ ] Allow the Notebook to record the mast as a landmark once the player has actually seen or learned about it.
- [ ] Trigger the planned radio-mast ending/cutscene after the player reaches the final escape point.
- [ ] Keep the final interaction simple; the challenge should come from discovering and executing the escape route, not an arbitrary final code puzzle.

### Notebook integration

- [ ] Treat the Notebook as the connective tissue between stages of the escape.
- [ ] Use the existing **Facts** and **Deductions** distinction:
  - **Facts** record things directly seen, read or overheard.
  - **Deductions** connect multiple facts into a useful possibility.
- [ ] Do not insert undiscovered rooms, exact item locations or future objectives into the Notebook.
- [ ] Prefer natural annotations such as:
  - "Locked";
  - "Staff only";
  - "Seen a porter use this door";
  - "Stairs may continue above";
  - "Passage appears to mirror the east wing".
- [ ] Let an entry change state as knowledge improves. For example:
  - "Door is locked" → "Porter has a key" → "Key opens rear service door".
- [ ] Cross-reference discoveries where useful without making the UI cumbersome. A document note can refer to a mapped room, and a room entry can mention the document found there.
- [ ] When inspecting a document, store a concise paraphrase of the puzzle-relevant information in the Notebook rather than forcing the player to memorise the full document.
- [ ] Preserve the existing behaviour where reading the Notebook pauses NPCs and the timer.
- [ ] Decide which Notebook information is **run-specific**. Escape-route clues, observed patrol/key information and fog-of-war should reset with a new run unless there is a deliberate reason to retain them.
- [ ] Do not use the Notebook to silently correct a wrong player assumption; deductions should only appear when supported by evidence the game has actually provided.

### Branching and replayability

- [ ] Design selected stages as small branches rather than one rigid sequence.
- [ ] Example branch:
  - Route A: identify the porter → obtain/use the service key;
  - Route B: infer the mirrored passage → enter through an alternate route;
  - Route C: create a distraction → follow staff through the restricted door.
- [ ] A branch may be easier, safer or quicker, but no single branch should be mandatory in every run unless needed for narrative reasons.
- [ ] Connect this system to item 3 so the active route, clue placement or key holder can vary without generating impossible combinations.
- [ ] Ensure randomisation changes **how the player confirms the route**, not the basic logic of the building.
- [ ] Make Notebook entries reflect the current run rather than exposing which randomised solution was selected internally.

### Failure, capture and recovery

- [ ] Being caught during one stage should not normally erase all progress or Notebook knowledge.
- [ ] Use the consequences described in item 2: confiscation, relocation, changed patrols or temporary restrictions can force the player to adapt.
- [ ] If an important carried item is confiscated, provide a recoverable or alternate path so the run does not become unwinnable.
- [ ] The Notebook should retain discovered information after capture, even if the player loses a physical item.
- [ ] Consider allowing a capture to reveal new information or move the player somewhere useful occasionally, so failure can alter the puzzle rather than simply waste time.

### Validation before implementation

- [ ] Draw the complete dependency chain before coding it and check that every required step has a clear in-world reason.
- [ ] Identify which stages are fixed, which can branch and which can be randomised.
- [ ] List every Notebook fact/deduction that can be generated by the chain and the exact discovery that unlocks it.
- [ ] Check for circular dependencies, such as a key being placed behind the door it unlocks.
- [ ] Check that a player who ignores the Notebook can still succeed by careful observation, while the Notebook substantially reduces the need to memorise clues.
- [ ] Check that a player returning after a break can use the Notebook to understand what they have already discovered without being told the solution.
- [ ] Prototype the sequence on paper first and review pacing before changing game files.

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

- [x] Design a notebook/journal UI accessible during Asylum Escape.
- [x] Automatically add entries when the player discovers important clues.
- [x] Consider potential notebook content:
  - rough floor-plan sketches;
  - discovered rooms and routes;
  - dates and historical facts relevant to puzzles;
  - diagnoses/treatments found in records;
  - copied or paraphrased document clues;
  - observations such as "The east and west wings appear symmetrical";
  - known locked doors and possible ways around them.
- [x] Distinguish discovered facts from deductions/hints.
- [x] Avoid turning the notebook into a conventional objective checklist.
- [x] Consider allowing entries to update as the player learns more.
- [x] The notebook should include a larger version of the map, which should be changed to have a "fog of war" effect which slowly reveals the map in a small radius around the player as the player explores.
- [x] Opening/reading the notebook should pause NPC movement, similar to close inspection of artwork.

Implemented in the browser game: **Tab/M/N** (or **J**) and the touch **NOTES**
button open the notebook. Explored places, inspected records and observed/tested
doors and stairs add or update notes. Facts and deductions have separate sections.
Each floor and the grounds retain their own explored sketch for the current run;
the minimap uses the same fog. Reading freezes the player, NPCs and timer.
Current outside doors are usable; locked-door and treatment-document notes can
follow when those puzzle elements exist. Implementation and validation details
are in `DEVELOPMENT.md`.

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
