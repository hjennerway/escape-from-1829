import {readFile,writeFile,mkdir} from 'node:fs/promises';
const dir='Research/west/roof-slope-repair-2026-10-05';await mkdir(dir,{recursive:true});
await writeFile(dir+'/README.md',`# Continuous entrance-side roof slopes

The owner's [blue/yellow and red marked reference](../../../Browser/artifacts/west-roof-slope-repair/marked-reference.png)
on 5 October 2026 requests removal of the small blue roof protrusion, matching
that area to the yellow roof angle, and repair of the red entrance return.
The annotation locates the geometry; it is modelling evidence.

The blue patch now retains the original main roof plane all the way to the
inner edge of the white coping. The raised height step and replacement slate
ribbons on the two back runs are removed. White coping and brick closures
follow the retained plane, rather than forcing a short extra roof pitch.
The exposed edge runs from approximately y=14.573 beside the pavilion to
y=14.297 at the canted return. These are fitted model coordinates, not surveyed
dimensions. This supersedes the level/short-stepped and later blended ribbon
profiles in the earlier entrance yellow-boundary correction.

The red return's upper cornice now shares the projecting frontage's y=13.69
eave instead of dipping to approximately y=13.493 at the bend. The roof return
and render use that same mitre. The mirrored east frontage retains its existing
sampled profile. Corners repeated within 0.00001 model units are welded only
on clipped slate, removing numerical sliver triangles and their texture errors.

Implementation is in Browser/dist/front-inside-corners.mjs,
Browser/dist/entrance-west-photo-detail.mjs and
Browser/dist/west-cross-range-roof.mjs. Main ridges, wall outlines, openings,
low flat decks and walking routes retain their definitions. Browser aerial,
Explore and gameplay share these sources; the local compiled aerial is rebuilt.
Unity, Blender and packaged application exports are not regenerated.

The dedicated boundary check passes 88 slope/bend contacts, 432 physical
slate/render probes and adjoining crown preservation. The saved former blue
and red geometry each independently fail the new checks. Inside-corner,
west-refinement, west-roof-join, roof-contact and source/compiled tile checks
pass. Both loading modes have 78 identical visible surface checks and no page
or shader errors; desktop, close, low, overhead and phone captures were inspected.
The required hardware launcher verifies NVIDIA GeForce RTX 3090 Ti through
Direct3D11. Model fingerprints, binary checksum, saved source inputs and
validation receipts are under Browser/artifacts/west-roof-slope-repair/.
Broader suite results are recorded in DEVELOPMENT.md.
`);
const p='Research/west/README.md',s=await readFile(p,'utf8'),heading='## Blue roof slope and red entrance return (5 October 2026)';
if(!s.includes(heading)){const offset=s.indexOf('\n')+1;const note=`\n${heading}\n\nThe latest [blue/yellow and red correction](roof-slope-repair-2026-10-05/README.md)\nretains the main roof plane through the back coping, removing the raised\nprotrusion and the steeper ribbon patches. The red entrance return shares\nthe projection's level eave. This supersedes the stepped/blended entrance\nboundary profiles; the ridges and building outlines remain.\n`;if(await readFile(p,'utf8')!==s)throw Error('Research index changed during update');await writeFile(p,s.slice(0,offset)+note+s.slice(offset));}
