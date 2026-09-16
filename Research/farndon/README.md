# Farndon ward

The user's corrected blue outline in `img1.png` sets the building footprint.
The red Ashley/Irby and purple Upton/Frith/Oscroft marks identify neighbouring
ranges. In `aerial-annotated.png`, the yellow dot and arrow locate the garden
camera for `img2.jpg`; they are not site objects. `aerial.png` supplies the
unmarked roof reference.

## Registration and reconstruction

`Tools/register_farndon.mjs` fits a ground-plane projective transform from
18 visible brown OS corners. The control RMS is approximately 0.28 scene units;
this measures the picked screenshot corners, not survey accuracy. The blue
vertices are then simplified to right angles in the estate axes. Farndon
occupies approximately x=149.3..198.1 and z=-181.2..-140.3.

The resulting H-shaped single-storey ward retains the unequal garden wings,
short rear arms, small rear room on a narrow link, and low west-side projection.
The former short OS eastern arm is extended to the corrected blue end.
The garden between the wings and the two rear recesses remain open.

The aerial guides the joined slate roofs and rear room. The garden photograph
guides the plain brick end gables, central triangular gable, long multi-pane
sashes, door positions, brick eaves and modest chimney stacks. The main eaves
are 4.6 scene units high; the small rear room, link and side room are lower.
Heights, roof pitches, hidden elevations and minor details are estimates.
The neighbouring ward transforms and the registered OS connection stay fixed.

## Browser integration

`Browser/dist/farndon-ward.mjs` owns the ward geometry and camera presets.
It appears in Historic and walking/gameplay. It is hidden in Modern-only.
Only the superseded Farndon OS edges (154..166 on the principal contour) are
retired; adjoining unmodelled corridor traces remain and are clipped at the
new walls. Building collision footprints preserve the accessible recesses.

Choose **Farndon ward** from Locations, or open:

- `aerial.html?view=farndon` — overview;
- `aerial.html?view=farndon-plan` — overhead footprint;
- `aerial.html?view=farndon-site` — neighbouring wards and OS context;
- `aerial.html?view=farndon-2` — yellow-dot garden photo direction;
- `explore.html?view=farndon` — walk from the garden approach.

`node Browser/test-farndon.mjs` checks the marked solid/recess picks, roof
coverage at 582 interior samples, roof normals, single-storey window exposure,
walking collisions, retained adjacent OS connections and layout visibility.
`node Browser/artifacts/inspect-farndon.cjs` renders the four aerial/photo
views, walking and mobile navigation. Unity and Blender exports are unchanged.

