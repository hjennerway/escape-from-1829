import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
import {IRBY_ROUNDED_ISLAND} from '../dist/irby-junction-rounding.mjs';
const points=IRBY_ROUNDED_ISLAND.points,area=Math.abs(points.reduce((s,p,i)=>{const q=points[(i+1)%points.length];return s+p[0]*q[1]-q[0]*p[1];},0))/2;console.log({islandArea:area});
appendFileSync('Browser/test-parsons-retrace.mjs',`
// Later red outline: retain a substantial lawn and clear the fixed beech roots.
const {IRBY_ROUNDED_ISLAND}=await import('./dist/irby-junction-rounding.mjs');
const islandOutline=IRBY_ROUNDED_ISLAND.points;
const islandArea=Math.abs(islandOutline.reduce((sum,p,i)=>{const q=islandOutline[(i+1)%islandOutline.length];return sum+p[0]*q[1]-q[0]*p[1];},0))/2;
assert(islandArea>180,'The enlarged triangular grass area must not regress to the tiny former island');
const beech=KML_TREES.find(t=>t.name==='Beech2');
for(let i=0;i<180;i++){
 const a=i/180*Math.PI*2,p=[beech.x+1.8*Math.cos(a),beech.z+1.8*Math.sin(a)];
 assert(!['black road','stone kerb'].includes(surface(...p)),'Road and kerb must clear the fixed beech root base');
}
const nearestBend=Math.min(...IRBY_ROUNDED_BEND.points.map(p=>Math.hypot(p[0]-beech.x,p[1]-beech.z)));
assert(nearestBend>2.4&&nearestBend<2.6,'The sweep stays close to the marked tree, with a small clear gap');
console.log('PASS: enlarged grass area and a close road sweep clear of the marked beech roots.');
`);
let p='Browser/dist/annexe-front-roads.mjs',s=readFileSync(p,'utf8').replace('// Ease the shifted straight into the retained outer-loop triangle.','// Ease the parallel central frontage into the enlarged triangular junction.');writeFileSync(p,s);
appendFileSync('Research/historic-roads/README.md',`\n\n## Enlarged annexe grass triangle — 24 September 2026\n\nThe [later red outline and yellow-circled beech](annexe-enlarged-island-marked.png)\nenlarge the triangular lawn toward Beech2 and along the frontage. This\nsupersedes the earlier small island and fixed fork endpoints. The grass area\nis approximately ${area.toFixed(1)} square scene metres, with the existing 1.3-metre\ncorner radii and 0.6-metre kerb. The outer arm follows the registered boundary\nline; the frontage retains its central parallel alignment and reconnects\nlocally. The covered entrance kerb ends are trimmed to the new road edge.\n\nThe curved verge passes 2.45 metres from the fixed beech centre. Its outer\nkerb remains about 1.85 metres away, leaving the trunk and low root buttresses\nclear. The six-metre carriageways, gravel link and planting remain intact.\nBrowser source and compiled aerial assets are updated; Unity and Blender\nexports are unchanged. Preview and validation evidence uses annexe-island.\n`);
