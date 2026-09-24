import '../test-annexe-carden-height.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {frontLinkSnapshot} from './annexe-front-link-scope.mjs';
import {cardenCorrectionSnapshot} from './annexe-carden-correction-scope.mjs';
const a=createEscapeExterior(THREE,1.5).annexe,current=frontLinkSnapshot(THREE,a);
const edit=(p,fn)=>{const u=new URL(p,import.meta.url);writeFileSync(u,fn(readFileSync(u,'utf8')));};
writeFileSync(new URL('../../Research/carden-picton/outward-protected-geometry.json',import.meta.url),JSON.stringify(cardenCorrectionSnapshot(THREE,a,{excludeConcurrentJarman:true}),null,2)+'\n');
edit('../test-annexe-carden-correction.mjs',s=>s.replace('o.y-o.h/2>17','o.y-o.h/2>17*.85').replace('[[42,-11],[42,-15],[40,-29.5],[25,-31.5]]','[[42,-11],[42,-15],[40,-29.5],[30,-34]]').replace('[[35,-24],[39,-24],[27,-12],[15,-31]]','[[35,-24],[39,-24],[27,-12],[15,-31],[25,-34]]').replace('[[42,-11],[42,-29.5],[25,-31.5]]','[[42,-11],[42,-29.5],[30,-34]]'));
edit('../test-annexe-carden.mjs',s=>s.includes('test-annexe-carden-height')?s:s+"import './test-annexe-carden-height.mjs';\n");
for(const file of ['annexe-frontage-adjustment/front-link-before.json','annexe-kitchen/rear-stretch-before.json']){
 const url=new URL('../../Research/'+file,import.meta.url),b=JSON.parse(readFileSync(url));
 if(file.startsWith('annexe-frontage')){b.primitives=current.primitives;b.sha256=current.sha256;}
 for(const name of ['East square tower','West square tower']){const i=b.ranges.findIndex(r=>r.name===name);b.ranges[i]=current.ranges.find(r=>r.name===name);}
 writeFileSync(url,JSON.stringify(b,null,2)+'\n');
}
const result=spawnSync(process.execPath,['Browser/artifacts/snapshot-annexe-front.mjs','--save'],{encoding:'utf8',windowsHide:true});process.stdout.write(result.stdout);if(result.status)throw Error(result.stderr);
await import('./refresh-annexe-front-link-baselines.mjs');
