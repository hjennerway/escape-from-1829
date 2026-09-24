import {readFileSync,writeFileSync} from 'node:fs';
const p='Browser/artifacts/rear-roads-preview.mjs';let s=readFileSync(p,'utf8');s=s.replace("console.log(await page.evaluate(()=>window.__rear.exterior.modelBuild));",`console.log(await page.evaluate(()=>{
 const {exterior:e}=window.__rear;
 const nodes=[];e.model.traverse(o=>{if(o.name.startsWith('Annexe rear network'))nodes.push(o);});
 if(!nodes.length)throw Error('Missing rear surfaces');
 for(const year of [1829,1849,1856,1860,1870,1896,1912,1915,1916,1938,2010,2016,2021]){
  e.timeline.setPeriod(year);
  for(const node of nodes){let visible=true;for(let o=node.parent;o;o=o.parent)visible&&=o.visible;
   if(visible!==[1915,1916,1938].includes(year))throw Error('Incorrect rear-road period '+year);}
 }
 e.timeline.setPeriod(1916);return {build:e.modelBuild,datedSurfaces:nodes.length,allPeriods:true};
}));`);writeFileSync(p,s);
