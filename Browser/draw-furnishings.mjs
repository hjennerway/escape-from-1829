import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {buildAsylumLayout} from './dist/asylum-layout.mjs';
import {furnishAsylum} from './dist/asylum-furniture.mjs';
const plan=JSON.parse(await readFile(new URL('./dist/asylum-plan.json',import.meta.url))),floors=buildAsylumLayout(plan).floors;
furnishAsylum(floors,{seed:1829});
const destination=new URL('../Research/room-furnishings/',import.meta.url);await mkdir(destination,{recursive:true});
const colors={sideboard:"#725a40",landscape:"#809385",visitingNotice:"#cfc6ab",linenCupboard:"#b0ac94",linenTrolley:"#a39f86",dutyBoard:"#cfc6ab",draughtsSet:"#574f3e",newspaperStand:"#aaa08b",sewingBasket:"#92754f",foldedLinen:"#c9c7b4",bed:'#89988b',chair:'#8d684f',bookcase:'#776853',cupboard:'#695039',table:'#af9169',bench:'#b39477',books:'#5e6d7b',hydroBath:'#b8c9bf',hydroShower:'#7faba2',operatingTable:'#89674f',electrotherapy:'#ba9f63',apothecary:'#9ba885',bloodletting:'#996652',ectMachine:'#7d8990',receptionDesk:'#98764f',waitingBench:'#72573b',longcaseClock:'#574231',keyCupboard:'#826b47',rulesNotice:'#d0c5a3',clerkSet:'#b4a57f'};
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
for(const floor of floors){
 if(process.argv[2]&&process.argv[2]!==['ground-floor','first-floor','basement','second-floor'][floor.id])continue;
 const points=floor.outline.loops.flat(),xs=points.map(p=>p[0]),zs=points.map(p=>p[1]),x=Math.min(...xs)-3,z=Math.min(...zs)-7,w=Math.max(...xs)-x+3,h=Math.max(...zs)-z+4;
 const items=floor.furniture.map(i=>`<rect x="${-i.width/2}" y="${-i.depth/2}" width="${i.width}" height="${i.depth}" fill="${colors[i.kind]}" stroke="#514b40" stroke-width=".08" ${i.variable?'stroke-dasharray=".22 .15"':''} transform="translate(${i.x} ${i.z}) rotate(${-i.rotation*180/Math.PI})"><title>${escape(i.kind)} · ${i.roomId}${i.variable?' · varies between games':''}</title></rect>`).join('');
 const rooms=[...floor.rooms,...floor.furnishingAreas].map(r=>`<g><text x="${r.label[0]}" y="${r.label[1]-.65}" text-anchor="middle" font-size=".95" font-weight="bold">${r.id}</text><text x="${r.label[0]}" y="${r.label[1]+.55}" text-anchor="middle" font-size=".68">${escape(r.name)}</text></g>`).join('');
 const walls=floor.walls.map(w=>`<path d="M ${w.a.join(' ')} L ${w.b.join(' ')}" fill="none" stroke="#494d47" stroke-width=".20"/>`).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="${Math.round(1400*h/w)}" viewBox="${x} ${z} ${w} ${h}"><rect x="${x}" y="${z}" width="${w}" height="${h}" fill="#f6f2e9"/><g font-family="Arial,sans-serif" fill="#353c34"><text x="${x+2}" y="${z+2.4}" font-size="2.1" font-weight="bold">${floor.name} · furnished room plan</text><text x="${x+2}" y="${z+4.3}" font-size=".95">Fictional room uses · fixed landmarks, dashed small items vary · reference seed 1829</text>${items}${walls}${rooms}</g></svg>`;
 await writeFile(new URL(['ground-floor.svg','first-floor.svg','basement.svg','second-floor.svg'][floor.id],destination),svg+'\n');
}
console.log('Wrote four labelled furnished floor plans.');
