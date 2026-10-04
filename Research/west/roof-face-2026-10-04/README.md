# West inside-corner roof and face alignment

The owner's [marked game view](game-marked.png), supplied on 4 October 2026,
asks to remove the purple-circled roof and move the purple-marked face back
to the yellow wall. The image locates the requested change; the owner's
written request defines its scope.

The circled part is the east shoulder hip of the low forward root, rather
than the tall inner pavilion's roof. That hip, its supporting shoulder,
foundation and cornice are removed. The remaining low wing begins at z=21.2
beside the pavilion. Its two return sections, glazing and roof-edge coping
follow the new rear face, without leaving detached strips in the corner.

The short exposed principal-range wall moves from z=17 to z=15.5, precisely
continuing the yellow back-wall facet. The adjacent slate is cut back and
closed with masonry and coping at the new plane. The pavilion's full-height
walls, upper roof and attached floor bands retain their geometry. This
supersedes the east low-root shoulder in the earlier
[front-setback notes](../front-setback-2026-10-04/README.md) and the mirrored
low west return in the [inside-corner notes](../../front-inside-corners/README.md).

Browser modelling sources are `west-front-setback.mjs`, `escape-exterior.mjs`
and `front-inside-corners.mjs`. Geometry supplies the revised walking
obstacles. Saved baseline sources, matching views and repeatable validation
scripts are in [Browser/artifacts/west-roof-face](../../../Browser/artifacts/west-roof-face/).
Unity, Blender and packaged application exports are not regenerated.

Focused geometry, panes, roof contacts, trim, periods and walking checks pass.
The regenerated compiled aerial and procedural Explore pages pass all twelve
clearance/alignment probes and sixteen moved-pane probes each, with no page
or shader errors. Matching desktop and phone views were visually inspected.
The model suite, final source/compiled rendering comparisons, full detail,
fallback assets and every timeline stop pass; the manifest matches current source.
All 1,444,714 primitives whose bounds miss the correction area retain their
exact geometry, transforms, materials and collision definitions. Nine local
primitives are removed. The full browser suite stops at the historical Jarman
snapshot mismatch, which also fails against the saved pre-change source; its
stored expectation is not rebased.
