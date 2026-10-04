# Hampton / Ince garden window alignment

The owner's [marked game view](marked-reference.png), supplied on 4 October
2026, identifies three corrections on the west garden elevation. The yellow
canted sashes must match the blue central sash's width, the pink window banks
and doorway must share the horizontal centre of their wall, and the green
return's two windows must be evenly distributed across that wall on each
lower floor. The annotation identifies the geometry; the user's written
request defines the work.

These changes supersede the garden bay's 0.60-unit side sash width in the
earlier proportion pass and the later return's fixed z=17.25/19.75 columns.
The latest footprint, floor heights, roofs and wall planes remain the model
reference.

| Feature | Before | Revised |
| --- | --- | --- |
| Garden bay side sash glazing | 0.60 wide | 1.10 wide, matching the central sash on all three floors |
| Pink bank/door centre | x=-47.10 | x=-44.70, halfway between the bay root edge x=-49.40 and pavilion x=-40 |
| Green lower sash centres | z=17.25 and 19.75 | z=15.838333 and 18.861667 |
| Green clear wall gaps | Unequal | 1.653333 at both ends and between the complete 1.37-unit sills |

The green wall spans z=13.50 to 21.20. Both floors share the same two columns.
The complete pink assembly moves together, including the upper pair, middle
glazing, lower sidelights, ledges and blue doorway. D3's outside arrival follows
the relocated doorway in both shared plan copies; its interior anchor remains
part of the established interior plan.

`Browser/dist/west-front-photo-detail.mjs` supplies the shared aerial, Explore
and game geometry. The local compiled aerial model is rebuilt. Unity, Blender
and packaged application exports are not regenerated.

The existing west check now verifies matching widths, exposed widened panes,
centred banks and door, equal clear return gaps and the moved arrival. Saved
pre-change source, matching desktop/phone captures, actual compiled/Explore
pane checks and validation logs are in
[Browser/artifacts/west-window-alignment](../../../Browser/artifacts/west-window-alignment/).

Focused west, roof-contact, basement and outside-arrival checks pass, together
with the model suite, source/compiled image and draw comparisons, full detail,
loading fallbacks and all timeline years. The required browser suite was
continued after its Jarman snapshot failure: the remaining checks pass except
the historical Leighton/Newton whole-estate snapshot. Both snapshot failures
reproduce with only this correction removed in memory by
`without-window-correction.mjs`; their saved expectations are retained.
