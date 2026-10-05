# West outer-end eave flicker

The owner's [blue circled edge](../../../Browser/artifacts/west-end-eave-flicker/marked-reference.png),
supplied on 5 October 2026, identifies flicker along the gutter and cornice
above the outer-end windows. The annotation locates the defect; it is visual
reference evidence.

The three former gutter boxes overlapped the upper white cornice. After the
shared eave-height correction, their tops and the white cap both occupied
y=14.53. Two surfaces competed for the same pixels. The straight boxes also
continued behind the shallow central pier instead of following its returns.

One closed, mitred gutter now follows the cornice's exposed outer edge and
both pier returns. Its 0.12-unit width and 0.09-unit height are retained, as
is its y=14.53 top. The centreline lies 0.335 units outside the cornice line,
the sum of both half-widths, so their solid footprints meet at their edges
without overlapping. The slate, white cornice, wall and opening definitions
are retained. These are fitted model dimensions rather than survey data.

The correction is in Browser/dist/west-refinement.mjs. The focused gutter
regression checks 65 actual cornice positions for competing coplanar iron
and 19 positions along the gutter and returns for continuity. The saved former
builder fails with 33 overlaps. Source and compiled visible geometry pass the
same checks. GPU captures include the marked end, a close view, a small camera
shift, a low view and a phone view.

Validation is restricted to this building and its immediate surroundings.
The adjoining yellow entrance boundary and roof crowns remain checked.
Browser sources and the local compiled aerial model are updated; Unity,
Blender and packaged application exports are not regenerated. Baseline source,
test receipts, captures, build output and final-model.json are kept in
Browser/artifacts/west-end-eave-flicker/.
