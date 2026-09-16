const fs=require('node:fs');
const file='Browser/dist/main-admin-building.mjs';
let src=fs.readFileSync(file,'utf8');
function replace(a,b){if(!src.includes(a))throw Error('Missing anchor: '+a.slice(0,100));src=src.replace(a,b);}
replace("  'main-admin-corridor':",`  // main_redfine2 location arrows: annexe end and rear service lane.
  'main-admin-annexe-end':{position:[279,2.3,42],target:[238,9.8,25],fov:49},
  'main-admin-rear-court':{position:[239,2.4,-49],target:[212,9,18],fov:57},
  'main-admin-corridor':`);
replace("{name:'Low east side room',rect:[220,41,227,48.5],height:4.8,rise:2.0}","{name:'Low east side room',rect:[220,41,227,48.5],height:7.1,rise:2.5,cant:'east'}");
replace("{name:'Recessed low east connection',rect:[217,41,220,46.5],height:4.2,rise:.7}",`{name:'Recessed low east connection',rect:[217,41,220,46.5],height:5.5,rise:.8},
  // Img1: a lower square return and raised rear room behind the canted bay.
  {name:'East stepped rear link',rect:[220,37,227,41],height:5.9,roof:'flat'},
  {name:'East square rear room',rect:[220,33.7,227,37],height:7.2,roof:'flat'},
  // Img2: upper projection, hipped stair bay and flat court block.
  {name:'Rear projecting window range',rect:[200,35.75,209.3333333333,40],height:14.1,rise:3.5},
  {name:'Rear canted stair bay',rect:[211,35.25,216.3333333333,39],height:10.5,rise:2.5,cant:'north',cut:1.2},
  {name:'Rear flat court block',rect:[208,32.75,216.3333333333,35.25],height:6.9,roof:'flat'}`);
// Retire the duplicated, unreachable old east-room branch.
const branch=src.indexOf("    if(spec.name==='Low east side room'){");
const duplicate=src.indexOf("    if(spec.name==='Low east side room'){",branch+1);
const branchEnd=src.indexOf('    solid(brick,x,h/2,z,w,h,d,spec.name',duplicate);
if(branch<0||duplicate<0||branchEnd<0)throw Error('Missing old canted room branches');
src=src.slice(0,duplicate)+src.slice(branchEnd);
replace("if(spec.name==='Low east side room'){","if(spec.cant){");
replace("const cut=2.1,outline=[[-w/2,-d/2],[w/2-cut,-d/2],[w/2,-d/2+cut],[w/2,d/2-cut],[w/2-cut,d/2],[-w/2,d/2]];",`const cut=spec.cut??2.1,outline=spec.cant==='north'
        ?[[-w/2,-d/2+cut],[-w/2+cut,-d/2],[w/2-cut,-d/2],[w/2,-d/2+cut],[w/2,d/2],[-w/2,d/2]]
        :[[-w/2,-d/2],[w/2-cut,-d/2],[w/2,-d/2+cut],[w/2,d/2-cut],[w/2-cut,d/2],[-w/2,d/2]];`);
replace('    for(const y of h>5?',`    if(spec.roof==='flat'){
      solid(dark,x,h+.07,z,w,.14,d,spec.name+' flat roof');
      for(const edgeZ of [z-d/2,z+d/2]){
        solid(brick,x,h+.3,edgeZ,w,.6,.24,spec.name+' brick parapet');
        solid(stone,x,h+.62,edgeZ,w+.18,.13,.4,spec.name+' coping');
      }
      for(const edgeX of [x-w/2,x+w/2]){
        solid(brick,edgeX,h+.3,z,.24,.6,d,spec.name+' brick parapet');
        solid(stone,edgeX,h+.62,z,.4,.13,d+.18,spec.name+' coping');
      }
      solid(red,x,h-.32,z,w+.12,.22,d+.12,spec.name+' parapet string');
      ranges.push({...spec,x,z,w,d});return {x,z,w,d,h};
    }
    for(const y of h>5?`);
