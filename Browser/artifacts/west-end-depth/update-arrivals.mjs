import {readFile,writeFile} from 'node:fs/promises';
import {WEST_RANGE_PLAN} from '../../dist/west-range-plan.mjs';
import {WEST_FRONT_E_PLAN} from '../../dist/west-front-photo-detail.mjs';
const files=['Browser/dist/asylum-plan.json','Research/1829-interior-proposal/plan-data.json'];
for(const file of files){
 const source=await readFile(file,'utf8'),plan=JSON.parse(source);
 for(const exit of plan.exits){
  if(exit.id==='D3')exit.levels[0].destination[2]=WEST_RANGE_PLAN.gardenZ+1.15;
  if(exit.id==='D5')exit.levels[0].destination[2]=WEST_RANGE_PLAN.courtZ-1.15;
  if(exit.id==='D6')exit.levels[0].destination[2]=WEST_RANGE_PLAN.courtZ-1.75;
  if(exit.id==='F4')exit.levels[0].destination[2]=WEST_FRONT_E_PLAN.bayRoot+.6;
 }
 await writeFile(file,JSON.stringify(plan)+'\n');
}
