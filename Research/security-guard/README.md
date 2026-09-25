# Security guard model references

## GitHub search — 25 September 2026

The request was to reduce the guard's balloon-like appearance and investigate
similar models distributed under MIT. These are references/candidates, not
assets bundled into the game.

| Candidate | Verified licence and contents | Fit for this game |
| --- | --- | --- |
| [woyosensei / Low-Poly-Rigged-Male-Character](https://github.com/woyosensei/Low-Poly-Rigged-Male-Character) | [MIT](https://github.com/woyosensei/Low-Poly-Rigged-Male-Character/blob/main/LICENSE), copyright 2022 woyosensei. The repository contains a Blender male base mesh, named rig bones and a colour palette. The actual licence text was fetched and checked. | The closest lightweight base-mesh candidate found. It would still need a uniform, browser export, bone mapping and integration with the game's movement. It is not a ready-made security guard. |
| [manavld / CharacterEditor](https://github.com/manavld/CharacterEditor) | [MIT](https://github.com/manavld/CharacterEditor/blob/main/LICENSE), copyright 2021 manavld. Its README describes customisable male/female base meshes, clothing, hair and FBX export. | Useful character-authoring reference; the advertised maximum of 30,000 quads with clothing/hair is considerably above this guard's budget. It would require export and rig integration. |
| [achrefelouafi / SoldierThirdPersonThreeJS](https://github.com/achrefelouafi/SoldierThirdPersonThreeJS) | The application repository is MIT, but its credits identify the character as Barcelo's Sketchfab work and the animations as Mixamo. | Not treated as an MIT character asset: the application's licence alone does not establish the separately credited model's licence. No model imported. |

No suitable finished MIT security-guard model was established by this search.
The selected implementation keeps the original procedural character and its
tested locomotion. No code, mesh, texture, animation or rig was copied from
these repositories. If a candidate is imported later, preserve its MIT
copyright and permission notice and verify any separately credited resources.

## Shape and detail revision

The September 18 model used ellipsoids for the head, jaw, shoulder caps,
elbows, hands and boot toes. Small accessories did not remove that rounded
silhouette. The September 25 revision uses purpose-shaped cross sections:

- A continuous chin, jaw, cheek and forehead surface, smaller eyes, eyelids,
  nose planes, sideburns, mouth creases and sparse jaw stubble.
- Sloping shoulders and chest-to-waist taper; shaped upper sleeves, forearms,
  thighs and calves with restrained seams and cloth folds.
- Pointed collars, pocket flaps, a tapered tie, shield inset, name-plate marks,
  back yoke and placket stitching.
- Separate fingers and thumb, a visible wrist, watch face, laced shaped boots,
  toe-cap seam, structured cap crown, thin visor, piping and braid.
- Duty belt and buckle pin, shaped pouches, keys, radio cable and belt torch.

The uniform remains fictional modern security clothing, consistent with the
existing game, rather than a historically researched 1829 uniform. The
browser-only source is in Browser/dist/security-guard.mjs. Existing
displacement-driven walking and joint transforms remain authoritative.