replace('const [core,west,east,low,lowLink,eastLow,eastLink]=','const [core,west,east,low,lowLink,eastLow,eastLink,eastStep,eastRear,rearProjection,rearStair,rearCourt]=');
replace('// The east wall now follows chimney/img1.jpg; rear schedules remain inferred.','// main_redfine2 reveals the rear projections, replacing the hidden window grid.');
replace("for(const x of [-20,-13,-6,1,8,15])sash('rear inferred'","for(const x of [-20,-13,-6,1])sash('rear retained'");
replace("for(const x of [east.x-2.6,east.x+2.6])sash('east rear inferred',x,y,east.z-east.d/2-.025,1.4,h,Math.PI);","if(y>10)for(const x of [east.x-2.6,east.x+2.6])sash('east rear upper',x,y,east.z-east.d/2-.025,1.4,2.25,Math.PI);");
const start=src.indexOf('  // East low room:'),end=src.indexOf('  // Shallow external flue',start);
if(start<0||end<0)throw Error('Missing east windows block');
src=src.slice(0,start)+`  // Img1: paired end lights, canted cheeks and a tall exposed brick base.
  for(const dz of [-1.7,1.7])sash('east low end',eastLow.x+eastLow.w/2+.025,4.65,eastLow.z+dz,1.65,3.45,Math.PI/2);
  for(const side of [-1,1])sash('east low chamfer',eastLow.x+eastLow.w/2-1.05+.025,4.65,eastLow.z+side*(eastLow.d/2-1.05+.025),1.25,3.45,side===1?Math.PI/4:3*Math.PI/4);
  for(const dx of [-2.7,2.2])sash('east low south',eastLow.x+dx,4.65,eastLow.z+eastLow.d/2+.025,1.35,3.45);
  sash('east recessed connection',eastLink.x,3.0,eastLink.z+eastLink.d/2+.025,1.4,3.3);
  sash('east step small sash',eastStep.x+eastStep.w/2+.025,3.15,eastStep.z,1.45,1.75,Math.PI/2);
  sash('east rear room sash',eastRear.x+eastRear.w/2+.025,4.5,eastRear.z,1.65,2.85,Math.PI/2);
  sash('east rear basement light',eastRear.x+eastRear.w/2+.025,.9,eastRear.z,1.6,.75,Math.PI/2);
  for(const dx of [-2.5,2.5])sash('east square rear face',eastRear.x+dx,4.5,eastRear.z-eastRear.d/2-.025,1.4,2.85,Math.PI);
  const eastCourse=[[-eastLow.w/2,-eastLow.d/2],[eastLow.w/2-2.1,-eastLow.d/2],[eastLow.w/2,-eastLow.d/2+2.1],[eastLow.w/2,eastLow.d/2-2.1],[eastLow.w/2-2.1,eastLow.d/2],[-eastLow.w/2,eastLow.d/2]];
  prism(stone,eastLow.x,2.6,eastLow.z,eastCourse.map(([x,z])=>[x*1.012,z*1.012]),.13,'East bay raised sill course');
  for(const room of [eastStep,eastRear])box(stone,room.x+room.w/2+.06,2.6,room.z,.14,.13,room.d);
  for(const z of [eastLow.z-eastLow.d/2+2.25,eastLow.z+eastLow.d/2-2.25])box(dark,eastLow.x+eastLow.w/2+.1,3.5,z,.085,7,.085);
  // Img2 puts the close upper group on a projecting rear face.
  for(const dx of [-2.1,0,2.1])sash('rear grouped upper',rearProjection.x+dx,11.65,rearProjection.z-rearProjection.d/2-.025,1.45,2.75,Math.PI);
  for(const dx of [-3.7,0,3.7])for(const y of [2.3,7.05])sash('rear projection sash',rearProjection.x+dx,y,rearProjection.z-rearProjection.d/2-.025,1.35,2.85,Math.PI);
  for(const dx of [-1.5,1.5])sash('rear stair upper',rearStair.x+dx,8.85,rearStair.z-rearStair.d/2-.025,1.2,2.45,Math.PI);
  sash('rear stair east upper',rearStair.x+rearStair.w/2+.025,8.85,rearStair.z+.2,1.15,2.45,Math.PI/2);
  for(const dx of [-3.4,3.4])sash('rear court upper',rearCourt.x+dx,4.65,rearCourt.z-rearCourt.d/2-.025,1.85,2.65,Math.PI);
  const courtFace=rearCourt.z-rearCourt.d/2-.04;
  box(dark,rearCourt.x-1.3,1.25,courtFace-.04,4.3,2.5,.12);
  box(door,rearCourt.x-1.3,1.15,courtFace-.12,4.0,2.3,.10);
  for(const dx of [-2.65,-1.3,.05])sash('rear court door glazing',rearCourt.x+dx,1.72,courtFace-.18,1.1,1.0,Math.PI);
  box(pale,rearCourt.x+3.45,.72,courtFace-.12,1.85,1.3,.18);
  for(const x of [rearCourt.x-rearCourt.w/2+.2,rearCourt.x+rearCourt.w/2-.2])box(dark,x,3.45,courtFace-.12,.1,6.9,.1);
`+src.slice(end);
replace("East side and low wing follow chimney/img1.jpg; rear details inferred.","main_redfine2/img1 refines the raised east bay and square stepped returns; img2 supplies the grouped rear projection, hipped stair bay and flat court block. Concealed joins and dimensions are estimates. See Research/main-refine2/README.md.");
fs.writeFileSync(file,src);
