import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const before=process.argv.includes('before');
if(before)registerHooks({load(url,context,next){
 const path=new URL('building-base-before/'+url.split('/').at(-1),import.meta.url);
 return url.includes('/dist/')&&existsSync(path)?{format:'module',source:readFileSync(path,'utf8'),shortCircuit:true}:next(url,context);
}});
const THREE=await import('../dist/vendor/three.module.js');
const {createEscapeExterior}=await import('../dist/escape-exterior.mjs');
const {meetPlinth,groundBuildingBases}=await import('../dist/building-grounding.mjs');
const {jarmanProtected}=await import('./jarman-scope.mjs');
const {leightonProtected}=await import('./leighton-scope.mjs');
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const e=createEscapeExterior(THREE,1.6);e.model.updateMatrixWorld(true);
const fingerprints=()=>({jarman:jarmanProtected(THREE,e.model),leighton:leightonProtected(THREE,e.model)});
const jPath=new URL('../../Research/jarman/protected-geometry.json',import.meta.url),lPath=new URL('../../Research/leighton-newton/protected-before.json',import.meta.url);
const saved={jarman:JSON.parse(readFileSync(jPath)),leighton:JSON.parse(readFileSync(lPath)).geometry};
const output=new URL('building-base-scope-before.json',import.meta.url);
if(before){
 const previous=JSON.parse(readFileSync(output));
 assert.deepEqual(saved,previous.expected,'Current baseline is the previously verified intermediate repair');
 const original=fingerprints();assert.deepEqual(original,previous.original,'Original sources still reproduce the verified pre-repair baselines');
 const walls=[];
 for(const group of [e.estatesDepartment,e.farndonWard,e.witbyWard,e.irbyAshley,e.graftonEdge,e.haleWard,e.uptonFrithOscroft])group.traverse(o=>{
  if(!o.isMesh||!o.userData.collisionFootprint)return;
  const name=o.name;
  const selected=group===e.estatesDepartment?group.userData.ranges.some(r=>r.name===name):
   [e.farndonWard,e.witbyWard].includes(group)?['Single-storey ward walls','Small rear room','Narrow rear link','Low west side room','Projecting central garden bay'].includes(name):
   /^(Yellow-refined .* walls|Hale ward two-storey walls|Symmetric OS-derived two-storey walls|Canted garden bay)$/.test(name);
  if(selected){meetPlinth(o,group===e.estatesDepartment?.28:[e.farndonWard,e.witbyWard].includes(group)?.3:.38);walls.push(group.name+' / '+name);}
 });
 const low=e.annexe.getObjectByName('Carden stepped low side range brick walls');
 const footprint=[[8.1,-8.1],[20.3,-8.1],[20.3,-32.75],[8.1,-32.75]];
 const shape=new THREE.Shape();footprint.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
 const g=new THREE.ExtrudeGeometry(shape,{depth:4.7,bevelEnabled:false});g.rotateX(-Math.PI/2);
 const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
 for(let i=0;i<p.count;i++)uv.setXY(i,(Math.abs(n.getX(i))>.5?p.getZ(i):p.getX(i))/1.7,(Math.abs(n.getY(i))>.5?p.getZ(i):p.getY(i))/1.7);
 low.geometry=g;low.userData.collisionFootprint=footprint;
 const expected=fingerprints();
 const changes=groundBuildingBases(THREE,e.model,{groundY:e.terrain.position.y,exclude:[e.trees,e.terrain]});
 const result={original,previous:saved,expected,walls,changes,ranges:e.annexe.userData.wards['leighton-newton'].userData.ranges};
 writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log('PASS: saved baselines reproduced; expected wall cuts and '+changes.length+' ground extensions recorded.');
}else{
 const expected=JSON.parse(readFileSync(output));assert.deepEqual(saved,expected.previous);
 const actual=fingerprints();assert.deepEqual(actual,expected.expected,'The authored scene is exactly the reviewed wall cuts and Carden overlap removal');
 const l=JSON.parse(readFileSync(lPath));assert.deepEqual(e.annexe.userData.wards['leighton-newton'].userData.ranges,expected.ranges);assert.deepEqual(l.ranges,expected.ranges);
 assert.equal(actual.jarman.primitives,saved.jarman.primitives);assert.equal(actual.leighton.count,saved.leighton.count);
 if(process.argv.includes('--write')){writeFileSync(jPath,JSON.stringify(actual.jarman,null,2)+'\n');writeFileSync(lPath,JSON.stringify({...l,geometry:actual.leighton},null,2)+'\n');}
 console.log('PASS: complete protected scene matches only the reviewed repairs; primitive counts and original ward ranges retained.');
}
