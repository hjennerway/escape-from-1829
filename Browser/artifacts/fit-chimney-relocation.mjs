import {readFileSync} from 'node:fs';
// Correspondences read from the user's 1304 x 642 marked screenshot.
const world=[
 [177.5,0,-35.5],[177.5,50.765,-35.5],
 [168.5,11.615,-18.9],[181.4,11.615,-18.9],
 [162.3,9,-16.6],[162.3,9,-40.5],[146.3,9,-40.5]
];
const pixels=[[803,471],[883,149],[738,539],[865,557],[674,558],[680,381],[539,371]];
let script=readFileSync('Browser/artifacts/fit-admin-pines.mjs','utf8');
script=script.replace(/const world=.*?;\r?\nconst pixels=.*?;\r?\nconst marks=.*?;/s,
 `const world=${JSON.stringify(world)};\nconst pixels=${JSON.stringify(pixels)};\nconst marks=[[718,447]];`);
script=script.replace('let p=[-110,200,165,-1.05,.52,1100,557,383]','let p=[175,95,45,.1,.85,950,652,321]');
script=script.replace('const step=solve(a,b)','a[6][6]+=1e18;a[7][7]+=1e18;const step=solve(a,b)');
script=script.replace('Research/admin-pine-trees/placement-fit.json','Browser/artifacts/chimney-relocation-camera.json');
await import('data:text/javascript;base64,'+Buffer.from(script).toString('base64'));
