import {ANNEXE_VIEWS,ANNEXE_MAP_SCALE} from './dist/annexe.mjs';
import {BUILDING_CATALOG} from './dist/building-catalog.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from './dist/vendor/three.module.js';
import {createEscapeExterior} from './dist/escape-exterior.mjs';
import {exteriorObstacles,obstacleContains} from './dist/explore-controls.mjs';
import {leightonProtected} from './artifacts/leighton-scope.mjs';
import {createAerialLayouts} from './dist/aerial-layouts.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){},strokeText(){},measureText(t){return {width:t.length*16}}})})};
const e=createEscapeExterior(THREE,1.5),a=e.annexe,g=a.userData.leightonNewton,before=JSON.parse(readFileSync(new URL('../Research/leighton-newton/protected-before.json',import.meta.url)));
assert.deepEqual(leightonProtected(THREE,e.model),before.geometry,'Every primitive outside Leighton/Newton remains unchanged');assert.deepEqual(a.userData.wards['leighton-newton'].userData.ranges,before.ranges,'Approved L placement and dimensions retained');
a.updateMatrixWorld(true);const obstacles=exteriorObstacles(THREE,e.model),ray=new THREE.Raycaster();
for(const o of g.userData.openings){const p=new THREE.Vector3(o.x,o.y,o.z),direction=new THREE.Vector3(Math.sin(o.r),0,Math.cos(o.r));p.addScaledVector(direction,.5);ray.set(g.localToWorld(p),direction.negate().transformDirection(g.matrixWorld));const hit=ray.intersectObject(a,true)[0];assert(hit?.object.isInstancedMesh,'Each photographed window remains exposed '+JSON.stringify(o));}
for(const o of g.children.filter(o=>o.userData.orientedCollision)){const p=o.getWorldPosition(new THREE.Vector3());assert(obstacles.some(b=>obstacleContains(b,p.x,p.z,0)),o.name+' has walking collisions');}
for(const name of ['leighton-newton-inner','leighton-newton-outer']){const v=ANNEXE_VIEWS[name];assert(!obstacles.some(o=>obstacleContains(o,v.position[0],v.position[2],.25)),name+' walking start is clear');}
for(const o of g.children.filter(o=>o.name.includes('cross gable slate roof'))){const n=o.geometry.attributes.normal;for(let i=0;i<n.count;i++)assert(n.getY(i)>0,'Cross gable roof faces upward');}
const walk=g.localToWorld(new THREE.Vector3(31.8*ANNEXE_MAP_SCALE,1.8,-36*ANNEXE_MAP_SCALE));assert(!obstacles.some(o=>obstacleContains(o,walk.x,walk.z,.25)),'Sheltered veranda walk remains clear');
assert.equal(BUILDING_CATALOG.find(b=>b.id==='leighton-newton').photos.length,2);
const canopy=g.getObjectByName('Leighton Newton veranda roof');for(let i=0;i<canopy.geometry.attributes.normal.count;i++)assert(canopy.geometry.attributes.normal.getY(i)>0,'Veranda roof faces up');
const layouts=createAerialLayouts(THREE,e);for(const shown of [false,true]){layouts.setVisible('historic',shown);let visible=true;for(let o=g;o;o=o.parent)visible&&=o.visible;assert.equal(visible,shown);}
console.log('PASS: photographed openings, canopy normals, collision, original L, Historic visibility and '+before.geometry.count+' protected estate primitives.');
