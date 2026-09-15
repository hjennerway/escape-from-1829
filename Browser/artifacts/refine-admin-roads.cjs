const fs=require('node:fs');
const file='Browser/dist/historic-roads.mjs';let s=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
const replace=(a,b)=>{if(!s.includes(a))throw Error('Missing: '+a.slice(0,80));s=s.replace(a,b);};
replace('const nearGarden=bezier([102,84],[\n [[104,89],[110,92],[110,99]],[[110,108],[110,119],[110,125]],\n [[110,131],[106,136],[100,136]],', 'const nearGarden=bezier([102,84],[\n [[106,89],[119,93],[119,104]],[[119,113],[119,121],[116,126]],\n [[113,133],[106,136],[100,136]],');
replace(' [[101,94],[105,96],[105,101]],[[105,109],[105,118],[105,123]],\n [[105,128],[103,131],[98,131]],',' [[103,95],[114,96],[114,105]],[[114,113],[114,119],[111,124]],\n [[108,129],[103,131],[98,131]],');
replace('// Blue markings are route guides.',`// Main/admin photograph: camera looks across the near junction towards the
// annexe. The left-hand circuit encloses parking with a rounded near end and
// a grass strip along the avenue. Trees hide the far edge; retain the map fit.
export const ADMIN_ANNEXE_PHOTO_VIEW=Object.freeze({position:[244,11,37],target:[294,2,1],fov:58});
const parkingEdge=bezier([52,114],[
 [[69,114],[89,114],[103,114]],[[109,114],[112,116],[112,121]],
 [[110,127],[105,129],[98,129]],[[83,129],[65,129],[52,129]],
 [[52,124],[52,118],[52,114]]
]).map(p=>ap(...p));
const parkingMouth=[[110,119],[117,119],[117,125],[108,125]].map(p=>ap(...p));
const junction=bezier([249,39],[
 [[256,36],[262,30],frontWest],[[276,34],[269,47],[261,53]],
 [[256,57],[251,58],[245,55]],[[245,50],[247,44],[249,39]]
]);
// Only exposed boundaries receive kerbs: no kerb crosses a road mouth.
export const HISTORIC_KERBS=Object.freeze([
 {name:'Admin island kerb',points:ADMIN_TEARDROP},
 {name:'Annexe avenue lawn kerb',points:nearFrontLawn},
 {name:'Annexe parking-side kerb',points:bezier([50,131],[
  [[67,131],[83,131],[98,131]],[[104,131],[109,129],[112,125]]
 ]).map(p=>ap(...p))},
 {name:'Annexe junction inner kerb',points:bezier([114,119],[
  [[114,114],[114,109],[114,105]],[[114,96],[103,95],[99,90]],
  [[85,90],[65,90],[50,90]]
 ]).map(p=>ap(...p))},
 {name:'Annexe junction outer kerb',points:bezier([45,139],[
  [[64,139],[84,139],[100,139]],[[109,139],[116,135],[119,128]],
  [[123,121],[122,112],[122,104]],[[122,92],[109,86],[106,83]]
 ]).map(p=>ap(...p))}
]);
// Blue markings are route guides.`);
replace("revision:'Research/historic-roads/yellow-blue-aerial.png'", "revision:'Research/historic-roads/admin-to-annexe-photo.png',orientation:'Research/historic-roads/admin-to-annexe-orientation.png'");
replace("The later yellow/blue aerial relocates islands and extends the Historic roads.","The later yellow/blue aerial relocates islands and extends the Historic roads. The Main/admin-to-annexe photograph refines the curved junction, parking entrance and exposed kerbs; its blue arrow supplies viewing direction only.");
replace("{name:'Admin east black link',points:[[249,39],[262,31],frontWest,[266,43],[254,55],[245,55]]}","{name:'Admin east black link',points:junction}");
replace("const asphalt=material(0x17191a),paving=material(0x17191a),gravel=material(0xb4b3aa),grass=material(0x60784b),brown=material(0x87542f);","const asphalt=material(0x17191a),paving=material(0x17191a),gravel=material(0xb4b3aa),grass=material(0x60784b),brown=material(0x87542f),kerb=material(0xa8a79b);");
replace('[[gravel,1],[paving,2],[grass,3],[asphalt,4],[brown,5]]','[[gravel,1],[paving,2],[grass,3],[asphalt,4],[brown,5],[kerb,6]]');
replace("mat===grass?'grass':'provisional brown outline'","mat===grass?'grass':mat===kerb?'stone kerb':'provisional brown outline'");
replace("mat===asphalt?'black road':'provisional brown outline'","mat===asphalt?'black road':mat===kerb?'stone kerb':'provisional brown outline'");
replace(' for(const road of HISTORIC_ROADS)ribbon(road.name,road.points,road.width,asphalt,.34);',` polygon('Annexe inset parking surface',parkingEdge,asphalt,.325);
 polygon('Annexe parking entrance',parkingMouth,asphalt,.33);
 for(const road of HISTORIC_ROADS)ribbon(road.name,road.points,road.width,asphalt,.34);
 for(const edge of HISTORIC_KERBS)ribbon(edge.name,edge.points,.32,kerb,.38);`);
fs.writeFileSync(file,s);
const preview='Browser/dist/escape-preview.html';s=fs.readFileSync(preview,'utf8').replace(/\r\n/g,'\n');
replace("import {bindPlanterToggle}","import {ADMIN_ANNEXE_PHOTO_VIEW} from './historic-roads.mjs';\nimport {bindPlanterToggle}");
replace("photoDetail=[...Object.keys(UPTON_VIEWS)","photoDetail=['admin-annexe-photo',...Object.keys(UPTON_VIEWS)");
replace('const shot=UPTON_VIEWS[view]','const shot=(view===\'admin-annexe-photo\'?ADMIN_ANNEXE_PHOTO_VIEW:null)??UPTON_VIEWS[view]');
replace('<a href="?view=historic-admin-grounds">ADMIN GROUNDS</a>','<a href="?view=historic-admin-grounds">ADMIN GROUNDS</a> · <a href="?view=admin-annexe-photo">ANNEXE ROAD PHOTO</a>');
fs.writeFileSync(preview,s);

