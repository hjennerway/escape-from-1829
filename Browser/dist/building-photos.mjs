import {isBuildingVisible} from './building-selection.mjs';

// Remembers a hover so the pointer can cross the map to the scroll panel.
// A click/tap pins it; dragging and multi-touch never select a building.
export function bindBuildingPhotos({canvas,camera,selection,glow,document:doc=document}){
 canvas.tabIndex=0;
 const panel=doc.createElement('section');panel.id='buildingPhotos';panel.hidden=true;panel.setAttribute('aria-labelledby','buildingPhotoTitle');
 panel.innerHTML='<header class="building-photo-heading"><div><p class="building-photo-eyebrow">EXPLORE THE ESTATE</p><h2 id="buildingPhotoTitle"></h2><p id="buildingPhotoCount" role="status" aria-live="polite"></p></div><button id="closeBuildingPhotos" type="button" aria-label="Close building photos" title="Close building photos (Esc)">×</button></header><div id="buildingPhotoList" tabindex="0" role="region" aria-label="Building photographs"></div><p id="buildingPhotoHint"></p>';
 const label=doc.createElement('div');label.id='buildingHoverLabel';label.hidden=true;label.setAttribute('aria-hidden','true');doc.body.append(panel,label);
 const title=panel.querySelector('h2'),list=panel.querySelector('#buildingPhotoList'),count=panel.querySelector('#buildingPhotoCount'),hint=panel.querySelector('#buildingPhotoHint'),closeButton=panel.querySelector('button');
 let active=null,pinned=false,pending=null,suspended=false,lastPick=0,focusBefore=null;
 const pointers=new Map();
 function close({restoreFocus=false}={}){
  active=null;pinned=false;pending=null;glow.set(null);panel.hidden=true;label.hidden=true;canvas.style.cursor='';doc.body.classList.remove('building-photos-open');
  if(restoreFocus){if(focusBefore?.isConnected)focusBefore.focus({preventScroll:true});else canvas.focus({preventScroll:true});}
 }
 function select(entry,pin=false){
  if(!entry){close();return;}
  pinned=pin;hint.textContent=pin?'Selected · Tap another building to explore.':'Hover another building · Click to keep this selection.';
  if(active===entry)return;
  if(!active)focusBefore=doc.activeElement===doc.body?canvas:doc.activeElement;
  active=entry;glow.set(entry);title.textContent=entry.name;label.textContent=entry.name;
  panel.hidden=false;doc.body.classList.add('building-photos-open');list.replaceChildren();list.scrollTop=0;
  const photos=[...entry.photos,...(entry.contextPhotos??[])];
  count.textContent=`${entry.name} · ${entry.photos.length} ${entry.photos.length===1?'photo':'photos'}${entry.contextPhotos?.length?' · nearby views below':''}`;
  // The title already identifies the building visually; keep the live message
  // concise on screen while retaining its useful context for screen readers.
  count.setAttribute('aria-label',count.textContent);
  count.textContent=`${entry.photos.length} ${entry.photos.length===1?'photograph':'photographs'}${entry.contextPhotos?.length?' · nearby views below':''}`;
  if(!entry.photos.length){const empty=doc.createElement('p');empty.className='building-photo-empty';empty.textContent='No photographs of this building have been added yet.';list.append(empty);}
  photos.forEach((photo,index)=>{
   if(index===entry.photos.length&&entry.contextPhotos?.length){const heading=doc.createElement('h3');heading.textContent='Nearby / wider site views';list.append(heading);}
   const figure=doc.createElement('figure'),link=doc.createElement('a'),img=doc.createElement('img'),caption=doc.createElement('figcaption');
   link.href=photo.src;link.target='_blank';link.rel='noopener';link.setAttribute('aria-label',`Open photograph: ${photo.caption} (new tab)`);
   img.src=photo.src;img.alt=photo.caption;img.loading=index===0?'eager':'lazy';img.decoding='async';
   img.addEventListener('error',()=>{const fallback=doc.createElement('span');fallback.className='building-photo-unavailable';fallback.textContent='Photograph unavailable';link.replaceWith(fallback);},{once:true});
   caption.textContent=photo.caption;link.append(img);figure.append(link,caption);list.append(figure);
  });
 }
 const pick=e=>selection.pick(e.clientX,e.clientY,canvas.getBoundingClientRect(),camera);
 function down(e){
  pending=null;suspended=true;label.hidden=true;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,moved:e.button!==0||e.shiftKey,multiple:pointers.size>0});
  if(pointers.size>1)for(const pointer of pointers.values())pointer.multiple=true;
 }
 function move(e){
  const start=pointers.get(e.pointerId);
  if(start){if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>7)start.moved=true;return;}
  if(e.pointerType==='touch'||e.buttons||pinned)return;
  suspended=false;pending={clientX:e.clientX,clientY:e.clientY};
 }
 function up(e){
  const start=pointers.get(e.pointerId);pointers.delete(e.pointerId);
  if(start&&!start.moved&&!start.multiple&&Math.hypot(e.clientX-start.x,e.clientY-start.y)<=7){
   const entry=pick(e);if(active===entry&&pinned)close();else select(entry,true);
  }
  suspended=pointers.size>0;
 }
 function cancel(e){pointers.delete(e.pointerId);pending=null;suspended=pointers.size>0;label.hidden=true;}
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);
 canvas.addEventListener('pointercancel',cancel);canvas.addEventListener('lostpointercapture',cancel);
 canvas.addEventListener('pointerleave',()=>{pending=null;label.hidden=true;canvas.style.cursor='';});
 canvas.addEventListener('wheel',()=>{pending=null;label.hidden=true;},{passive:true});
 closeButton.addEventListener('click',()=>close({restoreFocus:true}));
 doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&active)close({restoreFocus:panel.contains(doc.activeElement)});});
 doc.defaultView.addEventListener('blur',()=>{pointers.clear();pending=null;label.hidden=true;suspended=false;});
 // An explicit keyboard route complements spatial pointer interaction.
 const picker=doc.createElement('details');picker.id='buildingPhotoPicker';
 const summary=doc.createElement('summary');summary.textContent='Building photos';summary.setAttribute('aria-label','Choose a building to view photographs');picker.append(summary);
 const choices=doc.createElement('div');choices.className='building-photo-choices';
 for(const entry of [...selection.entries].sort((a,b)=>a.name.localeCompare(b.name))){
  const button=doc.createElement('button');button.type='button';button.textContent=entry.name;
  button.addEventListener('click',()=>{select(entry,true);focusBefore=summary;picker.open=false;closeButton.focus();});choices.append(button);entry.photoButton=button;
 }
 picker.append(choices);doc.querySelector('#previewNav').append(picker);
 picker.addEventListener('toggle',()=>{if(picker.open)for(const entry of selection.entries)entry.photoButton.disabled=!isBuildingVisible(entry.root);});
 doc.addEventListener('pointerdown',e=>{if(!picker.contains(e.target))picker.open=false;});
 doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&picker.open){picker.open=false;summary.focus();}});
 return {close,select,get active(){return active;},get pinned(){return pinned;},
  update(now=performance.now()){
   if(picker.open)for(const entry of selection.entries)entry.photoButton.disabled=!isBuildingVisible(entry.root);
   if(active&&!isBuildingVisible(active.root))close();
   if(!pending||suspended||pinned||now-lastPick<70)return;
   lastPick=now;const pointer=pending;pending=null;const entry=pick(pointer);
   canvas.style.cursor=entry?'pointer':'';label.hidden=!entry;
   if(entry){select(entry);label.style.left=`${Math.max(12,Math.min(pointer.clientX+16,doc.defaultView.innerWidth-label.offsetWidth-12))}px`;label.style.top=`${Math.max(12,pointer.clientY-42)}px`;}
  }
 };
}
