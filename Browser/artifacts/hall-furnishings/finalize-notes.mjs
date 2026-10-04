import assert from 'node:assert/strict';
import {readFile,writeFile,copyFile} from 'node:fs/promises';
const repo=new URL('../../../',import.meta.url),out=new URL('./',import.meta.url),hall=JSON.parse(await readFile(new URL('validation.json',out))),regression=JSON.parse(await readFile(new URL('regression/validation.json',out))),scope=JSON.parse(await readFile(new URL('scope.json',out)));
assert.equal(hall.items,32);assert.deepEqual(hall.errors,[]);assert.deepEqual(regression.errors,[]);assert.equal(regression.models,29);assert(scope.existingFurniturePreserved&&scope.interiorSourcesExcluded);
await copyFile(new URL('regression/visitors-mobile.png',out),new URL('mobile-visitors.png',out));
const development=`## Three open halls furnished (4 October 2026)

The first-floor hall directly over Reception is now a visitors’ sitting hall:
two tables with eight inward-facing Windsor chairs, books, a sideboard, two
framed landscapes and a visiting-hours notice. The ground-floor open area
east along the corridor is a ward service lobby with two open linen cupboards,
a wheeled wooden linen trolley, a bench and a staff duty board. Directly above
that lobby, the first floor has a communal recreation area with a four-chair
draughts table, newspaper stand, sideboard with books and a sewing basket,
and a bench near the windows. These are owner-approved fictional game uses.

\`hall-furnishings.mjs\` adds 32 fixed records in three separate furnishing
areas; it retains the shared plan, wall finishes, door/stair geometry and all
existing room/Reception furnishing records. Cabinet fronts reserve one metre
of access. Placement, navigation, collision and NPC sight use the same shared
catalogue as rendering. The notebook discovers the new named areas.
\`hall-furniture-models.mjs\` supplies nine original models totalling 8,192
triangles, using the existing timber/metal finishes and four shared local
canvas print textures. Models remain instanced by kind/material; no external
artwork, downloads or new game interactions are introduced.

\`npm run test:halls\` checks the models, four seeds, supported props, wall
mounts, table-facing chairs, cabinet access, original corridor lanes, walked
collisions and notebook discovery. Actual Chrome Escape/Explore checks pass
32 rendered records, 24 independent wall-contact rays, five keyboard collision
approaches, an east-corridor walk and identical fixed furnishings. Desktop,
portrait, Explore, notices, board/basket and nine model close views were
visually reviewed without page or shader errors. The shared furniture browser
regression also passes all 29 models, every rendered instance, storage backs,
keyboard collision and new-game fixed/variable behaviour.

The required \`npm test\` passes the preceding interior/furniture/game checks
and stops at \`test-jarman.mjs:11\`: its protected exterior fingerprint finds
818,931 primitives rather than 818,930, with a changed hash. That check’s
model graph excludes all edited interior modules; its expected snapshot is
retained. The full suite is not reported as passing. Full-suite output is
\`Browser/artifacts/hall-furnishings/npm-test.log\`; browser validation,
before/after images, the original records, scope proof and general rendering
results are in the same folder.

Ground/first furnished SVGs and PNGs are regenerated. The aerial compiler’s
171-input graph excludes these sources, and its current fingerprint matches
the existing compiled manifest, so no aerial rebuild is required. Only browser
interiors, checks, notes and review drawings change. Unity, Blender and packaged
desktop/Android exports are not regenerated.

`;
const devURL=new URL('DEVELOPMENT.md',repo),dev=await readFile(devURL,'utf8');if(!dev.startsWith('## Three open halls furnished'))await writeFile(devURL,development+dev);
const research=`## Three open halls — 4 October 2026

The owner approved the visitors’ sitting hall directly above Reception, the
ward service lobby east along the ground-floor corridor, and the communal
recreation area directly above that lobby. Separate furnishing areas retain
the existing open architecture and corridor routes. The sitting hall has two
four-chair reading/visiting groups; the service lobby displays folded linen
in two open cupboards and on a wooden trolley; the recreation area has a
draughts table, newspaper stand, sewing basket and seating near the windows.

The nine new designs are original procedural interpretations using the
existing muted furniture palette. The rural landscape is an original canvas
illustration, and the newspaper masthead, duty schedule, visiting text and
placements are fictional. The visiting hours match the existing Reception
notice. None establishes Chester’s original inventory or room functions.
Existing furniture references and licences below remain applicable to the
reused Windsor chairs, tables and books.

The 32 records stay fixed between games and match in Escape and Explore.
Cabinet fronts, corridors, windows, stair approaches and the ground-floor
outside door stay accessible. Notebook discovery includes the three area
names. Ground and first furnished plans are refreshed; other floors are
preserved. Reproduce the focused checks with \`npm run test:halls\` from
\`Browser\`; reviewed images, original records and scope proof are in
\`../../Browser/artifacts/hall-furnishings/\`. These are browser sources;
the aerial compiler excludes them. Unity, Blender and packaged exports are
not regenerated.

`;
const url=new URL('Research/room-furnishings/README.md',repo),text=await readFile(url,'utf8'),n=text.indexOf('\n');if(!text.includes('## Three open halls — 4 October 2026'))await writeFile(url,text.slice(0,n+1)+'\n'+research+text.slice(n+1));
console.log('Saved furnishing notes and final validation/scope details.');
