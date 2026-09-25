import {appendFileSync,copyFileSync} from 'node:fs';
copyFileSync('C:/Users/Harry/AppData/Local/Temp/codex-clipboard-220df831-b68a-40db-88dd-a29309e2d80d.png','Research/redesmere-garden/cleanup-annotation.png');
appendFileSync('Research/redesmere-garden/README.md',`

## Wall join and inner garden gravel — 25 September 2026

The owner's cleanup-annotation.png identifies four corrections: red removes
the overlapping white/brick wall, blue straightens the inner path corner,
yellow matches the cross-walk gravel, and purple replaces the small grass
recess against the forward wing with gravel. The screenshot supplies location
evidence; the owner's accompanying request defines these changes.

The taller service room's lower masonry and white base/band stop at z=10,
where the low brick end range begins. Above its 4.55 eaves the service room
retains its existing extent. No cladding overlay hides the former overlap.

The east entrance apron, cross-walk and passage are one gravel polygon at
y=0.28, using the entrance gravel material. The passage now ends flush with
the cross-walk's z=30.55 lawn edge, and the little x=41..45 recess is paved
back to the wall. The separate passage and differently coloured cross-walk
slabs are removed. Surrounding garden lawns retain their outlines.

These construction-time changes affect the shared browser source used by
aerial, Explore and gameplay. The local aerial asset is rebuilt separately;
Unity and Blender exports are unchanged. Before/after and compiled visual
checks use Browser/artifacts/garden-cleanup-*.
`);
appendFileSync('DEVELOPMENT.md',`

## Redesmere wall overlap and garden gravel cleanup (25 September 2026)

Cut the service room's lower wall, white base and floor band back to their
join with the low brick end range, removing the coplanar surfaces that caused
the marked flicker. The upper service room and passage head remain in place.
Joined the east apron, garden cross-walk and passage into one level gravel
surface with a straight garden edge, and paved the small marked grass recess
against the forward wing. See Research/redesmere-garden/README.md and
cleanup-annotation.png for the owner reference and geometry bounds.

Focused checks sample the exposed brick to reject overlapping wall planes,
the filled recess and complete straight gravel edge, retained garden lawn,
and a player-width walking route through the cross-walk and passage.
Browser sources and the local compiled aerial model are updated; Unity and
Blender exports are unchanged. No runtime layout/visibility behavior changes.
`);
