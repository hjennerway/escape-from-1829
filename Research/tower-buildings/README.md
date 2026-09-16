# Tower service buildings

The nine references here were supplied on 15 September 2026. The photographs
are architectural evidence; coloured arrows mark camera positions and viewing
directions. The blue circle in img4 selects the separate Irby/Ashley range, now modelled by the later Irby/Ashley task.

`Browser/dist/tower-buildings.mjs` reconstructs the brick service ranges east
and south of the water tower: gabled and hipped halls, flat links with parapets,
roof ventilators, sash windows, stores doors and the ramp shared by img2/img3.
Img1 and the latest junction correction set the corridor one third into the
north/south tower faces. Flat strips sit in front of the upper arches; shallow
pitches contact only the eastern third and rise to ridges beyond the tower.
The face away from Redesmere has two inward-falling slopes with a flat centre, as confirmed by the three later blue traces. The earlier steep roof reconstruction has
been replaced. The tower stays in place; the chimney follows the latest red-X relocation below.

The saved OS outline supplies the eastern range boundaries. The marked roof correction supersedes the western stores outline and turns that wing north/south.
Internal divisions, roof pitches, obscured walls and ramp dimensions are visual
estimates, not surveyed dimensions. The registered tower and the old OS trace
do not coincide perfectly; photograph-supported abutments take precedence at
the tower. Missing ground outlines are clipped by the new building footprints.

Img3 refines the low east end of Main/admin into a canted brick room with a
matching hipped roof, tall sash lights, pale stone trim and exposed brick base.
Img4 informs the curved service-road approach and the paved court around the
ramp. The road widths, kerb colour and annexe-side route retain the established
scene treatment. The blue-circled building is now modelled separately as Irby/Ashley; see ../irby-ashley/README.md.

New service buildings, ramp and court are created only in the Historical aerial
layer. Main/admin already belongs to that layer. Modern-only views hide them.
The Unity and Blender exports are unchanged.

Use `aerial.html?view=tower-buildings` for the overview, `tower-buildings-plan`
for the plan, and `tower-buildings-1` through `tower-buildings-4` for approximate
photo comparisons. Photo 4 uses a wide angle to represent the panorama.

Validation: `node Browser/test-tower-buildings.mjs`, the existing admin, road
and aerial-layer tests, and browser renders of all ten reference views.

## Marked roof correction

`roof-correction.png` distinguishes the roofs in the first reconstruction:

- Red: the central service hall has one centrally placed blue dormer.
- Blue: the range running east from the tower carries the pair of blue dormers
  shown in img1. Its main body extends east and south towards the fixed chimney.
- Yellow: the stores turn 90 degrees, with a flat front section and a hipped
  ridge running back into the south tower wall. The former sideways OS edges
  are retired so they do not leave an obsolete outline on the ground.

The north range now fills the gap against the tower. Only the side facing
Redesmere/1829 remains unobstructed. Dormer walls follow their host roof slopes.
All these corrections stay in the Historical layer.

## Flat arch junction and ridge direction

`arch-junction-correction.png` corrects the steep tower junctions. On the north
and south faces the corridor begins at x=146.3 (one third into the 10.2-unit
face); its flat strip runs to x=149.7, in front of the high arch. The pitched
part then crosses only the final third, rising towards x=156, beyond the wall.
The first junction estimate used a 7.36-unit deck; the three traced photographs below supersede that height.
These are photo-based estimates. The west/Redesmere-facing tower wall stays
clear, and the upper arches remain visible above the flat abutments.

All three blue protrusions rotate 90 degrees: the paired ridges run east/west,
and the single central ridge runs north/south, parallel to their host roofs.
Their locations and the one-plus-two distribution are retained.

## Three traced tower faces

The latest three marked photographs identify the roof contacts unambiguously:

| File | Tower face | Contact when facing the wall |
| --- | --- | --- |
| traced-face-1-white-door.png | 1, white entrance door | Flat centre and one slope rising to the right |
| traced-face-3-opposite-door.png | 3, opposite door | One slope falling from the left to the flat centre |
| traced-face-4-away-from-redesmere.png | 4, opposite Redesmere | Two slopes falling inward to a flat centre |

`Browser/dist/tower-roof-profiles.mjs` is the common source for the building
junctions and the tower's shallow wall scars. Profiles are registered to the
existing upper arches: approximately 9 units at the flat centre and 11.2 at
the shared outer corners. The centre spans +/-1.7 units on the 10.2-unit face.
These are model-scale estimates from the photographed arch landmarks, not
surveyed heights. The traced slope count, direction and face registration
are direct user evidence.

