import {readFileSync,writeFileSync} from 'node:fs';
const edit=(p,fn)=>{const u=new URL(p,import.meta.url);writeFileSync(u,fn(readFileSync(u,'utf8')));};
edit('../dist/annexe.mjs',s=>"import {shortenAnnexeTowers} from './annexe-tower-height.mjs';\n"+s.replace(' return model;',' shortenAnnexeTowers(THREE,model,ranges,openings);\n return model;'));
edit('../dist/annexe-carden-detail.mjs',s=>{
 s="import {ANNEXE_TOWER_HEIGHT_SCALE} from './annexe-tower-height.mjs';\n"+s;
 s=s.replace('tower.x+dx,18.4,towerBack-.06,1.05,1.75,Math.PI','tower.x+dx,18.4*ANNEXE_TOWER_HEIGHT_SCALE,towerBack-.06,1.05,1.75*ANNEXE_TOWER_HEIGHT_SCALE,Math.PI');
 s=s.replace("wall(24.735,2.35,-24,8.87,4.7,12,'Carden conservatory low rear link brick walls');", "const rearLink={x:24.735,z:-27.25,w:8.87,d:18.5,h:4.7,rise:1.9};\n group.userData.conservatoryRearLink=rearLink;\n wall(rearLink.x,rearLink.h/2,rearLink.z,rearLink.w,rearLink.h,rearLink.d,'Carden conservatory low rear link brick walls');");
 s=s.replace("hip(24.735,-24,8.87,12,4.7,1.9,'Carden conservatory low rear link slate roof');", "hip(rearLink.x,rearLink.z,rearLink.w,rearLink.d,rearLink.h,rearLink.rise,'Carden conservatory low rear link slate roof');");
 s=s.replace("window('Carden low side sash',20.335,2.5,-31.3,1.4,3.0,Math.PI/2,{bars:false});", "window('Carden low rear sash',24.735,2.5,-36.535,1.4,3.0,Math.PI,{bars:false});");
 s=s.replace('eave:12.4,rise:3.2','eave:12.4*ANNEXE_TOWER_HEIGHT_SCALE,rise:3.2*ANNEXE_TOWER_HEIGHT_SCALE');
 s=s.replace("wing.x1+.035,9.2,z,1.35,3.4,Math.PI/2", "wing.x1+.035,9.2*ANNEXE_TOWER_HEIGHT_SCALE,z,1.35,3.4*ANNEXE_TOWER_HEIGHT_SCALE,Math.PI/2");
 return s;
});
