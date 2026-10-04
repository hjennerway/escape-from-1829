# Stepped west rear-court corner moved forward

The later [35% / 30% / 35% end-section correction](../end-sections-2026-10-04/README.md)
centres and narrows the entrance pier while retaining these outer limits.

The owner's [yellow/purple/blue/red screenshot](marked-reference.png), supplied
on 4 October 2026, asks for the purple base edge to reach the blue line and
for the adjoining red-shaded face to advance by the same amount. The colour
guides define this correction; the screenshot supplies visual estimates.

This is the outer stepped west court corner, including its low projecting
bay and recessed paired-sash face. Both rear limits move four model units
towards the court (-Z):

| Part | Before | Revised |
| --- | --- | --- |
| Outer rear masonry | z=9 | z=5 |
| Recessed rear masonry | z=11 | z=7 |
| Exposed upper corner-return sash centre | z=10.1 | z=6.1 |
| Complete outer-end depth | 11.5 | 15.5 |

`Browser/dist/west-range-plan.mjs` supplies the shared limits. The outer wall,
low bay, paired recess, sashes, pipes, white base, floor courses, cornices and
slate roofs follow those limits. The two narrow west-end upper sashes retain
their sizes and fit the extended side before the centred entrance pier.
The latest shared west-end rule centres that entrance on the complete end;
the door, pier and straight approach therefore follow its new centre by two
units, from z=14.75 to z=12.75. The approach retains its shape and materials.
The main court wall remains z=5, the garden wall z=13.5 and the outer garden
end z=20.5. Both canted bay profiles retain their dimensions. This supersedes
only the rear-corner limits in the earlier end-depth correction.

Before/after source images, actual compiled/Explore images, saved sources and
validation are in
[Browser/artifacts/west-rear-forward](../../../Browser/artifacts/west-rear-forward/).
The geometry regression checks actual wall planes, equal movement, brick
closure, roof coverage, exposed upper return panes and new walking obstacles;
the saved original model fails the outer-depth assertion. The preservation
comparison isolates this correction against the current shared workspace.

The browser sources and local generated aerial model are updated. Unity,
Blender and packaged desktop/Android exports are not regenerated.

Validation passes the rear-corner geometry/collision regression, 132 exposed
pane samples in each actual compiled aerial and Explore page, desktop/phone
visual checks, roof joins, model checks, compiled/source comparison and all
timeline stops. The final current-source comparison preserves 1,443,573
primitives outside the cross range and separately verifies the centred-door
approach translation. Full-suite failures are limited to the two historical
Jarman and Leighton/Newton whole-estate records, both also failing before
this correction. Their expected records are retained.
