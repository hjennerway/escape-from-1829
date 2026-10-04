import {appendFileSync,readFileSync} from 'node:fs';
const marker='## Stepped west rear-court corner moved forward (4 October 2026)';
const note=`

${marker}

The owner's yellow/purple/blue/red screenshot advances the outer stepped
rear corner four units towards the court: outerRearZ=9 becomes 5 and
recessRearZ=11 becomes 7. The recessed red return and its upper sash follow
equally. The low bay, masonry, windows, pipes, base, floor bands, cornices
and roofs derive their positions from the shared west-range plan. The main
court and garden faces retain z=5 and z=13.5; the outer garden end stays
z=20.5. See Research/west/rear-forward-2026-10-04/README.md.

The latest concurrent west-end proportion rule centres its 30% entrance
section on the full end. That pier, entrance and straight path follow the
extended end's new centre, moving two units towards the court. The path's
shape, rotation, scale and material remain exact. An isolated comparison
using frozen current model sources preserves all 1,443,573 other primitives
outside the marked cross range, both canted bay geometries/collision profiles
and all eighteen bay window dimensions. Earlier comparison records are kept
alongside the current proof in Browser/artifacts/west-rear-forward/.

The rear-corner regression checks actual brick planes, equal four-unit
movement, full roof coverage, exposed red-return panes and collision in the
newly occupied strips. The original rear limits fail its outer-depth check.
West refinement, shared exterior, basement passage, walking, roof contacts,
facade courses, periods and model/binary/layout/control checks pass.
Actual compiled aerial and Explore pages each pass 132 exposed pane samples,
both moved-wall collision checks, desktop/phone views and no page/shader
errors. The rendered roof joins and complete windows were visually reviewed.

The local aerial asset is rebuilt and its final source fingerprint matches.
Source/compiled image and draw-count comparison, full detail, missing/bad
asset fallbacks and every timeline stop pass. Independent workspace rebuilds
initially replaced the manifest during comparison. Its isolated rerun keeps
the already hash-checked manifest/binary chosen at test startup; original
fallback routes and assertions are retained. Actual page checks use the
ordinary server and current manifest.

The required npm test run reaches Jarman's historical whole-estate snapshot;
all remaining commands are then run. Only Jarman and Leighton/Newton's
protected whole-estate references fail. Both also fail with this correction's
original rear limits restored: 818,951 versus 818,930 primitives for Jarman,
and 882,998 versus 882,977 for Leighton/Newton. Their expected records are
retained. The remaining 32 commands pass. Logs, original sources, preservation
proof, matching images and final manifest metadata are in the evidence folder.

Browser sources, tests, modelling notes and local generated aerial assets are
updated. Unity, Blender and packaged desktop/Android exports are not regenerated.
`;
const file=new URL('../../../DEVELOPMENT.md',import.meta.url);
if(!readFileSync(file).includes(Buffer.from(marker)))appendFileSync(file,note);
const research=new URL('../../../Research/west/rear-forward-2026-10-04/README.md',import.meta.url);
const validation='\nValidation passes the rear-corner geometry/collision regression, 132 exposed\npane samples in each actual compiled aerial and Explore page, desktop/phone\nvisual checks, roof joins, model checks, compiled/source comparison and all\ntimeline stops. The final current-source comparison preserves 1,443,573\nprimitives outside the cross range and separately verifies the centred-door\napproach translation. Full-suite failures are limited to the two historical\nJarman and Leighton/Newton whole-estate records, both also failing before\nthis correction. Their expected records are retained.\n';
if(!readFileSync(research).includes(Buffer.from('Validation passes the rear-corner')))appendFileSync(research,validation);
console.log('Recorded the correction, final validation and unchanged export scope.');
