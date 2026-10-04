# Front west garden return: windows and setback

The owner's 4 October follow-up uses the purple circle and green/yellow face
marks in [the photograph](photo-marked.png) and [game view](game-marked.png).
The [render plan](plan-game.png) and [matching Earth plan](plan-earth.png)
establish that the green return is behind the yellow lower-wing face. The
request explicitly limits this correction to the front west section: preserve
the rear west section and the asymmetric opposite wing. The images provide
modelling evidence; the owner's written request determines the scope.

This supersedes the blank west return and projecting inner-pavilion outline
in [the earlier outline notes](../outline-2026-10-04/README.md). The marked
green wall has two sashes on the ground floor and two on the middle floor.
The upper green wall remains blank, with two upper windows around the garden
end. Placement and dimensions are visual estimates, not surveyed measurements.

| Face or part | Previous model | Revised model |
| --- | --- | --- |
| Green west face | x=-44.8, in front of yellow | x=-40, one unit behind yellow |
| Yellow lower-wing face | x=-41 | Retained at x=-41 |
| Upper inner pavilion | x=-44.8 to -38 | x=-40 to -35 |
| Garden-end plane | z=21.2 | Retained at z=21.2 |
| Green-face glazing | None | Two 1.05 × 2.35 sashes per lower floor |
| Green sash centres | None | z=17.25 / 19.75, y=2 / 6.45 |

The low forward root has a real stepped masonry footprint, matching its
foundation, cornices and collision polygon. Its root roof retreats beneath
the upper pavilion. The exposed lower hip has low eaves at the pavilion end
so slate does not cover the upper panes. The first yellow-face sash moves
from z=21.5 to 22.1 to clear the new corner; the remaining yellow schedule
and long forward section retain their positions.
The three generic sashes formerly behind the new pavilion footprint are
omitted; the exposed upper garden-end pair provides that photographed glazing.

The recessed flank's garden door and glazing keep their established x=-47.1
axis. Joined floor bands follow the recessed corner. The pavilion and its
roof/cornices retain their whole 1849 wing membership after crossing the
automatic timeline boundary. Cross-range depth, court wall, western end,
fire escape, rear west geometry and opposite wing retain their definitions.
No interior plan arrivals change.

Browser sources are `west-range-plan.mjs`, `west-front-photo-detail.mjs`,
`west-front-setback.mjs` and the local root case in `escape-exterior.mjs`.
References, saved baseline sources, matching before/after captures and
validation evidence are in
[Browser/artifacts/west-front-setback](../../../Browser/artifacts/west-front-setback/).
The local aerial model is regenerated. Unity, Blender and packaged exports
are not regenerated.

Validation retains every one of the 1,444,316 primitives outside the front
correction bounds, including the rear west section and opposite wing. There
are 16 net local primitives. West geometry, complete pane exposure, the nearby
inside corner, joined courses, roof attachments, basement walking and all
13 periods pass. The final model suite and compiled/source, fallback and
timeline tests pass. Actual compiled and Explore pages pass 16 visible pane
probes each and the recessed-wall collision check without page/shader errors.

The required browser suite, continued from the updated exterior survey,
passes its preceding checks and stops at the historical Jarman whole-estate
snapshot. The saved pre-change model already differed (818,966 versus 818,930
stored); this correction has 818,982. The expectation is not rebased and the
complete suite is not reported as passing. Logs and matched captures remain
in the evidence folder linked above.
