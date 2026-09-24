import {readFileSync,writeFileSync} from 'node:fs';
let p='Browser/test-parsons-retrace.mjs',s=readFileSync(p,'utf8').replace('[[314,-72]]','[[307,-72]]');writeFileSync(p,s);
p='Browser/test-annexe-access.mjs';s=readFileSync(p,'utf8');
s=s.replace('// The two curved lips have one continuous kerb, with clear lawn beyond it.',`// The enlarged island arm resurfaces the end of one original entrance lip.
const {ANNEXE_TRIANGLE_CORNERS}=await import('./dist/annexe-loop-road.mjs');
const [,islandFar,islandNear]=ANNEXE_TRIANGLE_CORNERS;
const islandDirection=islandFar.map((v,i)=>v-islandNear[i]),islandLength=Math.hypot(...islandDirection);
const islandDistance=p=>((p[0]-islandNear[0])*-islandDirection[1]+(p[1]-islandNear[1])*islandDirection[0])/islandLength;
// Retained circular lips have a single kerb; covered ends are open asphalt.`);
s=s.replace("assert.equal(at(centre[0]-side*r*Math.cos(angle),centre[1]+r*Math.sin(angle)),expected,'Single curved kerb and no straight-border sliver at '+side+'/'+degrees+'/'+offset);", "const p=world(centre[0]-side*r*Math.cos(angle),centre[1]+r*Math.sin(angle));\n  assert.equal(surface(...p),islandDistance(p)<3?'black road':expected,'Single curved kerb and open enlarged-island mouth at '+side+'/'+degrees+'/'+offset);");writeFileSync(p,s);
