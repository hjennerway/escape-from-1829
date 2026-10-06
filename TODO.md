# Escape from 1829 — Gameplay To-Do

This file captures planned gameplay improvements for **Asylum Escape**. Items 1, 2, 4 and 7 are implemented in the browser game. Remaining unchecked sections capture planned gameplay work.

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


## 6. Puzzle integration with the building

Use the asylum layout and historical material as puzzle mechanics rather than relying mainly on arbitrary locks/codes.

- [ ] Explore puzzles based on the mirrored wings/building symmetry.
- [ ] Use documents, patient records, historical photographs and artwork as discoverable clues.
- [ ] Link some notebook deductions to architectural observations.
- [ ] Prefer clues that make sense in-world over generic keypad-code puzzles.
- [ ] Ensure historical content remains respectful and clearly framed as period material.

## 7. Incremental interior loading

The owner confirmed the interior was finished on 6 October 2026. The shared browser loader and prepared assets now implement this item; validation and performance receipts are described in `DEVELOPMENT.md` and `Research/geometry-optimization/README.md`.

- [x] Split the finished interior into approximately 10 sections, following wings, floors and doorway boundaries; balance sections by loading cost.
- [x] Share the section-loading system between Explore and Asylum Escape. Load the chosen entrance or starting section first, including its furniture, lights and visible adjoining corridors/stairs, then let the player enter once it is ready.
- [x] Once the player is situated, load the remaining sections in the background, prioritising neighbouring sections and any area the player approaches.
- [x] Keep background construction and graphics preparation in small scheduled steps so loading does not interrupt walking. Evaluate separately prebuilt section assets and load shared furniture/material resources once.
- [x] Preserve consistent navigation, collisions, doors, stair connections, NPC behaviour and interaction state across section boundaries.
- [x] Cache loaded sections for immediate return visits. If the player reaches an unfinished section, briefly hold entry at its doorway or landing until it is ready.
- [x] Validate every entrance and stair connection, background-loading failures and desktop/mobile behaviour. Measure time until entry is playable, frame pacing and memory using the required hardware GPU browser launcher.

## Design goals

- Make escaping feel like learning and exploiting the asylum rather than simply searching for an exit.
- Reward observation and exploration.
- Keep the environment understandable enough that players build useful spatial knowledge over multiple runs.
- Make capture alter the run rather than merely reset it.
- Add replayability without making success feel random.
- Keep the browser build performant and retain mobile support unless a future engine decision explicitly changes those goals.
