import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
const root=new URL('../../../',import.meta.url);
const research=new URL('Research/west/README.md',root),development=new URL('DEVELOPMENT.md',root);
const section='## Roof-step tiled-face correction (4 October 2026)\r\n\r\nThe latest [purple-circled roof-step correction](roof-masonry-2026-10-04/README.md)\r\nreplaces the steep slate closure at the tall cross-range/lower rear-arm join\r\nwith a vertical matching brick return and continuous white-render cornice.\r\n\r\n';
const bytes=await readFile(research);
if(!bytes.includes(Buffer.from('## Roof-step tiled-face correction'))){
 const index=bytes.indexOf(Buffer.from('## Garden window widths and placement'));
 if(index<0)throw Error('Research insertion point was not found');
 await writeFile(research,Buffer.concat([bytes.subarray(0,index),Buffer.from(section),bytes.subarray(index)]));
}
const note=`
## West court roof-step masonry (4 October 2026)

The owner's purple-circled tiled face was the almost vertical slate closure
between the tall cross range and lower rear arm. west-court-photo-detail.mjs
replaces it with a solid vertical return using the adjacent photo-brick
material. Three joined white-render cornice profiles continue around its top;
the two existing pitched roofs retain their geometry. See
Research/west/roof-masonry-2026-10-04/README.md and the original builder,
matching views and validation in Browser/artifacts/west-roof-masonry/.

The updated west regression rejects the original tiled face. West geometry,
shared exterior, roof contacts, inside corners and all 25 joined facade-course
checks pass. The rebuilt compiled aerial and Explore pages each pass 12 brick,
12 trim and eight retained-roof probes with no page or shader errors. Desktop
and phone views were visually reviewed. Browser sources and local generated
aerial assets are updated; Unity, Blender and packaged exports are not
regenerated.
`;
const old=await readFile(development);
if(!old.includes(Buffer.from('## West court roof-step masonry')))
 await writeFile(development,Buffer.concat([old,Buffer.from(note.replaceAll('\n','\r\n'))]));
await mkdir(new URL('Research/west/roof-masonry-2026-10-04/',root),{recursive:true});
await copyFile('C:/Users/Harry/AppData/Local/Temp/codex-clipboard-059efea0-0071-42bc-9a54-810ffd9669c1.png',new URL('Research/west/roof-masonry-2026-10-04/marked-reference.png',root));
