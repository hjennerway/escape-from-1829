import {readFileSync} from 'node:fs';
let script=readFileSync('Browser/artifacts/fit-admin-pines.mjs','utf8');
const world=[
 [190,6.96,-13.3],[203.5,6.96,-13.3],[190,6.96,2.1],[203.5,6.96,2.1],
 [189.8,7.44,-21.6],[199.75,12.04,-21.6],[209.7,7.44,-21.6],
 [190.2,13.74,-5.6],[173.6,13.74,-5.6]
];
const pixels=[[446,358],[600,405],[338,486],[511,553],[494,288],[599,277],[711,352],
 [391,345],[206,286]];
script=script.replace(/const world=.*?;\r?\nconst pixels=.*?;\r?\nconst marks=.*?;/s,`const world=${JSON.stringify(world)};\nconst pixels=${JSON.stringify(pixels)};\nconst marks=[];`);
script=script.replace('let p=[-110,200,165,-1.05,.52,1100,557,383]','let p=[230,77,50,.4,.8,1100,551.5,337]');
script=script.replace('const step=solve(a,b)','a[6][6]+=1e18;a[7][7]+=1e18;const step=solve(a,b)');
script=script.replace('Research/admin-pine-trees/placement-fit.json','Browser/artifacts/service-link-camera.json');
await import('data:text/javascript;base64,'+Buffer.from(script).toString('base64'));
