import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

const TAU=Math.PI*2,THIGH=.43,SHIN=.40,ANKLE=.14,HIP=.97;

// A self-contained, procedural character. +Z is forward, matching NPC steering.
export function createSecurityGuard(THREE,{createCanvas=()=>globalThis.document?.createElement('canvas')}={}){
 const root=new THREE.Group();root.name='Security guard';
 const mat=(color,roughness=.8,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const navy=mat(0x293c55),seam=mat(0x476079),trousers=mat(0x202c3c),leather=mat(0x111822,.46),rubber=mat(0x0b1017);
 const skin=mat(0xb18a6c),skinShade=mat(0x86624f),hair=mat(0x342b28),metal=mat(0xa9b2b9,.35,.65),gold=mat(0xc2a765,.4,.55),ivory=mat(0xd1cec2);
 const joint=(name,parent,p)=>{const g=new THREE.Group();g.name=name;g.position.set(...p);parent.add(g);return g;};
 function part(name,geometry,material,parent,p,scale){
  const m=new THREE.Mesh(geometry,material);m.name=name;m.position.set(...p);if(scale)m.scale.set(...scale);parent.add(m);return m;
 }
 const box=(name,size,p,m,parent)=>part(name,new THREE.BoxGeometry(...size),m,parent,p);
 const oval=(name,size,p,m,parent)=>part(name,new THREE.SphereGeometry(1,12,8),m,parent,p,size);
 const tube=(name,top,bottom,length,p,m,parent)=>part(name,new THREE.CylinderGeometry(top,bottom,length,10),m,parent,p);
 const pelvis=joint('Pelvis',root,[0,HIP,0]),upper=joint('Upper body',pelvis,[0,0,0]);
 box('Trouser waist',[.39,.17,.27],[0,.015,0],trousers,pelvis);
 part('Tailored uniform shirt',new THREE.CylinderGeometry(.285,.225,.54,8),navy,upper,[0,.335,0],[1,1,.64]);
 box('Shirt placket',[.028,.47,.015],[0,.335,.173],seam,upper);
 for(let i=0;i<5;i++)oval('Shirt button',[.010,.010,.006],[0,.15+i*.075,.188],metal,upper);
 tube('Neck',.077,.085,.13,[0,.66,0],skin,upper);
 for(const side of [-1,1]){
  const collar=box('Folded collar',[.10,.13,.035],[side*.07,.576,.151],seam,upper);collar.rotation.z=side*.38;
  box('Chest pocket',[.125,.135,.018],[side*.137,.35,.167],navy,upper);
  box('Pocket flap',[.137,.037,.025],[side*.137,.421,.177],seam,upper);
  oval('Pocket button',[.008,.008,.007],[side*.137,.421,.195],metal,upper);
  box('Shoulder epaulette',[.13,.025,.13],[side*.239,.603,0],leather,upper);
  box('Epaulette stripe',[.025,.006,.12],[side*.239,.619,0],metal,upper);
 }
 box('Tie knot',[.038,.046,.025],[0,.558,.181],leather,upper);
 const tie=box('Tie',[.041,.23,.02],[0,.423,.191],leather,upper);tie.rotation.z=.025;
 const badge=part('Shield badge',new THREE.CylinderGeometry(.047,.047,.013,5),gold,upper,[-.139,.495,.188]);badge.rotation.x=Math.PI/2;
 oval('Badge centre',[.014,.021,.009],[-.139,.501,.20],metal,upper);
 box('Name plate',[.098,.027,.012],[.142,.467,.19],metal,upper);

 const head=joint('Head',upper,[0,.827,0]);
 oval('Head',[.157,.203,.153],[0,0,0],skin,head);
 oval('Jaw',[.125,.093,.119],[0,-.121,.025],skin,head);
 oval('Hair at back',[.159,.162,.095],[0,.016,-.080],hair,head);
 for(const side of [-1,1]){
  oval('Ear',[.034,.058,.029],[side*.156,-.012,0],skin,head);
  oval('Inner ear',[.012,.029,.016],[side*.176,-.012,.015],skinShade,head);
  oval('Eye socket',[.039,.026,.013],[side*.062,.015,.136],skinShade,head);
  oval('Eye',[.027,.012,.010],[side*.062,.017,.147],ivory,head);
  oval('Pupil',[.008,.010,.005],[side*.062,.018,.157],hair,head);
  const brow=box('Eyebrow',[.064,.014,.013],[side*.064,.048,.147],hair,head);brow.rotation.z=-side*.10;
 }
 oval('Nose bridge',[.025,.055,.026],[0,-.02,.149],skin,head);
 oval('Nose tip',[.035,.026,.029],[0,-.053,.169],skin,head);
 box('Mouth',[.069,.009,.009],[0,-.105,.136],skinShade,head);
 oval('Chin',[.064,.036,.025],[0,-.151,.118],skin,head);
 oval('Cap crown',[.198,.092,.185],[0,.172,-.012],navy,head);
 part('Cap band',new THREE.CylinderGeometry(.173,.173,.057,16),leather,head,[0,.128,0],[1,1,.95]);
 oval('Peaked cap brim',[.195,.019,.147],[0,.107,.130],leather,head);
 box('Cap braid',[.24,.012,.013],[0,.131,.162],gold,head);
 oval('Cap badge',[.028,.034,.009],[0,.183,.169],gold,head);

 box('Duty belt',[.454,.077,.306],[0,.072,0],leather,pelvis);
 box('Belt buckle',[.077,.057,.019],[0,.072,.164],metal,pelvis);
 box('Buckle inset',[.046,.030,.009],[0,.072,.177],leather,pelvis);
 for(const side of [-1,1]){
  box('Belt keeper',[.027,.091,.019],[side*.158,.072,.16],navy,pelvis);
  box('Belt pouch',[.102,.15,.083],[side*.219,.001,.117],leather,pelvis);
  box('Pouch flap',[.108,.035,.09],[side*.219,.059,.12],rubber,pelvis);
  oval('Pouch snap',[.009,.009,.007],[side*.219,.058,.17],metal,pelvis);
 }
 box('Radio',[.10,.155,.055],[.204,.454,.199],leather,upper);
 box('Radio grille',[.072,.060,.009],[.204,.469,.231],seam,upper);
 for(let i=0;i<3;i++)box('Speaker slot',[.057,.006,.007],[.204,.45+i*.016,.239],rubber,upper);
 tube('Radio antenna',.006,.008,.125,[.230,.591,.201],leather,upper);
 oval('Radio indicator',[.006,.006,.004],[.181,.411,.232],gold,upper);
 const keys=joint('Key ring',pelvis,[-.255,.028,.16]);
 part('Metal key ring',new THREE.TorusGeometry(.029,.005,6,12),metal,keys,[0,0,0]);
 for(let i=0;i<3;i++){
  const key=joint('Key',keys,[(i-1)*.016,-.025,i*.006]);key.rotation.z=(i-1)*.20;
  box('Key shaft',[.009,.069,.007],[0,-.029,0],metal,key);
  box('Key teeth',[.026,.016,.007],[.008,-.057,0],metal,key);
 }

 const legs=[],arms=[];
 for(const side of [-1,1]){
  const label=side<0?'Left':'Right';
  const hip=joint(label+' hip',pelvis,[side*.115,0,0]);
  part('Trouser thigh',new THREE.CylinderGeometry(.113,.087,THIGH,10),trousers,hip,[0,-THIGH/2,0],[1,1,1.08]);
  box('Pressed trouser crease',[.008,.33,.006],[0,-.20,.103],seam,hip);
  const knee=joint(label+' knee',hip,[0,-THIGH,0]);
  oval('Trouser knee',[.087,.081,.09],[0,0,0],trousers,knee);
  tube('Trouser calf',.084,.070,SHIN,[0,-SHIN/2,0],trousers,knee);
  tube('Trouser cuff',.076,.076,.053,[0,-SHIN+.030,0],navy,knee);
  const ankle=joint(label+' ankle',knee,[0,-SHIN,0]);
  const boot=joint(label+' boot',ankle,[0,0,0]);
  box('Boot sole',[.185,.042,.32],[0,-ANKLE+.021,.047],rubber,boot);
  box('Boot heel',[.179,.052,.097],[0,-ANKLE+.026,-.061],leather,boot);
  oval('Leather boot toe',[.089,.064,.16],[0,-.065,.065],leather,boot);
  tube('Boot upper',.075,.081,.15,[0,-.006,-.014],leather,boot);
  box('Boot tongue',[.074,.118,.021],[0,.002,.063],rubber,boot);
  for(let i=0;i<4;i++)box('Boot lace',[.072,.008,.009],[0,-.031+i*.025,.079],seam,boot);
  legs.push({hip,knee,ankle,boot});

  const shoulder=joint(label+' shoulder',upper,[side*.305,.522,0]);shoulder.rotation.z=side*.09;
  oval('Shoulder sleeve',[.117,.126,.118],[0,-.009,0],navy,shoulder);
  tube('Upper sleeve',.105,.082,.28,[0,-.137,0],navy,shoulder);
  box('Sleeve patch',[.013,.092,.084],[side*.10,-.07,0],leather,shoulder);
  box('Sleeve insignia',[.016,.018,.063],[side*.108,-.069,.004],gold,shoulder);
  const elbow=joint(label+' elbow',shoulder,[0,-.27,0]);
  oval('Sleeve elbow',[.080,.077,.081],[0,0,0],navy,elbow);
  tube('Forearm sleeve',.079,.064,.255,[0,-.123,0],navy,elbow);
  tube('Cuff',.069,.069,.053,[0,-.235,0],seam,elbow);
  oval('Hand',[.065,.092,.045],[0,-.321,.006],skin,elbow);
  oval('Thumb',[.027,.055,.028],[-side*.045,-.301,.032],skin,elbow);
  for(let i=0;i<3;i++)box('Finger crease',[.038,.004,.007],[0,-.328-i*.018,.045],skinShade,elbow);
  if(side<0){tube('Watch strap',.070,.070,.027,[0,-.271,0],leather,elbow);box('Wristwatch',[.045,.034,.014],[0,-.269,.069],metal,elbow);}
  arms.push({shoulder,elbow});
 }

 // Shared canvas lettering costs one material; the model also works in Node
 // geometry checks without a DOM or any network/image assets.
 const canvas=createCanvas();
 if(canvas){
  canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');
  c.fillStyle='#152234';c.fillRect(0,0,512,128);c.strokeStyle='#8294a5';c.lineWidth=5;c.strokeRect(7,7,498,114);
  c.fillStyle='#e2e4dc';c.font='bold 72px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('SECURITY',256,68);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const lettering=new THREE.MeshStandardMaterial({map:texture,roughness:.9});
  const back=part('SECURITY back patch',new THREE.PlaneGeometry(.40,.10),lettering,upper,[0,.425,-.174]);back.rotation.y=Math.PI;
  part('SECURITY chest patch',new THREE.PlaneGeometry(.127,.032),lettering,upper,[-.139,.348,.181]);
 }

 // Merge only rigid siblings: knees, ankles, elbows and their details keep
 // independent transforms while buttons, facial features and stitching batch.
 function batch(parent){
  const byMaterial=new Map();
  for(const child of [...parent.children]){
   if(!child.isMesh){batch(child);continue;}
   const list=byMaterial.get(child.material)||[];list.push(child);byMaterial.set(child.material,list);
  }
  for(const [material,meshes] of byMaterial){
   if(meshes.length<2)continue;
   const geometries=meshes.map(m=>{m.updateMatrix();return m.geometry.clone().applyMatrix4(m.matrix);});
   const geometry=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());
   const merged=new THREE.Mesh(geometry,material);merged.name=meshes.map(m=>m.name).join(' / ');
   for(const m of meshes){parent.remove(m);m.geometry.dispose();}parent.add(merged);
  }
 }
 batch(root);
 const rig={pelvis,upper,head,legs,arms,keys,phase:0,amount:0,pace:0};
 root.userData.guardRig=rig;
 resetSecurityGuard(root);
 return root;
}

