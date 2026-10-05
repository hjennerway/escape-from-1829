# Removed pavilion roof-edge protrusion (5 October 2026)

The owner's [blue-circled screenshot](../../../Browser/artifacts/west-pavilion-roof-tip/reference.png)
locates a raised slate-and-white-trim stub at the inner garden pavilion's
entrance-side join. The image is defect evidence; the written request asks
for its removal.

The raised short block and abrupt 0.23-unit step are removed. An initial
continuous descending return was subsequently integrated with concurrent
work preserving the main roof pitch. The final coping and brick closure
follow that pitch at the slate's inner edge; the old fringe retracts to it.
The established pavilion valley endpoint at x=-34.6 is retained. This
supersedes the short step in the earlier yellow-boundary interpretation.
Implementation is in `Browser/dist/front-inside-corners.mjs`; fitted
coordinates remain model estimates.

`Browser/test-west-entrance-roof-boundary.mjs` checks 88 pitch/bend contacts,
absence of abrupt steps, coping alignment, 432 physical slate/render probes
and retained adjoining crowns. Independent samples outside the former
patch establish the retained pitch. The saved former geometry fails this
regression. Source and actual compiled GPU views cover the marked angle,
close view, opposite angle and phone view, with 23 visible edge/seam probes.
Evidence and original sources are in `Browser/artifacts/west-pavilion-roof-tip/`.

The shared browser source applies to aerial, Explore and gameplay. Local
compiled aerial models are regenerated. Unity, Blender and packaged
application exports are not regenerated. Final validation limitations are
recorded in `DEVELOPMENT.md`.
