import {readFileSync} from 'node:fs';
let script=readFileSync('Browser/artifacts/fit-admin-pines.mjs','utf8');
const world=[
 [190,6.96,-21.8],[209.5,6.96,-21.8],[190,6.96,2.1],[209.5,6.96,2.1],
 [199.75,12.04,-21.6],[189.8,7.44,-21.6],[209.7,7.44,-21.6],
 [190.2,13.74,-5.6],[173.6,13.74,-5.6],[169.6,6.54,2.3],
 [209.3,13.04,-3.65],[228.56,13.04,-3.65]
];
const pixels=[[544,344],[750,377],[456,552],[697,595],[641,320],[545,337],[751,374],
 [477,422],[285,389],[216,504],[715,489],[971,536]];
script=script.replace(/const world=.*?;\r?\nconst pixels=.*?;\r?\nconst marks=.*?;/s,`const world=${JSON.stringify(world)};\nconst pixels=${JSON.stringify(pixels)};\nconst marks=[];`);
script=script.replace('let p=[-110,200,165,-1.05,.52,1100,557,383]','let p=[210,70,55,.25,.8,1050,613,358]');
script=script.replace('const step=solve(a,b)','a[6][6]+=1e18;a[7][7]+=1e18;const step=solve(a,b)');
script=script.replace('Research/admin-pine-trees/placement-fit.json','Browser/artifacts/service-infill-camera.json');
await import('data:text/javascript;base64,'+Buffer.from(script).toString('base64'));
