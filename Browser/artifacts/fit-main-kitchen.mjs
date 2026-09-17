import {readFileSync} from 'node:fs';
let script=readFileSync('Browser/artifacts/fit-admin-pines.mjs','utf8');
const world=[
 [146.3,9.56,-36.3],[162.3,9.56,-36.3],[162.3,9.56,-16.6],[146.3,9.56,-16.6],
 [100.45,4.86,1.2],[136.48,4.86,1.2],
 [100.45,4.86,13],[136.48,4.86,13],
 [159.22,3.66,13]
];
const pixels=[[352,137],[428,142],[427,235],[348,230],[117,300],[295,311],[114,360],[295,371],[408,378]];
const marks=[[220,189],[380,198],[373,344],[211,335]];
script=script.replace(/const world=.*?;\r?\nconst pixels=.*?;\r?\nconst marks=.*?;/s,`const world=${JSON.stringify(world)};\nconst pixels=${JSON.stringify(pixels)};\nconst marks=${JSON.stringify(marks)};`);
script=script.replace('let p=[-110,200,165,-1.05,.52,1100,557,383]','let p=[142,170,58,-.06,1.3,900,306.5,257.5]');
script=script.replace('Research/admin-pine-trees/placement-fit.json','Browser/artifacts/main-kitchen-fit.json');
await import('data:text/javascript;base64,'+Buffer.from(script).toString('base64'));
