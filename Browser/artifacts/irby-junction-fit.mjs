import {readFileSync} from 'node:fs';
let script=readFileSync(new URL('fit-admin-pines.mjs',import.meta.url),'utf8');
// Fixed pre-edit road and gravel landmarks in the user's screenshot.
const ground=[[263.1,-60.580891719745225],[323.9520410774056,-62.51885481138235],[314.11824812865376,-72.45853888343501],[342.9583895780129,-70.74478450442365],[333.63,-84.91]];
script=script.replace(/const world=.*?;\r?\nconst pixels=.*?;\r?\nconst marks=.*?;/s,`const world=${JSON.stringify(ground.map(([x,z])=>[x,.34,z]))};
const pixels=[[239,170],[242,394],[302,362],[291,499],[382,449]];
const marks=[[343,182],[386,214],[436,244],[455,270],[441,317],[416,374],[396,433],[389,489],[201,430],[298,507],[378,446],[378,554],[404,580],[254,159],[235,240],[216,325],[195,388]];`);
script=script.replace('let p=[-110,200,165,-1.05,.52,1100,557,383]','let p=[430,140,-90,1.57,.75,1100,405.5,330.5]');
script=script.replace('Research/admin-pine-trees/placement-fit.json','Browser/artifacts/irby-junction-fit.json');
script=script.replace("'pine'+(i+1)","'mark'+(i+1)");
await import('data:text/javascript;base64,'+Buffer.from(script).toString('base64'));
