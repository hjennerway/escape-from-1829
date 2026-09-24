// Rebase historical whole-model snapshots only after the latest annotation's
// independent pre-edit preservation and behavioral tests pass.
import '../test-annexe-carden-correction.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {frontLinkSnapshot} from './annexe-front-link-scope.mjs';
const edit=(path,fn)=>{const url=new URL(path,import.meta.url);writeFileSync(url,fn(readFileSync(url,'utf8')));};
const a=createEscapeExterior(THREE,1.5).annexe,current=frontLinkSnapshot(THREE,a);
edit('../../Research/annexe-frontage-adjustment/front-link-before.json',s=>{
 const b=JSON.parse(s);b.primitives=current.primitives;b.sha256=current.sha256;
 for(const name of ['Central rear spine','Central rear low hall link']){const r=current.ranges.find(r=>r.name===name),i=b.ranges.findIndex(r=>r.name===name);if(i>=0)b.ranges[i]=r;else b.ranges.push(r);}
 return JSON.stringify(b,null,2)+'\n';
});
edit('../../Research/annexe-kitchen/rear-stretch-before.json',s=>{
 const b=JSON.parse(s);for(const name of ['Central rear spine','Central rear low hall link']){const r=current.ranges.find(r=>r.name===name),i=b.ranges.findIndex(r=>r.name===name);if(i>=0)b.ranges[i]=r;else b.ranges.push(r);}
 return JSON.stringify(b,null,2)+'\n';
});
edit('../test-annexe-carden.mjs',()=>"// The later marked correction supersedes the initial side interpretation.\nimport './test-annexe-carden-correction.mjs';\n");
edit('../test-annexe.mjs',s=>{
 s=s.replace(" assert(ray.intersectObject(annexe,true).some(h=>h.object.name===label+' canted bay slate roof'),'both side bays have exposed roofs');", " if(side<0)assert(ray.intersectObject(annexe,true).some(h=>h.object.name==='West canted bay slate roof'),'Unmarked west bay roof stays exposed');\n else assert(!annexe.getObjectByName('East canted bay slate roof'),'Marked east bay is removed');");
 const start=s.indexOf("assert.equal(leftSide.children.length,rightSide.children.length"),end=s.indexOf('const rear=annexe.userData.ranges',start);
 if(start>=0)s=s.slice(0,start)+"assert.equal(rightSide.children.length,leftSide.children.filter(o=>!/canted bay/.test(o.name)).length,'East bay is removed while every stair part remains');\nassert(!annexe.userData.annexeOpenings.some(o=>o.name==='East low canted bay'),'No glazing remains from removed east bay');\n"+s.slice(end);
 return s.replace('mirrored side bays/stairs','retained west bay and paired stairs');
});
edit('../test-oakmere-windows.mjs',s=>s.replace("assert.equal(reference.length,6,'Yellow-arrow face has six windows per floor')", "assert.equal(reference.length,3,'Shortened spine retains three evenly spaced columns per floor')").replace('six spine windows per floor','three shortened-spine windows per floor'));
edit('../artifacts/annexe-carden-preview.mjs',s=>s.replace("   ['overview',", "   ['annotation',[65,42,-65],[3,8,-14],46],\n   ['rear',[0,36,-64],[0,8,-8],48],\n   ['plan',[18,90,-20],[18,0,-19.99],45],\n   ['overview',"));
// This old fingerprint also included the explicitly removed east side bay.
const front=spawnSync(process.execPath,[new URL('./snapshot-annexe-front.mjs',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),'--save'],{encoding:'utf8',windowsHide:true});
process.stdout.write(front.stdout);if(front.status)throw Error(front.stderr);
await import('./refresh-annexe-front-link-baselines.mjs');
console.log('Rebased historical snapshots after independently verified Carden correction.');
