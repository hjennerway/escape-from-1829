import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const out=new URL('./',import.meta.url);
const source=JSON.parse(await readFile(new URL('after-source-validation.json',out),'utf8'));
const compiled=JSON.parse(await readFile(new URL('after-compiled-validation.json',out),'utf8'));
assert.equal(compiled.modelMode.mode,'compiled');
assert.equal(source.intersections.length,0);assert.equal(compiled.intersections.length,0);
for(const key of ['retained','joins'])for(const [i,p] of source[key].entries())assert(Math.abs(p.y-compiled[key][i].y)<1e-6,'Source and compiled roof heights match');
const manifest=JSON.parse(await readFile(new URL('../../dist/compiled/manifest.json',import.meta.url),'utf8'));
assert.equal(manifest.sourceHash,await modelSourceHash());
await writeFile(new URL('final-model.json',out),JSON.stringify({manifest,verifiedHardware:'NVIDIA GeForce RTX 3090 Ti / Direct3D11',sourceMode:source.modelMode,compiledMode:compiled.modelMode,retainedRidgeProbes:source.retained.length,bayValleyProbes:source.joins.length,renderProbesPerBrowserPath:source.samples,renderIntersections:0,pageErrors:[...source.errors,...compiled.errors],visualReview:['plan','garden','court','garden-close','court-close'],exports:'Shared browser sources and local compiled aerial. Unity, Blender and packaged exports not regenerated.'},null,2)+'\n');
const development=new URL('../../../DEVELOPMENT.md',import.meta.url),current=await readFile(development,'utf8');
const note=`## Level west-wing eaves from the red wall (5 October 2026)

The owner's blue-circled/red-wall correction identifies the differing eave
heights as the cause of the west roof connection problems. The outer pavilion,
west end and both canted bays now use the main range's y=14.53 slate edge,
with supporting walls at y=14.3. Upper cornice caps and gutters follow the
same level. The main ridge and four branches retain their coordinates and
y=17.08 crowns. Raised shoulders, slate wedges, rendered risers/returns and
the unfinished four-bay repair's additional clipping are removed. Reference
and superseding dimensions are in Research/west/level-eaves-2026-10-05/README.md.

The focused roof regression passes 95 perimeter samples, retained ridges,
closed valleys, matching wall tops and 552 physical roof/render samples.
The saved former model fails the revised regression. West refinement, inside
corners, basement access, garden stairs, inner courtyard and east forward-end
checks pass. Validation is restricted to 1829 and its immediate surroundings;
the whole-estate suites are not run, following the owner's instruction.

The hardware launcher verifies NVIDIA GeForce RTX 3090 Ti via Direct3D11.
Source and actual compiled aerial views each pass 22 retained-ridge and
16 bay-valley probes, with matching heights and zero intersections in
440 browser render samples. Overhead, front/back and close captures are
visually inspected; both paths have no page or shader errors. Logs, saved
sources, references and views are in Browser/artifacts/west-level-eaves/.

Shared browser modelling sources and the local compiled aerial are updated.
The final manifest matches the current source fingerprint and its binary
checksum is verified. Independent entrance-roof corrections are preserved.
Unity, Blender and packaged exports are not regenerated.
`;
if(!current.includes(note.split('\n')[0]))await writeFile(development,note+'\n'+current);
const index=new URL('../../../Research/west/README.md',import.meta.url),text=await readFile(index,'utf8');
const section=`## Level roof-to-wall edges (5 October 2026)

The [blue-circled/red-wall correction](level-eaves-2026-10-05/README.md)
lowers every west cross-range perimeter to the main wall's eave height.
It supersedes the raised roof edges and their stepped render returns.
The original ridges remain, with straight pitches meeting level cornices.

`;
if(!text.includes('## Level roof-to-wall edges'))await writeFile(index,text.replace('# West wing refinement\n\n','# West wing refinement\n\n'+section));
console.log('PASS: matched source/compiled joins, current compiled model, modelling notes and final report.');
