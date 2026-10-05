import {readFile,writeFile} from 'node:fs/promises';
const p='DEVELOPMENT.md',heading='## Blue roof plane and red entrance join (5 October 2026)';
const note=`

${heading}

The owner's blue/yellow and red reference removes the small entrance-side
roof tongue and requires its angle to match the main pitch. The original
main roof plane now continues through both back coping runs; their steeper
slate ribbons and short height step are removed. The white coping and brick
closures meet that plane at its inner edge. The red projection return's
cornice top is level at y=13.69, closing its formerly dipped roof join.
Clipped slate corners repeated within 0.00001 model units are welded to
remove numerical slivers; other masonry and ground cuts retain their geometry.
See Research/west/roof-slope-repair-2026-10-05/README.md. This supersedes the
previous level/stepped and blended entrance boundary profiles.

Final validation is local, following the owner's later instruction. The
boundary regression passes 88 slope/bend contacts and 432 physical trim
samples; the saved former blue and red geometry independently fail it.
Inside-corner, west-refinement, west-roof-join, roof-contact and source/compiled
roof-tile checks pass. The inside-corner check retains its pane, masonry,
collision and walking probes, and the shared roof test retains 552 render
probes and all adjoining ridge/valley checks.

The NVIDIA GeForce RTX 3090 Ti / Direct3D11 renderer is verified through the
required hardware launcher. Source and compiled desktop, close, low, overhead
and phone views were inspected with no page/shader errors. Their 78 visible
surface checks match exactly. The locally rebuilt aerial manifest matches
the final source fingerprint, and its binary checksum is verified. Shared
browser sources and the local compiled aerial are updated; Unity, Blender
and packaged application exports are not regenerated. Evidence is under
Browser/artifacts/west-roof-slope-repair/.

The earlier broader npm test attempt stopped at the existing 23-versus-22
facade-course count assertion, which also fails with the saved former roof
sources. Its continuation was stopped when the owner requested local geometry
validation; it is not a completed estate-wide result.
`;
const old=await readFile(p,'utf8');if(!old.includes(heading)){if(await readFile(p,'utf8')!==old)throw Error('Development notes changed');await writeFile(p,old+note);}
const research='Research/west/roof-slope-repair-2026-10-05/README.md';let s=await readFile(research,'utf8');s=s.replace('Broader suite results are recorded in DEVELOPMENT.md.','Final validation is local, following the owner\'s later instruction. The broader\nsuite attempt was stopped; its partial history is recorded in DEVELOPMENT.md.');await writeFile(research,s);
await writeFile('Browser/artifacts/west-roof-slope-repair/focused-checks.json',JSON.stringify({scope:'Repaired west entrance roofs and immediate supporting geometry',checks:['test-hardware-browser.mjs','test-west-entrance-roof-boundary.mjs','test-front-inside-corners.mjs','test-west-refinement.mjs','test-west-roof-join.mjs','test-roof-contacts.mjs','test-roof-tiles.mjs','test-roof-tiles.mjs --compiled'].map(command=>({command,status:'passed'})),sourceCompiledVisibleProbes:78,sourceCompiledMaximumHeightDifference:0,broaderSuite:'Stopped at the owner request; not a completed estate-wide result'},null,2)+'\n');
