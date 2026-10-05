import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

const TAU=Math.PI*2,THIGH=.43,SHIN=.40,ANKLE=.14,HIP=.97;

// Deliberate cross sections make flatter cloth fronts, bevelled corners and
// anatomical tapers. Rings run from bottom to top; +Z is the character's front.
const SECTION=[[-.72,1],[.72,1],[1,.52],[1,-.52],[.72,-1],[-.72,-1],[-1,-.52],[-1,.52]];
function profileGeometry(THREE,rings,section=SECTION){
 const positions=[],uvs=[],indices=[],n=section.length;
 for(let j=0;j<rings.length;j++){
  const [y,w,d,z=0,x=0]=rings[j];
  for(let i=0;i<n;i++){const [sx,sz]=section[i];positions.push(x+sx*w,y,z+sz*d);uvs.push(i/n,j/(rings.length-1));}
 }
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){
  const a=j*n+i,b=j*n+(i+1)%n,c=b+n,d=a+n;indices.push(a,b,d,b,c,d);
 }
 for(let i=1;i<n-1;i++){indices.push(0,i+1,i);const top=(rings.length-1)*n;indices.push(top,top+i,top+i+1);}
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}

// Self-contained geometry keeps the existing joint rig and needs no model fetch.
export function createSecurityGuard(THREE,{createCanvas=()=>globalThis.document?.createElement('canvas')}={}){
 const root=new THREE.Group();root.name='Security guard';
 const mat=(color,roughness=.8,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const navy=mat(0x26384e),seam=mat(0x3b4f65),trousers=mat(0x222b37),leather=mat(0x151a21,.53),rubber=mat(0x0c1015);
 const skin=mat(0xad8264),skinShade=mat(0x795745),hair=mat(0x332d29),metal=mat(0x9ca7ae,.38,.65),gold=mat(0xb69a58,.4,.55),ivory=mat(0xc8c5b7);
 const joint=(name,parent,p)=>{const g=new THREE.Group();g.name=name;g.position.set(...p);parent.add(g);return g;};
 function part(name,geometry,material,parent,p=[0,0,0],scale){
  if(!geometry.index)geometry.setIndex(Array.from({length:geometry.attributes.position.count},(_,i)=>i));
  const m=new THREE.Mesh(geometry,material);m.name=name;m.position.set(...p);if(scale)m.scale.set(...scale);parent.add(m);return m;
 }
 const box=(name,size,p,m,parent)=>part(name,new THREE.BoxGeometry(...size),m,parent,p);
 const oval=(name,size,p,m,parent)=>part(name,new THREE.SphereGeometry(1,10,6),m,parent,p,size);
 const tube=(name,top,bottom,length,p,m,parent)=>part(name,new THREE.CylinderGeometry(top,bottom,length,10),m,parent,p);
 const profile=(name,rings,m,parent,p)=>part(name,profileGeometry(THREE,rings),m,parent,p);
 function panel(name,points,depth,p,m,parent){
  const shape=new THREE.Shape();shape.moveTo(...points[0]);for(const point of points.slice(1))shape.lineTo(...point);shape.closePath();
  return part(name,new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,steps:1,curveSegments:1}),m,parent,p);
 }
 function cord(name,points,radius,m,parent){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  return part(name,new THREE.TubeGeometry(curve,Math.max(8,points.length*3),radius,5,false),m,parent);
 }
 const pelvis=joint('Pelvis',root,[0,HIP,0]),upper=joint('Upper body',pelvis,[0,0,0]);
 profile('Shaped trouser seat',[[-.105,.185,.111,-.009],[.005,.211,.140,-.008],[.095,.195,.134]],trousers,pelvis);
 profile('Tailored shirt panels',[
  [.080,.199,.140],[.16,.202,.148],[.28,.221,.160],[.43,.252,.174],
  [.52,.256,.160],[.565,.229,.139],[.610,.102,.091]
 ],navy,upper);
 box('Shirt placket',[.014,.424,.008],[0,.325,.172],seam,upper);
 for(let i=0;i<5;i++)oval('Shirt button',[.006,.006,.004],[0,.15+i*.075,.182],metal,upper);
 profile('Neck',[[.586,.065,.065],[.655,.060,.063],[.72,.063,.065]],skin,upper);
 profile('Standing shirt collar',[[.599,.088,.081],[.637,.079,.076]],seam,upper);
 for(const side of [-1,1]){
  const collar=panel('Pointed folded collar',[[-.043,.040],[.038,.032],[.047,-.040],[-.004,-.063]],.008,[side*.063,.575,.132],seam,upper);
  collar.rotation.z=side*.26;collar.rotation.x=-.65;
  panel('Chest pocket',[[-.058,.06],[.058,.06],[.055,-.054],[0,-.072],[-.055,-.054]],.009,[side*.133,.363,.167],navy,upper);
  panel('Pointed pocket flap',[[-.064,.017],[.064,.017],[.056,-.012],[0,-.030],[-.056,-.012]],.011,[side*.133,.421,.179],seam,upper);
  oval('Pocket button',[.006,.006,.004],[side*.133,.408,.193],metal,upper);
  for(const edge of [-1,1])box('Pocket topstitch',[.003,.094,.003],[side*.133+edge*.053,.355,.180],seam,upper);
  const epaulette=box('Shoulder epaulette',[.139,.016,.087],[side*.189,.575,-.006],leather,upper);epaulette.rotation.z=-side*.19;
  box('Epaulette stripe',[.013,.006,.080],[side*.222,.580,-.006],metal,upper);
  oval('Epaulette button',[.008,.005,.008],[side*.139,.595,-.006],gold,upper);
  cord('Shirt side seam',[[side*.224,.16,-.01],[side*.241,.32,-.018],[side*.254,.48,-.018]],.0025,seam,upper);
  for(let i=0;i<2;i++){
   const fold=panel('Waist cloth fold',[[0,0],[side*.095,.016],[side*.066,.020],[side*.013,.011]],.003,[side*.045,.163+i*.043,.156+i*.004],seam,upper);
   fold.rotation.y=side*.15;
  }
 }
 panel('Tie knot',[[-.017,.021],[.017,.021],[.012,-.016],[-.010,-.018]],.017,[0,.554,.142],leather,upper);
 panel('Tapered tie',[[-.009,.12],[.009,.12],[.026,-.097],[0,-.123],[-.026,-.097]],.009,[0,.423,.183],leather,upper);
 const shield=[[-.031,.034],[.031,.034],[.029,-.010],[0,-.041],[-.029,-.010]];
 panel('Shield badge',shield,.012,[-.129,.478,.168],gold,upper);
 panel('Badge inset',shield.map(([x,y])=>[x*.65,y*.68]),.003,[-.129,.478,.182],metal,upper);
 box('Badge number',[.022,.007,.003],[-.129,.477,.187],leather,upper);
 box('Name plate',[.086,.020,.009],[.136,.469,.180],metal,upper);
 for(let i=0;i<5;i++)box('Engraved name mark',[.007,.003,.002],[.108+i*.012,.469,.186],leather,upper);
 cord('Back yoke seam',[[-.21,.485,-.164],[0,.468,-.178],[.21,.485,-.164]],.003,seam,upper);
 cord('Back centre seam',[[0,.17,-.151],[0,.30,-.165],[0,.46,-.177]],.0025,seam,upper);

 const head=joint('Head',upper,[0,.821,0]);
 // One continuous jaw/cheek/forehead surface; the cap conceals its top closure.
 profile('Sculpted head',[
  [-.167,.061,.064,.026],[-.146,.086,.086,.018],[-.103,.111,.099,.008],
  [-.038,.126,.113],[.017,.125,.117,-.005],[.068,.120,.114,-.011],
  [.125,.112,.103,-.015],[.156,.077,.074,-.019]
 ],skin,head);
 profile('Hair at back',[[-.072,.092,.036,-.082],[.019,.127,.044,-.087],[.104,.123,.053,-.063],[.150,.088,.041,-.049]],hair,head);
 for(const side of [-1,1]){
  oval('Ear',[.019,.043,.026],[side*.131,-.025,-.006],skin,head);
  oval('Inner ear',[.007,.024,.012],[side*.146,-.025,.011],skinShade,head);
  const sideburn=box('Sideburn',[.013,.056,.024],[side*.120,.013,-.003],hair,head);sideburn.rotation.z=side*.09;
  oval('Recessed eye socket',[.028,.014,.004],[side*.050,.011,.113],skinShade,head);
  oval('Eye',[.020,.007,.004],[side*.050,.012,.118],ivory,head);
  oval('Iris',[.006,.0065,.003],[side*.050,.012,.122],hair,head);
  const lid=box('Upper eyelid',[.043,.004,.005],[side*.051,.019,.122],skinShade,head);lid.rotation.z=-side*.08;
  const brow=box('Eyebrow',[.047,.008,.007],[side*.052,.040,.119],hair,head);brow.rotation.z=-side*.12;
  cord('Cheek crease',[[side*.035,-.046,.116],[side*.047,-.064,.111],[side*.051,-.083,.108]],.0018,skinShade,head);
  oval('Nostril',[.006,.003,.003],[side*.013,-.048,.145],skinShade,head);
 }
 profile('Defined nose',[
  [-.051,.019,.015,.126],[-.039,.021,.022,.139],[-.016,.013,.020,.133],
  [.032,.010,.009,.118]
 ],skin,head);
 cord('Mouth',[[ -.031,-.097,.108],[0,-.100,.117],[.031,-.097,.108]],.0023,skinShade,head);
 cord('Lower lip',[[ -.020,-.106,.111],[0,-.109,.116],[.020,-.106,.111]],.0024,skin,head);
 box('Chin crease',[.036,.003,.002],[0,-.136,.100],skinShade,head);
 // Small, sparse stubble marks follow the jaw without forming a second chin.
 for(const side of [-1,1])for(let i=0;i<5;i++){
  box('Jaw stubble',[.002,.006,.002],[side*(.026+i*.012),-.126+(i>2?(i-2)*.012:0),.107-i*.0015],skinShade,head);
 }
 profile('Structured cap crown',[[.106,.139,.129,-.011],[.151,.174,.148,-.016],[.185,.167,.143,-.013],[.193,.151,.129,-.011]],navy,head);
 profile('Cap band',[[.087,.135,.124,-.007],[.122,.139,.126,-.008]],leather,head);
 // A thin peaked visor has a flat leading edge and a sloping upper surface.
 profile('Peaked cap visor',[[.074,.147,.078,.132],[.085,.149,.079,.132],[.099,.133,.054,.102]],leather,head);
 cord('Cap piping',[[-.119,.182,.095],[-.068,.192,.134],[.068,.192,.134],[.119,.182,.095]],.003,seam,head);
 cord('Cap braid',[[-.112,.112,.089],[-.07,.096,.131],[0,.094,.138],[.07,.096,.131],[.112,.112,.089]],.0035,gold,head);
 for(const side of [-1,1])oval('Cap braid button',[.008,.008,.004],[side*.115,.111,.094],gold,head);
 panel('Cap badge',shield.map(([x,y])=>[x*.57,y*.67]),.006,[0,.154,.137],gold,head);

 profile('Duty belt',[[.036,.220,.155],[.110,.220,.155]],leather,pelvis);
 box('Belt buckle',[.063,.050,.014],[0,.073,.164],metal,pelvis);
 box('Buckle inset',[.042,.031,.007],[0,.073,.175],leather,pelvis);
 box('Buckle pin',[.026,.005,.004],[.005,.073,.181],metal,pelvis);
 for(const side of [-1,1]){
  box('Belt keeper',[.021,.085,.013],[side*.135,.073,.164],navy,pelvis);
  profile('Leather belt pouch',[[-.071,.041,.029],[.051,.049,.041],[.073,.045,.037]],leather,pelvis,[side*.220,0,.104]);
  panel('Pouch flap',[[-.046,.016],[.046,.016],[.040,-.025],[0,-.033],[-.040,-.025]],.009,[side*.220,.047,.148],rubber,pelvis);
  oval('Pouch snap',[.007,.007,.005],[side*.220,.031,.161],metal,pelvis);
 }
 box('Radio',[.074,.115,.042],[.199,.457,.179],leather,upper);
 box('Radio grille',[.057,.048,.006],[.199,.467,.204],seam,upper);
 for(let i=0;i<4;i++)box('Speaker slot',[.046,.004,.003],[.199,.451+i*.011,.209],rubber,upper);
 tube('Radio antenna',.004,.005,.075,[.220,.550,.178],leather,upper);
 oval('Radio indicator',[.004,.004,.003],[.179,.415,.204],gold,upper);
 cord('Radio shoulder cable',[[.169,.503,.186],[.146,.541,.155],[.163,.571,.06],[.214,.548,.00]],.005,leather,upper);
 const keys=joint('Key ring',pelvis,[-.256,.028,.158]);
 part('Metal key ring',new THREE.TorusGeometry(.023,.0035,5,12),metal,keys);
 for(let i=0;i<3;i++){
  const key=joint('Key',keys,[(i-1)*.012,-.023,i*.005]);key.rotation.z=(i-1)*.20;
  box('Key shaft',[.006,.061,.005],[0,-.026,0],metal,key);
  box('Key teeth',[.020,.012,.005],[.006,-.050,0],metal,key);
 }
 // A compact torch in a side holster, separate from the moving wrist.
 box('Torch holster',[.044,.116,.050],[.230,-.021,-.089],leather,pelvis);
 tube('Belt torch',.023,.019,.155,[.230,.007,-.088],rubber,pelvis);
 tube('Torch rim',.026,.026,.016,[.230,.086,-.088],metal,pelvis);

 const legs=[],arms=[];
 for(const side of [-1,1]){
  const label=side<0?'Left':'Right';
  const hip=joint(label+' hip',pelvis,[side*.111,0,0]);
  profile('Tailored trouser thigh',[
   [-THIGH,.076,.079],[-.38,.080,.086,.004],[-.32,.083,.089,.003],
   [-.22,.090,.100,-.002],[-.08,.102,.113,-.008],[.020,.104,.115,-.008]
  ],trousers,hip);
  cord('Pressed thigh crease',[[0,-.10,.109],[0,-.22,.103],[0,-.34,.091]],.0025,seam,hip);
  cord('Trouser outer seam',[[side*.101,-.08,-.012],[side*.094,-.20,-.012],[side*.080,-.37,-.01]],.002,seam,hip);
  const knee=joint(label+' knee',hip,[0,-THIGH,0]);
  profile('Shaped trouser shin',[
   [-SHIN+.005,.064,.067],[-.34,.066,.069,-.003],[-.29,.071,.072,-.010],
   [-.18,.080,.082,-.018],[-.06,.077,.078,-.006],[.026,.077,.077]
  ],trousers,knee);
  // A close cloth overlap covers the articulated knee without a round kneecap.
  profile('Knee cloth overlap',[[-.042,.078,.081,.004],[0,.080,.084,.005],[.036,.076,.078]],trousers,knee);
  for(let i=0;i<2;i++){
   const fold=box('Knee fabric fold',[.104,.007,.004],[side*.003,-.027-i*.024,.084-i*.008],seam,knee);fold.rotation.z=side*(.06+i*.10);
  }
  cord('Pressed shin crease',[[0,-.09,.079],[0,-.21,.065],[0,-.34,.069]],.002,seam,knee);
  profile('Trouser hem',[[ -.397,.066,.069],[-.372,.066,.069]],navy,knee);
  const ankle=joint(label+' ankle',knee,[0,-SHIN,0]),boot=joint(label+' boot',ankle,[0,0,0]);
  profile('Boot sole',[[-ANKLE,.079,.143,.037],[-.113,.082,.145,.037],[-.103,.079,.139,.037]],rubber,boot);
  box('Boot heel',[.141,.030,.090],[0,-.118,-.047],leather,boot);
  profile('Shaped leather boot',[
   [-.105,.078,.137,.037],[-.071,.077,.133,.037],[-.047,.071,.107,.020],
   [.010,.062,.070,-.018],[.083,.060,.063,-.022]
  ],leather,boot);
  cord('Toe cap seam',[[-.063,-.069,.124],[0,-.044,.126],[.063,-.069,.124]],.0025,seam,boot);
  const tongue=box('Boot tongue',[.062,.096,.010],[0,-.003,.055],rubber,boot);tongue.rotation.x=.27;
  for(let i=0;i<4;i++){
   const z=.073-i*.006,y=-.035+i*.024;
   for(const s of [-1,1]){oval('Lace eyelet',[.004,.004,.003],[s*.031,y,z],metal,boot);const lace=box('Crossed boot lace',[.060,.004,.004],[0,y,z+.003],seam,boot);lace.rotation.z=s*.21;}
  }
  legs.push({hip,knee,ankle,boot});

  const shoulder=joint(label+' shoulder',upper,[side*.265,.513,0]);shoulder.rotation.z=side*.075;
  profile('Shaped upper sleeve',[
   [-.278,.066,.073],[-.218,.073,.080],[-.116,.085,.088],
   [.006,.092,.097],[.050,.077,.086],[.072,.043,.059]
  ],navy,shoulder);
  cord('Sleeve seam',[[side*.065,-.25,0],[side*.084,-.12,0],[side*.085,.018,0]],.0025,seam,shoulder);
  box('Sleeve patch',[.009,.075,.060],[side*.089,-.090,.005],leather,shoulder);
  for(let i=0;i<2;i++){const stripe=box('Sleeve insignia',[.012,.006,.039],[side*.095,-.085-i*.014,.005],gold,shoulder);stripe.rotation.x=.16;}
  const elbow=joint(label+' elbow',shoulder,[0,-.27,0]);
  profile('Tailored forearm sleeve',[
   [-.258,.050,.055,.008],[-.220,.054,.060,.006],[-.15,.064,.068],
   [-.075,.071,.074],[.023,.067,.073]
  ],navy,elbow);
  for(let i=0;i<2;i++){const fold=box('Elbow cloth fold',[.087,.006,.004],[0,-.039-i*.020,.075-i*.004],seam,elbow);fold.rotation.z=side*.13;}
  profile('Buttoned shirt cuff',[[-.263,.054,.058,.007],[-.217,.054,.058,.007]],seam,elbow);
  oval('Cuff button',[.005,.005,.004],[0,-.238,.069],metal,elbow);
  profile('Wrist',[[-.293,.033,.029,.008],[-.251,.034,.030,.008]],skin,elbow);
  const hand=joint(label+' hand',elbow,[0,-.300,.007]);hand.rotation.x=-.06;
  profile('Shaped palm',[[-.066,.040,.026,.006],[-.028,.043,.027],[.015,.033,.029]],skin,hand);
  for(let i=0;i<4;i++){
   const x=(i-1.5)*.020,length=[.042,.051,.048,.035][i];
   profile('Separate finger',[
    [-.062-length,.0075,.012,.013,x],[-.057-length*.55,.009,.014,.008,x],
    [-.047,.009,.022,.006,x]
   ],skin,hand);
   box('Finger joint crease',[.012,.002,.002],[x,-.069,.025],skinShade,hand);
   box('Fingernail',[.010,.010,.002],[x,-.053-length,.026],ivory,hand);
  }
  const thumb=profile('Shaped thumb',[[-.061,.013,.015,.014],[-.030,.017,.018,.009],[0,.012,.016]],skin,hand,[-side*.043,-.012,.007]);thumb.rotation.z=-side*.30;
  if(side<0){profile('Watch strap',[[-.287,.037,.034,.008],[-.268,.037,.034,.008]],leather,elbow);box('Wristwatch',[.031,.027,.012],[0,-.277,.049],metal,elbow);box('Watch face',[.022,.020,.002],[0,-.277,.056],rubber,elbow);}
  arms.push({shoulder,elbow});
 }

 const canvas=createCanvas();
 if(canvas){
  canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');
  c.fillStyle='#1c2b3b';c.fillRect(0,0,512,128);c.strokeStyle='#748394';c.lineWidth=4;c.strokeRect(7,7,498,114);
  c.fillStyle='#d9ddd7';c.font='bold 72px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('SECURITY',256,68);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const lettering=new THREE.MeshStandardMaterial({map:texture,roughness:.9});
  const back=part('SECURITY back patch',new THREE.PlaneGeometry(.33,.083),lettering,upper,[0,.423,-.177]);back.rotation.y=Math.PI;
  part('SECURITY chest patch',new THREE.PlaneGeometry(.107,.027),lettering,upper,[-.133,.363,.181]);
 }

 // Batch rigid details only. Knee, ankle, elbow and wrist silhouettes keep
 // their local transforms; no extra lights, textures or runtime fetches.
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
