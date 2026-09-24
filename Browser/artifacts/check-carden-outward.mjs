import {readFileSync,writeFileSync} from 'node:fs';
const edit=(p,fn)=>{const u=new URL(p,import.meta.url);writeFileSync(u,fn(readFileSync(u,'utf8')));};
edit('../dist/annexe-carden-detail.mjs',s=>s.replace('if(i>=4)continue; // These two edges meet the brick side range.','if(i===5)continue; // Only the rear edge now meets the new gabled range.'));
edit('../test-annexe-carden-correction.mjs',s=>s.replace('correction-protected-geometry.json','outward-protected-geometry.json').replace('points[i][0]-oldBay[i][0]+8.7','points[i][0]-oldBay[i][0]-.17').replace('[[37,-11],[35,-15],[31,-29.5],[25,-31.5]]','[[42,-11],[42,-15],[40,-29.5],[25,-31.5]]').replace('[[26,-24],[30,-24],[27,-12],[15,-31]]','[[35,-24],[39,-24],[27,-12],[15,-31]]').replace('[[37,-11],[31,-29.5],[25,-31.5]]','[[42,-11],[42,-29.5],[25,-31.5]]').replace('new THREE.Vector3(37,1.8,-24)','new THREE.Vector3(46,1.8,-24)').replace(".x>31.3,'Walking stops", ".x>40.17,'Walking stops").replace("const obstacles=exteriorObstacles",`const spine=a.userData.ranges.find(b=>b.name==='Central rear spine');
assert.equal(spine.h,4.7);assert.equal(spine.h+spine.rise,6.6,'Yellow roof matches the low adjoining roofs');
const lowered=a.userData.oakmereElevation.getObjectByName('Oakmere raised spine slate roof');
const loweredBounds=new THREE.Box3().setFromObject(lowered);
assert(Math.abs(loweredBounds.max.y-6.6*a.scale.y)<1e-5,'No old high roof remains');
const wing=d.userData.towerRange,wingWindows=d.userData.openings.filter(o=>o.name==='Carden tower range sash');
assert.equal(wingWindows.length,3);assert.equal(wing.x1,points[0][0],'Conservatory rear edge meets the gabled range');
assert.equal(wing.z0,points[0][1]);assert.equal(wing.z1,towerHost.z-towerHost.d/2,'New gabled range joins the tower');
assert(wingWindows.every(o=>o.z>points[4][1]&&o.y-o.h/2>4.7),'All three sashes face the open side above the low link');
for(const z of [-19,-24,-29]){ray.set(a.localToWorld(new THREE.Vector3(29.17,30,z)),new THREE.Vector3(0,-1,0));assert(ray.intersectObject(d,true).some(h=>/roof/.test(h.object.name)),'Joined roofs have no open seam');}
const obstacles=exteriorObstacles`));
edit('../test-oakmere-windows.mjs',s=>s.replace('[[3,2.15],[9.2,6.5]]','[[2.5,2.15]]').replace('three shortened-spine windows per floor','three low-spine windows'));
