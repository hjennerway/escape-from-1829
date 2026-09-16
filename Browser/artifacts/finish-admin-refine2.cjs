const fs=require('node:fs');
let file='Browser/dist/main-admin-building.mjs',src=fs.readFileSync(file,'utf8');
function change(a,b){if(!src.includes(a))throw Error('Missing anchor: '+a.slice(0,100));src=src.replace(a,b);}
change("{name:'East projecting pavilion',rect:[208,39,217,54]", "{name:'East projecting pavilion',rect:[208,43,217,54]");
change("{name:'Rear flat court block',rect:[208,32.75,216.3333333333,35.25],height:6.9,roof:'flat'}",`{name:'Rear flat court block',rect:[208,32.75,216.3333333333,35.25],height:6.9,roof:'flat'},
  // The tall annexe-end mass steps down at the back, within the old footprint.
  {name:'East rear shoulder',rect:[208,39,217,43],height:11.7,rise:2.5}`);
change('rearProjection,rearStair,rearCourt]=','rearProjection,rearStair,rearCourt,eastShoulder]=');
change("    if(y>10)for(const x of [east.x-2.6,east.x+2.6])sash('east rear upper',x,y,east.z-east.d/2-.025,1.4,2.25,Math.PI);",'');
change("  sash('east step small sash'", "  sash('east shoulder light',eastShoulder.x+eastShoulder.w/2+.025,9.1,eastShoulder.z,1.4,1.7,Math.PI/2);\n  sash('east step small sash'");
// The photo's glazed entrance has full-height leaves below its upper lights.
change("  box(door,rearCourt.x-1.3,1.15,courtFace-.12,4.0,2.3,.10);",`  box(frame,rearCourt.x-1.3,1.15,courtFace-.12,4.0,2.3,.10);
  for(const dx of [-2.65,-1.3,.05])box(dark,rearCourt.x+dx,.65,courtFace-.2,1.15,.95,.08);`);
fs.writeFileSync(file,src);
file='Browser/dist/historic-roads.mjs';src=fs.readFileSync(file,'utf8');
change('[[255,23],[239,10],[233,1]],[[229,-5],[229,-10],[229,-19]],','[[255,23],[255,6],[241,0]],[[230,-5],[229,-10],[229,-19]],');
change(' // img4: the service court opens beside admin, then follows the east range.',` // The service lane skirts the square east rooms revealed in main_redfine2/img1,
 // returning to the established tower-side route north of the new extension.`);
fs.writeFileSync(file,src);
