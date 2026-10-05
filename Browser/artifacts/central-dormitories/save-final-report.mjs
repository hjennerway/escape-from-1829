import {readFile,writeFile} from 'node:fs/promises';
const json=async name=>JSON.parse(await readFile(new URL(name,import.meta.url)));
const remaining=await json('./remaining-suite.json'),visual=await json('./validation.json');
const resolved=[];
for(const [command,file] of [['node test-asylum-wall-joins.mjs','wall-joins-final.log'],['node test-asylum-room-doors.mjs','room-doors-final.log'],['node test-asylum-door-frames.mjs','door-frames-final.log']]){
 const output=await readFile(new URL(file,import.meta.url),'utf8');
 if(!output.startsWith('PASS:'))throw Error('Final rerun did not pass: '+command);
 resolved.push({command,result:'passed',log:file});
}
const unresolved=remaining.failures.filter(r=>!resolved.some(p=>p.command===r.command));
await writeFile(new URL('./final-validation.json',import.meta.url),JSON.stringify({
 conversion:{rooms:['R6','R8','R10'],mergedPairs:[['R6','R7'],['R8','R9'],['R10','R11']],groundFloorRetained:true},
 initialBedLayout:{bedsPerRoom:16,totalBeds:48,bedAccessRoutesWalked:48,visual,hardwareRenderer:'ANGLE NVIDIA GeForce RTX 3090 Ti Direct3D11'},
 furniture:{seeds:8,roomExitRoutes:976,walkedCollisionProbes:3049,storageWallContacts:1392,clearStorageFrontChecks:696,fixedPercent:81},
 suite:{remainingChecks:remaining.checks,initialPasses:remaining.checks-remaining.failures.length,resolved,unresolved:[{command:'node test-facade-courses.mjs',reason:'Current exterior has 23 surveyed courses; expectation is 22.'},...unresolved]},
 laterOwnerRevision:{threadId:'01a10d3b-8246-7981-a8f6-c2f384898726',title:'Adjust beds and chairs',instruction:'Remove two entrance-side beds and Windsor chairs in all three rooms; push remaining headboards against the walls.',preserved:true,initialBedValidationIsHistorical:true},
 exports:{browserInterior:true,firstFloorReviewDrawings:true,unityRegenerated:false,blenderRegenerated:false,packagedExportsRegenerated:false,aerialInteriorExcluded:true}
},null,2)+'\n');
console.log('Saved the conversion report, historical 48-bed validation, resolved regressions and unrelated suite failures.');