The east abutment now carries both slopes, with the central channel kept flat.
Its north and south edges meet the adjacent corridor slopes at identical
heights. The east hall blends into that profile without a step or an unsupported
eave. Existing dormer locations and their ridge directions are retained.

Close comparison views: `tower-roof-white-door`, `tower-roof-away`, and
`tower-roof-north`. Tests raycast the actual meshes along each complete traced
profile and across both roof corners, and verify exposed arches, dormer counts,
roof directions and Historical visibility.

## Paired protrusions on the ridge

`paired-dormer-ridge-correction.png` places the two blue protrusions directly
on the east hall ridge, rather than offset onto its south slope. Both centres
now sit at z=-50.4, with east/west ridges. Their roof-relative height preserves
visible blue walls and glazing above the crest. The single central hall
protrusion remains unchanged. Validation compares the actual ridge meshes
and checks that glazing clears the host roof.

## Img2 circular window, aligned fronts and entrance infill

The user subsequently identified the green-circled roof in
`img2-window-correction.png` as the **building pierced by the chimney**.
Its southern front remains flat; the rear has a pitched slate roof, a north
hip and a south brick gable carrying the round light with curved mullions.
The chimney stays at its fixed position and penetrates this pitched section.
The tower-connected west stores retain the original hip, falling towards
Redesmere and down to their flat front, with no circular window. The purple
central hall gable remains plain brick.

`frontage-gap-correction.png` aligns the four southern wall fronts to the
existing eastern stores at z=-16.6. The west stores and south flat link extend
to that line, with their front glazing moved with the masonry. The service
court extends west to meet the wider frontage. In the follow-up clarification,
the user chose to extend the **flat-roof entrance link** back to the middle
hall, so that link now runs north to z=-42.8 and closes the green-circled gap.
The central pitched hall and its single blue protrusion retain their positions.
All geometry remains on the Historical layer.

## Separate small rear roof in img2

The user clarified that the additional building is the **small, distant roof
with a blue protrusion just right of the purple-marked gable**, rather than
the long roof immediately behind the blue-circled stores. A separate hipped
brick range now occupies x=204.5..218.5, z=-75.5..-61.5 with one blue roof
protrusion. Short passages separate it from the central hall and the long
eastern service range. Its dimensions and hidden walls are photo-based
estimates. The two tower-range protrusions and the one central-hall protrusion
remain, giving four in total. All additions remain on Historical.

## Full chimney roof and anticlockwise rotation

`chimney-roof-rotation-correction.png` supersedes the chimney hall's earlier
north/south roof and flat front section. The roof now covers the entire
visible yellow section, x=162.3..185.83 and z=-40.5..-16.6, meeting the adjoining
west stores at x=162.3. Its ridge runs east/west: a 90-degree anticlockwise
rotation viewed from above moves the circular-window gable from south to east,
above the flat entrance link. The opposite end remains hipped. The existing
walls, fixed chimney, shared frontage and other roofs retain their positions.
The buried wall overlap west of x=162.3 remains beneath the adjoining stores;
no new roof projects into their flat section.

## Central hall footprint and chimney relocation

`central-hall-footprint-correction.png` removes the yellow-circled northern
boiler hall. Its walls, roof and separate sash details are removed. The
retained stepped tower corridor has masonry closing the two newly exposed
roof cuts.

The green line aligns the central hall's far wall with the paired-protrusion
range at z=-60.3. The blue footprint extends the central hall to z=-32 while
retaining its x=180..202 width. Its one blue protrusion remains centred on
the reshaped roof. The flat entrance link now starts at z=-32, meeting the
new gable instead of continuing beneath the extension.

The chimney moves from (180,-31) to (177.5,-35.5), estimated from the marked
red X. It remains beside the central hall's west wall and through the
circular-window building's roof. The extended hall ends just beyond its
southern side. Chimney height and diameter are unchanged. The yellow removal,
green alignment, blue extent and chimney placement are checked against the
actual meshes; the main/admin, Historical-layer and footprint checks pass.

## Slide the yellow-marked service group towards main/admin

