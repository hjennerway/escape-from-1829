import {readFileSync} from 'node:fs';
import {annexePoint,ANNEXE_MAP_SCALE} from '../dist/annexe.mjs';
import {ANNEXE_ACCESS_PAVING} from '../dist/annexe-access.mjs';

// Fit the user's cropped aerial against the apron and courtyard roof corners.
const apron=ANNEXE_ACCESS_PAVING.find(p=>p.name==='Annexe central asphalt forecourt');
const ground=([x,z])=>[x,.34,z];
const roof=(x,z)=>annexePoint(x*ANNEXE_MAP_SCALE+(x===20?-.4:.4),8.4,z*ANNEXE_MAP_SCALE+(z===34?.4:-.4));
const world=[...apron.points.slice(0,3).map(ground),
 roof(20,34),roof(20,-4),roof(65,34)];
const pixels=[[665,75],[551,105],[647,207],
 [691,168],[878,106],[876,355]];
const marks=[[472,98],[514,134],[580,211],[623,255],[671,304],[712,351],[757,407]];
let script=readFileSync(new URL('./fit-admin-pines.mjs',import.meta.url),'utf8');
script=script.replace(/const world=.*?;\r?\nconst pixels=.*?;\r?\nconst marks=.*?;/s,
 `const world=${JSON.stringify(world)};\nconst pixels=${JSON.stringify(pixels)};\nconst marks=${JSON.stringify(marks)};`);
script=script.replace('let p=[-110,200,165,-1.05,.52,1100,557,383]',
 'let p=[140,200,-170,-1.9,.6,1100,556,408]');
script=script.replace('Research/admin-pine-trees/placement-fit.json','Research/annexe-road-trees/placement-fit.json');
script=script.replace("'pine'+(i+1)","'tree'+(i+1)");
await import('data:text/javascript;base64,'+Buffer.from(script).toString('base64'));
