const fs=require('node:fs');
const file='Browser/dist/tower-buildings.mjs';let src=fs.readFileSync(file,'utf8');
function replace(a,b){if(!src.includes(a))throw Error('Missing anchor: '+a.slice(0,100));src=src.replace(a,b);}
replace("{name:'South cross-gabled stores',rect:[196,-28.1,220.86,TOWER_SERVICE_FRONT],height:6.4,rise:3.9", "{name:'South cross-gabled stores',rect:[196,-28.1,220.86,TOWER_SERVICE_FRONT],height:9.0,rise:3.9");
replace("{name:'Long east service range',rect:[208.8,-57.2,220.86,-28.1],height:6.4,rise:3.5,axis:'z',roof:'hip'}", "{name:'Long east service range',rect:[208.8,-57.2,220.86,-28.1],height:9.0,rise:3.5,axis:'z',roof:'hip'}");
replace("sash(220.9,8.0,towardsAdmin(-22.35),1.3,2.1", "sash(220.9,10.55,towardsAdmin(-22.35),1.3,1.9");
replace("for(const z of [-30.4,-34.9,-39.4,-43.9,-48.4,-52.8])sash(220.89,4.2,towardsAdmin(z),1.3,2.4,Math.PI/2);",`// main_redfine2/img2: tall upper sashes above a mostly solid ground storey.
 for(const z of [-30.4,-34.9,-39.4,-43.9,-48.4,-52.8])sash(220.89,6.5,towardsAdmin(z),1.3,3.05,Math.PI/2,'Rear lane upper sash');
 for(const z of [-51.1,-42.2])sash(220.89,1.65,towardsAdmin(z),1.45,1.95,Math.PI/2,'Rear lane ground sash');
 door(220.9,1.6,towardsAdmin(-46.7),1.55,3.05,Math.PI/2,dark,'Rear lane recessed door');
 door(220.9,1.85,towardsAdmin(-27.05),1.55,3.5,Math.PI/2,frame,'Court end pale service door');
 // Shallow segmental brick heads sit above the lower openings.
 for(const [z,width,head] of [[-51.1,1.45,2.74],[-42.2,1.45,2.74],[-46.7,1.55,3.24]]){
  const triangles=[],radius=width/2+.12;
  for(let i=0;i<16;i++){
   const a=i*Math.PI/16,b=(i+1)*Math.PI/16;
   const p=(t,outer)=>[221.04,head+Math.sin(t)*(.3+(outer?.2:0)),towardsAdmin(z)+Math.cos(t)*(radius+(outer?.2:0))];
   triangles.push(p(a,false),p(b,true),p(b,false),p(a,false),p(a,true),p(b,true));
  }
  poly(triangles,red,'Rear lane segmental brick head');
 }
 const laneRange=TOWER_RANGES.find(r=>r.name==='Long east service range');
 const laneZ=(laneRange.rect[1]+laneRange.rect[3])/2;
 box(dark,220.98,9.04,laneZ,.17,.18,laneRange.rect[3]-laneRange.rect[1],'Rear lane eaves gutter');
 for(const z of [-32.1,-40.5,-54.9]){
  box(dark,221.02,4.5,towardsAdmin(z),.11,9,.11,'Rear lane downpipe');
  line([221.02,.22,towardsAdmin(z)],[221.3,.22,towardsAdmin(z)+.4],dark,.055,'Rear lane drain shoe');
 }`);
fs.writeFileSync(file,src);
const admin='Browser/dist/main-admin-building.mjs';src=fs.readFileSync(admin,'utf8');
src=src.replace('for(const y of h>5?','for(const y of h>12?');fs.writeFileSync(admin,src);
const test='Browser/test-main-admin.mjs';src=fs.readFileSync(test,'utf8');
src=src.replace("h.object.name.endsWith('slate roof')&&h.face.normal.y>0),'Each range needs upward-facing slate'", "h.object.name.endsWith(range.roof==='flat'?'flat roof':'slate roof')&&h.face.normal.y>0),'Each range needs its upward-facing roof'");
src=src.replace("filter(o=>o.face==='east low end').length,3", "filter(o=>o.face==='east low end').length,2");fs.writeFileSync(test,src);
const aerial='Browser/dist/aerial.html';src=fs.readFileSync(aerial,'utf8');
src=src.replace('<a style="color:inherit;margin-right:12px" href="?view=main-admin-plan">SITE PLAN</a>', '<a style="color:inherit;margin-right:12px" href="?view=main-admin-annexe-end">ANNEXE END</a><a style="color:inherit;margin-right:12px" href="?view=main-admin-rear-court">REAR COURT</a><a style="color:inherit;margin-right:12px" href="?view=main-admin-plan">SITE PLAN</a>');fs.writeFileSync(aerial,src);
