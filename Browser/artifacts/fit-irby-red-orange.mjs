import {readFileSync} from 'node:fs';
let script=readFileSync('Browser/artifacts/fit-admin-pines.mjs','utf8');
const world=[
 [211.72,8.4,-69.12],[221.88,8.4,-69.12],[221.7,0,-69.3],
 [235.22,8.4,-73.82],[241.88,8.4,-73.82],[241.7,0,-74],
 [219.38,8.4,-100.38],[263.38,8.4,-106.08]
];
const pixels=[[104,54],[108,122],[117,194],[170,223],[175,278],[183,351],[454,80],[664,463]];
script=script.replace(/const world=.*?;\r?\nconst pixels=.*?;\r?\nconst marks=.*?;/s,`const world=${JSON.stringify(world)};\nconst pixels=${JSON.stringify(pixels)};\nconst marks=[];`);
script=script.replace('let p=[-110,200,165,-1.05,.52,1100,557,383]','let p=[340,120,-95,1.48,.72,1400,454,319.5]');
script=script.replace('const step=solve(a,b)','a[6][6]+=1e18;a[7][7]+=1e18;const step=solve(a,b)');
script=script.replace('Research/admin-pine-trees/placement-fit.json','Browser/artifacts/irby-red-orange-camera.json');
await import('data:text/javascript;base64,'+Buffer.from(script).toString('base64'));
