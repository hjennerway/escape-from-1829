import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../../',import.meta.url),pkgURL=new URL('package.json',root),pkg=JSON.parse(await readFile(pkgURL));
for(const key of ['test','test:furniture'])if(!pkg.scripts[key].includes('node test-hall-furnishings.mjs'))pkg.scripts[key]=pkg.scripts[key].replace('node test-reception-furniture.mjs','node test-reception-furniture.mjs && node test-hall-furnishings.mjs');
if(!pkg.scripts['test:furniture'].includes('node test-hall-furnishings-browser.mjs'))pkg.scripts['test:furniture']+=' && node test-hall-furnishings-browser.mjs';
pkg.scripts['test:halls']='node test-hall-furnishings.mjs && node test-hall-furnishings-browser.mjs';
await writeFile(pkgURL,JSON.stringify(pkg,null,2)+'\n');
for(const file of ['test-asylum-furniture.mjs','test-asylum-furniture-browser.mjs']){const url=new URL(file,root);let source=await readFile(url,'utf8');source=source.replaceAll('twenty models','twenty-nine models').replaceAll('twenty furniture models','twenty-nine furniture models').replace('models:20,','models:29,');await writeFile(url,source);}
const drawURL=new URL('draw-furnishings.mjs',root);let draw=await readFile(drawURL,'utf8');draw=draw.replace('const colors={','const colors={sideboard:"#725a40",landscape:"#809385",visitingNotice:"#cfc6ab",linenCupboard:"#b0ac94",linenTrolley:"#a39f86",dutyBoard:"#cfc6ab",draughtsSet:"#574f3e",newspaperStand:"#aaa08b",sewingBasket:"#92754f",');await writeFile(drawURL,draw);
console.log('Added the hall checks and furnishing-plan colours.');
