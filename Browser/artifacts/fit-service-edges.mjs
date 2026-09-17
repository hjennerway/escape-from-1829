import {readFileSync} from 'node:fs';
let script=readFileSync('Browser/artifacts/fit-admin-pines.mjs','utf8');
const world=[
 [169.6,6.54,-22],[193.53,6.54,-22],
 [169.6,6.54,2.3],[193.53,6.54,2.3],
 [187.3,7.44,-39],[187.3,7.44,-21.6],
 [209.7,7.44,-21.6],[198.5,12.04,-21.6],
 [203.5,6.96,-13.3],[203.5,6.96,2.1]
];
const pixels=[[435,237],[658,345],[233,437],[475,560],[699,180],[593,312],[824,416],[705,325],[707,467],[591,623]];
script=script.replace(/const world=.*?;\r?\nconst pixels=.*?;\r?\nconst marks=.*?;/s,`const world=${JSON.stringify(world)};\nconst pixels=${JSON.stringify(pixels)};\nconst marks=[];`);
script=script.replace('let p=[-110,200,165,-1.05,.52,1100,557,383]','let p=[245,100,100,.55,.7,1500,692.5,424]');
script=script.replace('const step=solve(a,b)','a[6][6]+=1e18;a[7][7]+=1e18;const step=solve(a,b)');
script=script.replace('Research/admin-pine-trees/placement-fit.json','Browser/artifacts/service-edge-camera.json');
await import('data:text/javascript;base64,'+Buffer.from(script).toString('base64'));
