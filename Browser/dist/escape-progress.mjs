import {asylumRoomNumbers} from './asylum-room-numbers.mjs';

// Escape knowledge and physical possessions are separate: capture cannot erase evidence.
export const CAPTURE_LIMIT=3;
export const MAST={x:-69,z:-89};
export function seededRandom(seed){let n=seed>>>0;return ()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);}

export function createEscapeProgress({seed=Date.now(),journal,floors=[]}={}){
 const random=seededRandom(seed),variant=random()<.5?'west':'east';
 const numbers=floors.map(asylumRoomNumbers);
 function roomNumber(floor,id){const number=numbers[floor]?.get(id);if(!number)throw Error(`Missing escape room number ${floor}:${id}`);return number;}
 const run={seed:seed>>>0,variant,exitId:variant==='west'?'D2':'D8',office:random()<.5?'R41':'R49',keyRoom:random()<.5?'R23':'R25',captures:0,staffKey:false,serviceKey:false,confiscated:new Set(),opened:new Set(),evidence:new Set(),outside:false,boundary:false};
 const recordLocation=()=>`room ${roomNumber(3,run.office)}, ${run.office==='R41'?'Records office above Reception':'Librarian office beside the old Library'}`;
 function objective(actor={}){
  if(actor.outside)return {title:'Reach the radio mast',detail:run.boundary?'Continue north to the lattice mast. Press E at its base to finish your escape.':'Follow the west perimeter path north, beyond the asylum grounds, towards the lattice mast.'};
  if(run.serviceKey)return {title:`Unlock the ${run.variant} outer entrance`,detail:`Return to the ground floor. Press E at ${run.exitId} · ${run.variant==='west'?'West':'East'} outer entrance with your brass key.`};
  if(run.confiscated.size)return {title:'Recover your keys at Reception',detail:'Ground floor · press E at the glowing property tray on the Reception desk. Your notebook and opened gates are retained.'};
  if(run.opened.size||actor.floor===3){
   const otherWing=actor.floor===3&&(run.office==='R41'?actor.x<-25:actor.x>=-25);
   return {title:'Find the brass outside-door key',detail:`Second floor · ${recordLocation()}. ${otherWing?'Go down to the first floor, cross to the other staff stair, then climb again. ':'Look for the glowing porter’s record. '}Press E to inspect and take the key.`};
  }
  if(run.staffKey)return {title:'Unlock an upper stair gate',detail:'First floor · press E at either staff grille. Then find the porter’s record and brass outside-door key upstairs.'};
  if(run.evidence.has('release-note'))return {title:'Use the basement stair release',detail:`Basement · room ${roomNumber(2,'B4')}, beside the west service stair. Press E at the glowing safety control to open both upper gates.`};
  if(run.evidence.has('memo'))return {title:'Find the staff stair key',detail:`Ground floor · room ${roomNumber(0,run.keyRoom)}, ${run.keyRoom==='R23'?'west':'east'} of Reception. Press E at the glowing key rack. The basement release is another way upstairs.`};
  return {title:'Find a way into the upper offices',detail:'Look for glowing notices and keys near Reception, or the maintenance notice in the basement. Press E to inspect; N opens your notes.'};
 }
 const fact=(id,title,text,view)=>journal?.recordEvidence({id:'escape:'+id,title,text,view,source:'Personal observation · fictional escape scenario'});
 const deduction=(id,title,text)=>journal?.recordEvidence({id:'escape:'+id,title,text,kind:'deduction',source:'My deduction from discovered evidence'});
 function infer(){
  if(run.evidence.has('memo')&&run.evidence.has('gate'))deduction('staff-route','Staff circulation','The upper stair grilles and the staff memorandum refer to the same restricted offices. Staff access could explain the passages missing from the ward routine.');
  if(run.evidence.has('east-stair')&&run.evidence.has('west-stair'))deduction('mirrored-stairs','Paired rear stairs','I have seen a rear stair in each wing. Their similar arrangement gives me a way to recognise the other wing, without assuming every room is identical.');
  if(run.evidence.has('release-note')&&run.evidence.has('gate'))deduction('release-route','A service connection','The basement maintenance notice describes a shared safety release for the upper staff grilles. Its control is beside the west service stair.');
  if(run.evidence.has('plan')&&run.evidence.has('outside-door'))deduction('grounds-route','A route into the grounds',`The service record and the door I tested agree: the ${run.variant} outer entrance is on the porter’s route. The tagged brass key may fit its lock.`);
 }
 function discover(id,{view}={}){
  run.evidence.add(id);
  const data={
   memo:['Staff memorandum',`Staff use the offices above the wards. A stair key is kept in room ${roomNumber(0,run.keyRoom)}, ${run.keyRoom==='R23'?'west':'east'} of Reception. A maintenance notice in the basement mentions a second means of access.`],
   'office-index':['Office filing notice',`The porter’s service record is filed in the ${run.office==='R41'?'Records':'Librarian'} office, room ${roomNumber(3,run.office)} on the second floor. ${run.office==='R41'?'This office is above Reception.':'This office is beside the old Library.'} Inspect the glowing record and take its attached brass outside-door key. The stair key is a different key.`],
   gate:['Upper stair grille',`An iron grille closes this stair above the first floor. Its plate reads “Staff offices · stair key” and directs me to the porter’s record in second-floor ${recordLocation()}. The brass outside-door key is attached to the record.`],
   'release-note':['Maintenance notice',`The basement safety release in room ${roomNumber(2,'B4')}, beside the west service stair, operates both upper staff grilles, S1 and S5. It does not open an outside door.`],
   plan:['Porter’s service record',`The record names the ${run.variant} outer entrance as tonight’s service route. The other outside doors are bolted for the night. Its brass key is kept with this record. Beyond the outer path, the tall lattice mast stands northwest of the asylum; the porter’s sketch shows the west perimeter path continuing north towards it.`],
   mast:['Lattice mast','A tall lattice mast stands beyond the northwest side of the asylum. It is a recognisable landmark beyond the grounds.'],
   'outside-door':['Outer entrance',`The ${run.variant} outer entrance is locked. Its fitting takes a brass service key.`],
   boundary:['Beyond the asylum grounds','I have crossed onto the perimeter path beyond the asylum. The lattice mast stands further north.'],
  }[id];
  if(data)fact(id,...data,view);
  infer();
 }
 function interact(id,observation={}){
  if(['memo','release-note','plan','office-index'].includes(id))discover(id,observation);
  if(id==='staff-key'){run.staffKey=true;run.confiscated.delete('staffKey');fact('staff-key','Staff stair key','I took the labelled stair key from the Reception-side staff room. It is a stair key, rather than an outside-door key.',observation.view);return 'You take the staff stair key.';}
  if(id==='release'){run.opened.add('S5');run.opened.add('S1');fact('release','Staff stair safety release',`I operated the basement safety release. The indicators changed to “S1 and S5 upper grilles released”. The control notice directs me to the porter’s record in second-floor ${recordLocation()}, with its brass outside-door key.`,observation.view);return `Both upper gates open. Find the brass key in second-floor room ${roomNumber(3,run.office)}.`;}
  if(id==='plan'){run.serviceKey=true;run.confiscated.delete('serviceKey');fact('service-key','Tagged brass key',`I took the brass key tagged “${run.variant} outer entrance” beside the porter’s record.`);discover('mast');return `Brass key taken. Return to the ${run.variant} outer entrance on the ground floor.`;}
  if(id==='reclaim'){
   if(!run.confiscated.size)return 'The property tray is empty.';
   for(const key of run.confiscated)run[key]=true;run.confiscated.clear();
   fact('confiscation','Confiscated property','I recovered my keys from the property tray beside Reception. My notes had stayed with me.');return 'You recover your confiscated keys.';
  }
  return 'Copied into your notebook.';
 }
 function openStair(id){discover('gate');if(run.opened.has(id))return true;if(!run.staffKey)return false;run.opened.add(id);fact('gate:'+id,'Staff stair access',`The staff stair key opened the upper grille on ${id}. Its plate directs me to second-floor ${recordLocation()}. Inspect the porter’s record there and take its attached brass outside-door key.`);return true;}
 function door(exit,{returning=false}={}){
  if(returning)return {allowed:true};
  if(exit.id!==run.exitId)return {allowed:false,text:'Bolted for the night. A porter’s notice says service arrangements are filed in the upper offices.'};
  discover('outside-door');
  if(!run.serviceKey)return {allowed:false,text:'Locked · brass service-key fitting.'};
  run.outside=true;fact('outside-door','Outer entrance',`The tagged brass key opened the ${run.variant} outer entrance. I reached the grounds; the perimeter path still lies beyond them.`);
  return {allowed:true};
 }
 function capture(){
  run.captures++;
  if(run.captures>=CAPTURE_LIMIT)return {terminal:true,count:run.captures};
  const lost=[];for(const key of ['staffKey','serviceKey'])if(run[key]){run[key]=false;run.confiscated.add(key);lost.push(key);}
  fact('confiscation','Confiscated property',lost.length?'The attendant took my keys to the property tray beside Reception. My notebook stayed with me.':run.confiscated.size?'The keys taken earlier are still held in the property tray beside Reception. My notebook stayed with me.':'The attendant checked my belongings. My notebook stayed with me.');
  const cell=run.captures===2;
  fact('capture:'+run.captures,'Returned under supervision',cell?'After a second capture I was moved to a basement padded cell. I heard the attendant say the observation period would be brief. The west stair remains connected to the wards.':'After capture I was returned to the admissions room beside Reception. Security changed its patrol; I still remember what I discovered.');
  return {terminal:false,count:run.captures,floor:cell?2:0,room:cell?'B5':'R23',delay:cell?4:0,lost};
 }
 return {run,roomNumber,objective,discover,interact,openStair,door,capture,
  has:id=>run.evidence.has(id),canFinish:actor=>!!actor.outside&&run.boundary&&Math.hypot(actor.x-MAST.x,actor.z-MAST.z)<7,
  observeBoundary(actor){if(actor.outside&&actor.z<-50&&!run.boundary){run.boundary=true;discover('boundary',{view:'outside'});}}
 };
}
