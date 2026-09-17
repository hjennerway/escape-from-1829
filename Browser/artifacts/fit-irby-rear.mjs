import {readFileSync} from 'node:fs';
let script=readFileSync('Browser/artifacts/fit-admin-pines.mjs','utf8');
const world=[
 [250.22,8.4,-98.42+24.6],[260.78,8.4,-98.42+24.6],
 [235.22,8.4,-98.42+24.6],[241.88,8.4,-98.42+24.6],
 [238.55,10.7,-98.42+24.6],
 [263.38,8.4,-137.68+24.6],[263.38,8.4,-124.02+24.6],
 [211.72,8.4,-69.12]
];
const pixels=[[127,438],[137,545],[117,302],[123,370],[118,326],[520,540],[383,554],[62,101]];
script=script.replace(/const world=.*?;\r?\nconst pixels=.*?;\r?\nconst marks=.*?;/s,`const world=${JSON.stringify(world)};\nconst pixels=${JSON.stringify(pixels)};\nconst marks=[];`);
script=script.replace('let p=[-110,200,165,-1.05,.52,1100,557,383]','let p=[290,160,-105,1.48,1.2,1400,404,312]');
script=script.replace('const step=solve(a,b)','a[6][6]+=1e18;a[7][7]+=1e18;const step=solve(a,b)');
script=script.replace('Research/admin-pine-trees/placement-fit.json','Browser/artifacts/irby-rear-camera.json');
await import('data:text/javascript;base64,'+Buffer.from(script).toString('base64'));
