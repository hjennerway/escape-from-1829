import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){const result=next(url,context);if(!url.includes('/dist/'))return result;let s=String(result.source);
if(url.endsWith('/annexe.mjs'))s=s.replace("solid(lead,0,bellY+.25,bellZ,2.3,2.5,2.3,'Bell tower base');","solid(lead,0,bellY+.75,bellZ,2.3,1.5,2.3,'Bell tower base');").replace('top=b.h+b.rise*.65+2.55,base=b.h-.1','base=b.h+b.rise*.65,top=base+2.55');
if(url.endsWith('/churton-ward.mjs'))s=s.replace("solid(brick,x,y+.4,z,w,3,.85,'Churton chimney shaft');","solid(brick,x,y+.65,z,w,2.5,.85,'Churton chimney shaft');");
if(url.endsWith('/redesmere-photo-detail.mjs'))s=s.replace('new THREE.BoxGeometry(.95,h+.45,w),1.7),brick,x,base+h/2-.225,z','new THREE.BoxGeometry(.95,h,w),1.7),brick,x,base+h/2,z').replace("mesh(worldUV(new THREE.BoxGeometry(1.2,.55,2),1.7),slate,89.2,12.35,z,true).name='Redesmere roof ventilator base';",'box(slate,89.2,12.35,z,1.2,.55,2);');
if(url.endsWith('/main-admin-building.mjs'))s=s.replaceAll('east.x+east.w/2-1.45','east.x+east.w/2-1.05').replace('(top+13.4)/2,z,w,top-13.4','(top+14.1)/2,z,w,top-14.1');
if(url.endsWith('/grafton-veranda.mjs'))s=s.replace("mesh(worldUV(new THREE.BoxGeometry(2.4,1.1,1.7),1.7),darkWood,vx,11.45,vz,'Grafton roof ventilator base');",'box(darkWood,vx,11.45,vz,2.4,1.1,1.7);');
if(url.endsWith('/water-tower.mjs'))s=s.replace("mesh(new THREE.CylinderGeometry(.09,.17,.8,8),dark,0,38.45,0,tower,'Water tower roof finial');",'mesh(new THREE.CylinderGeometry(.09,.17,.6,8),dark,0,38.55,0);');
return {...result,source:s};}});
