# Annexe frontage adjustment

After reviewing the rear aerial fit, the user requested a slightly larger
annexe closer to the long red frontage line in
`../annexe-placement/front-roads-annotated.png`. The accepted placement uses
horizontal scale 0.72 and root (378, -34): 12.5% larger in width and depth than
the first aerial fit. The approved ward shapes, central frontage details and
building heights are retained. The projecting wards limit the remaining
setback from the avenue; the annexe stays inside the Parsons loop and clear
of the teardrop and Main/admin.

`remove-rear-roads.png` authorizes removal of the four rear access routes,
their two Parsons Lane junction mouths, kerbs and rear hardstanding. Their
former definitions are preserved in `rear-access-before.mjs.txt`. The
surrounding shared Parsons Lane remains intact.

The user accepted this placement and then supplied `narrow-entrance.png`.
Its red outline protects the central asphalt apron; its yellow outline
narrows only the sweeping connection. The revised entrance has a straight
neck about 16% of the apron width and a smooth flare to a mouth about 98%
of the apron width. The curves join the existing oblique avenue. The apron
and step approach retain their exact world coordinates and surface, checked
against `protected-forecourt.json`. Exposed apron kerbs extend to the narrower
opening. No building or named road is moved by this entrance edit.

The annexe access checks pass, including an unbroken walking route, protected
teardrop geometry, road clearance and removal of the rear access group.
Browser plan, access and entrance views render without page errors. The
older photo-placement road snapshot currently differs from Vivienne Smith
Lane and its connected historic route outside this entrance edit; it has
not been overwritten to hide that mismatch. The earlier general Historic
roads test also reported an Admin north service road overlap outside the
annexe work.

The September 17 test maintenance supersedes that snapshot-failure note:
`test-annexe-photo-placement.mjs` now protects the named annexe loop, avenue,
teardrop and Parsons routes and checks removal of all four rear roads. It no
longer freezes unrelated roads merely because one vertex is east of x=240.
The archived reference is unchanged. The separate service-road overlap is
corrected in the [Historic road notes](../historic-roads/README.md).

Open `aerial.html?view=annexe-access` for the layout or
`aerial.html?view=annexe-entrance` for a closer view. This changes the browser
model; Blender and Unity exports are unchanged.

## September 21 annexe scale and centring

The later annotated aerial requests the annexe at 90% of its preceding size,
without changing its shape, and centres its front on the paved approach. The
building now receives a uniform 0.9 scale on all three axes. Its transform is
translated about the centre of the entrance facade, so that facade centre
retains the exact world point on the established forecourt centreline. The
asphalt forecourt, sweeping entrance, frontage avenue, teardrop and all other
site geometry remain fixed. Browser sources only are changed; Blender and
Unity exports remain unchanged.

![Narrow entrance and preserved forecourt](annexe-access.png)

## September 24: equal grass strips beside the annexe forecourt

The supplied `equal-grass-reference.png` and the user's clarification require
an equal amount of green on either side of the paved apron. This supersedes
the September 21 doorway-centred placement above: the two projecting court
wings are asymmetric, with inward masonry faces at map x=-27 and x=20.

The whole annexe moves sideways by 3.676 scene units, placing the midpoint
between those faces (map x=-3.5) on the fixed apron centreline. Both grass
strips now measure 5.309 scene units from paving edge to masonry. The uniform
90% size, all local building geometry and the frontage setback are retained.
The central doorway is consequently slightly off the paving centreline; equal
side grass widths are the user's clarified alignment criterion.

The original apron and entrance-step approach match `protected-forecourt.json`
exactly. Roads and other buildings remain fixed. Annexe cameras, masonry
collisions and the rear kitchen follow its placement. Browser sources and the
compiled aerial model are updated; Unity and Blender exports are unchanged.

Validation: the full browser suite, source/compiled comparison and browser
timeline checks pass. Source and compiled front and overhead views were
captured under `Browser/artifacts/annexe-centre-*`; visual inspection confirms
the balanced grass strips. Existing local geometry snapshots remain unchanged.
