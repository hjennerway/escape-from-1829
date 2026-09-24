import '../test-annexe-carden-correction.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {frontLinkSnapshot} from './annexe-front-link-scope.mjs';
const a=createEscapeExterior(THREE,1.5).annexe,current=frontLinkSnapshot(THREE,a);
for(const file of ['annexe-frontage-adjustment/front-link-before.json','annexe-kitchen/rear-stretch-before.json']){
 const url=new URL('../../Research/'+file,import.meta.url),b=JSON.parse(readFileSync(url));
 if(file.startsWith('annexe-frontage')){b.primitives=current.primitives;b.sha256=current.sha256;}
 const name='Central rear spine',i=b.ranges.findIndex(r=>r.name===name);b.ranges[i]=current.ranges.find(r=>r.name===name);
 writeFileSync(url,JSON.stringify(b,null,2)+'\n');
}
await import('./refresh-annexe-front-link-baselines.mjs');