`admin-slide-correction.png` selects the circular-window hall, flat entrance
link, southern stores, long eastern range and their short connecting range.
The user explicitly keeps the chimney fixed at (177.5,-35.5), with no building
intersecting it. After the six-unit road-width shift left an overlap, the user
chose to slide the selected group farther while preserving its shapes. The
final translation is +8.5 in Z towards main/admin; visible widths, depths,
heights and roof forms are preserved. The old hidden masonry overlap beneath
the unselected west stores is trimmed to the selected roof boundary, so no
unroofed strip is exposed by the slide. Doors, sashes, the circular window, rooflight,
downpipes, landing, ramp and rails translate with their buildings.

The unselected tower ranges, central hall and separate rear building stay in
place. A small low recess in the stationary central hall's masonry clears the
chimney's wider foundation; its upper walls, roof and blue protrusion retain
their positions. The service court follows the moved frontage to keep the
ramp accessible. Everything remains on Historical.

Checks sample the chimney circumference at twelve heights from foundation to
shaft against all actual building meshes and details, with a 0.01-unit margin.
The chimney position, preserved tower roof contacts, exposed glazing, ramp,
road clearances and all Historical/Modern combinations are also checked.

## Tower corner ridge and flat return

`tower-corner-ridge-correction.png` extends the paired-protrusion roof ridge
west from x=163.2 to the blue point at x=156, z=-50.1. The main ridge meets the
existing tower-corner height. The perpendicular ridge over the west stores
is removed. One continuous south-facing slate roof and its west hip cover
the green area; the red return at z=-40.5..-36.3 is flat at y=9. Both the
main ridge and paired protrusions share the updated line. The three traced
tower contacts still meet their prescribed heights and corner joins.

## Blue protrusion glazing faces

`blue-protrusion-glazing-correction.png` puts the vents/windows on the side
faces pointing down the host roof slopes. The east/west pair has south-facing
glazing; the central and rear north/south protrusions have east-facing glazing.
Their former ridge-end faces are plain blue. Counts, positions and roof
orientations are preserved. Tests verify the glazing normals are perpendicular
to the ridge, that the glass is exposed, and that the old faces are plain.

## Twin workshop gables and cleared photo viewpoint

The 16 September correction in `twin-workshops/img1-loc.png` selects the
small detached building in yellow and the central hall in purple.
`twin-workshops/img1.jpg` supplies the twin brick gable fronts, blue doors,
three upper windows per gable, pale lintels and red ridge/coping details.

The selected 14-by-14 building moves twelve scene units along -Z, following
the blue arrow, to x=204.5..218.5, z=-87.5..-73.5. Its copy adjoins it on
the tower side at x=190.5..204.5. Both retain their wall and ridge heights;
the roofs now have just two pitches facing west towards the water tower and
east towards Estates, with brick gables facing the yard. The existing blue
roof protrusion moves and duplicates with its host.

The purple hall's rear moves from z=-60.3 to -49 towards Main/admin while
its front remains at z=-32. Its roof shortens and its single protrusion stays
centred. The opened paved court allows the camera at (191,1.8,-55.5), inside
the former hall footprint, to see both fronts and walk to both doors.
Distances and concealed elevations remain visual estimates. This supersedes
the earlier separate hipped rear building and central rear-edge alignment.

Open `aerial.html?view=tower-twin-gables` for the photo comparison,
`?view=tower-twin-gables-site` for context, or
`explore.html?view=tower-twin-gables` to walk from the marked viewpoint.
The Locations menu includes **Twin workshops**. Geometry belongs to Historic
in the browser; the Unity and Blender exports are unchanged.

Validation checks actual roof normals and ridge extents, duplicated dimensions
and protrusions, both photo sightlines, walking access and solid workshop
walls, the shortened hall, existing tower contacts and chimney clearance.
The full browser regression suite passes.

The photograph-established open court also clips obsolete OS building marks;
this does not add building or walking obstacles to the paved yard.

## Enlarged workshop in the yellow footprint

`workshop-copy-footprint.png` selects the western twin workshop in red and
marks the new adjoining footprint in yellow. A complete copy, including the
gable roof, blue dormer, doors, glazing, coping and drainage, is scaled by 1.5
in width and depth into x=169.5..190.5, z=-87.5..-66.5. Walls, roof and dormer
retain their original heights. Its rear edge remains aligned with
the original workshops. Placement and scale are estimated from the annotation.

Open `aerial.html?view=tower-workshop-copy` to inspect the result. The twin-gable
photo and walking start move to the eastern side of the court, clear of the new
building and both cylinders. The copy follows Historic visibility, supplies
walking collisions and clips covered OS outlines through its actual walls.