function pose(rig){
 const {amount,pace,phase}=rig;
 const hipHeight=HIP-amount*(.068+.018*pace)+Math.cos(phase*2)*.009*amount;
 rig.pelvis.position.y=hipHeight;
 rig.upper.rotation.x=(.025+.055*pace)*amount;
 rig.upper.rotation.y=Math.sin(phase)*.045*amount;
 rig.head.rotation.y=-rig.upper.rotation.y*.5;
 rig.keys.rotation.x=Math.sin(phase+.5)*.16*amount;
 for(let i=0;i<2;i++){
  const p=((phase/TAU+i*.5)%1+1)%1,stance=.58;
  const swing=Math.max(0,(p-stance)/(1-stance));
  const stride=(.29+.025*pace)*amount;
  const footZ=p<stance?stride*(1-2*p/stance):-stride*Math.cos(Math.PI*swing);
  const footY=ANKLE+Math.sin(Math.PI*swing)**2*(.115+.04*pace)*amount;
  const down=hipHeight-footY,distance=Math.min(THIGH+SHIN,Math.hypot(down,footZ));
  // Two-bone leg solve keeps each planted boot flat at floor level and lifts
  // the swinging foot; a raised knee cannot drag the sole through the floor.
  const bend=Math.acos(Math.max(-1,Math.min(1,(distance*distance-THIGH*THIGH-SHIN*SHIN)/(2*THIGH*SHIN))));
  const hip=Math.atan2(-footZ,down)-Math.atan2(SHIN*Math.sin(bend),THIGH+SHIN*Math.cos(bend));
  const leg=rig.legs[i];leg.hip.rotation.x=hip;leg.knee.rotation.x=bend;leg.ankle.rotation.x=-hip-bend;
  const arm=rig.arms[i];arm.shoulder.rotation.x=footZ*1.1;arm.elbow.rotation.x=-.13-(.11+.18*pace)*amount;
 }
}

// Advance by actual horizontal travel, never by wall-clock time or intent.
// The caller skips updates while paused, interacting, or in a cutscene.
export function updateSecurityGuard(model,distance,dt){
 const rig=model.userData.guardRig;if(!rig||dt<=0)return;
 const speed=Math.max(0,distance)/dt,moving=speed>.01;
 rig.phase=(rig.phase+Math.max(0,distance)*TAU/1.65)%TAU;
 const blend=1-Math.exp(-dt*12);
 rig.amount+=(Number(moving)-rig.amount)*blend;
 rig.pace+=(Math.max(0,Math.min(1,(speed-2.4)/1.45))-rig.pace)*blend;
 if(!moving&&rig.amount<.001)rig.amount=0;
 pose(rig);
}

export function resetSecurityGuard(model){
 const rig=model.userData.guardRig;if(!rig)return;
 rig.phase=0;rig.amount=0;rig.pace=0;pose(rig);
}
