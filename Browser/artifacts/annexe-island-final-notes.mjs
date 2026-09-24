import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
let p='Research/historic-roads/README.md',s=readFileSync(p,'utf8');const start=s.indexOf('## Enlarged annexe grass triangle — 24 September 2026');
const next=s.indexOf('\n## ',start+3);const replacement=`## Enlarged annexe grass triangle and straight frontage — 24 September 2026

The [red island outline](annexe-enlarged-island-marked.png) first enlarged the
small triangular lawn. The [later red/yellow/blue/purple correction](annexe-straight-frontage-marked.png)
then restores one straight frontage axis all the way to the outer road,
removing the angle change at the blue mark. It supersedes the intermediate
189.8-square-metre island and angled lower road arm.

The purple arm is now a separate six-metre curved road with normal 0.6-metre
borders. Removing the broad resurfacing beside it restores grass around
Beech2. Both the carriageway and kerbs clear a 1.8-metre circle around the
fixed tree base, including its low root buttresses. The closest fork verge
is about 2.75 metres from the tree centre; its approach remains clear too.

The final grass island is about 73 square scene metres, still substantially
larger than the former small island. Three rounded tips join its straight
frontage/outer-road edges and curved fork edge. The frontage entrance again
meets the straight road with its original circular kerbs. Buildings, planting
and the gravel link are retained. Browser source and compiled aerial assets
change; Unity and Blender exports do not. Evidence uses annexe-island.
`;
if(start>=0)s=s.slice(0,start)+replacement+(next>=0?s.slice(next):'');writeFileSync(p,s);
p='Browser/dist/historic-road-layout.mjs';s=readFileSync(p,'utf8').replace(" irbyRounding:'Research/historic-roads/irby-junction-rounding-marked.png',"," irbyRounding:'Research/historic-roads/irby-junction-rounding-marked.png',\n annexeStraightFrontage:'Research/historic-roads/annexe-straight-frontage-marked.png',");writeFileSync(p,s);
appendFileSync('Browser/test-parsons-retrace.mjs',`
// The purple fork retains a six-metre carriageway on both sides of its curve.
const purpleFork=HISTORIC_ROAD_TRACES.find(r=>r.name==='Parsons Lane southern fork');
assert.equal(purpleFork.width,6);
for(let i=4;i<purpleFork.points.length-4;i++){
 const p=purpleFork.points[i],a=purpleFork.points[i-1],b=purpleFork.points[i+1],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
 for(const side of [-1,1])assert.equal(surface(p[0]-dz/length*side*2.7,p[1]+dx/length*side*2.7),'black road','Both sides of the curved lane retain their full width');
}
console.log('PASS: straight frontage to the outer lane and full-width curved fork.');
`);
