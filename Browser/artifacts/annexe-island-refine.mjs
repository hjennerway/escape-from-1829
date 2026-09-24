import {readFileSync,writeFileSync} from 'node:fs';
let p='Browser/dist/annexe-loop-road.mjs',s=readFileSync(p,'utf8').replace('const near=[329,-64];','const near=[320,-60];').replace('const joinX=(start[1]-near[1]+avenueSlope*near[0]-outerSlope*start[0])/(avenueSlope-outerSlope);','const joinX=362;');writeFileSync(p,s);
p='Browser/dist/annexe-front-roads.mjs';s=readFileSync(p,'utf8').replace('v-unit[i]*20','v-unit[i]*30');writeFileSync(p,s);
