// A native modal keeps focus and pointer interaction inside the photograph.
export function createPhotoLightbox(doc=document){
 const dialog=doc.createElement('dialog');dialog.id='photoLightbox';
 dialog.setAttribute('aria-labelledby','photoLightboxTitle');
 dialog.innerHTML='<div class="photo-lightbox-content"><div class="photo-lightbox-heading"><h2 id="photoLightboxTitle"></h2><button type="button" class="photo-lightbox-close" aria-label="Close photograph" title="Close photograph (Esc)" autofocus>×</button></div><figure><img alt=""><p class="photo-lightbox-error" role="status" hidden>Photograph unavailable</p><figcaption id="photoLightboxCaption"></figcaption></figure><nav aria-label="Photograph navigation"><button type="button" class="photo-lightbox-previous" aria-label="Previous photograph">← Previous</button><p class="photo-lightbox-count" role="status" aria-live="polite"></p><button type="button" class="photo-lightbox-next" aria-label="Next photograph">Next →</button></nav></div>';
 doc.body.append(dialog);
 const img=dialog.querySelector('img'),caption=dialog.querySelector('figcaption'),title=dialog.querySelector('h2'),count=dialog.querySelector('.photo-lightbox-count'),error=dialog.querySelector('.photo-lightbox-error');
 const closeButton=dialog.querySelector('.photo-lightbox-close'),previous=dialog.querySelector('.photo-lightbox-previous'),next=dialog.querySelector('.photo-lightbox-next');
 let photos=[],index=0,opener=null;
 function show(i){
  index=(i+photos.length)%photos.length;const photo=photos[index];
  error.hidden=true;img.hidden=false;img.alt=photo.caption;img.src=photo.src;caption.textContent=photo.caption;
  count.textContent=(index+1)+' / '+photos.length;previous.hidden=next.hidden=photos.length<2;
 }
 function close(){if(!dialog.open)return;dialog.close();if(opener?.isConnected)opener.focus({preventScroll:true});}
 img.addEventListener('error',()=>{img.hidden=true;error.hidden=false;});
 closeButton.addEventListener('click',close);
 previous.addEventListener('click',()=>show(index-1));next.addEventListener('click',()=>show(index+1));
 // Close only when both ends of the gesture are on the surrounding backdrop.
 let backdropDown=false;
 dialog.addEventListener('pointerdown',e=>{backdropDown=e.target===dialog;});
 dialog.addEventListener('click',e=>{if(e.target===dialog&&backdropDown)close();backdropDown=false;});
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.addEventListener('keydown',e=>{
  e.stopPropagation();
  if(e.key==='Tab'){
   const buttons=[closeButton,previous,next].filter(b=>!b.hidden),first=buttons[0],last=buttons.at(-1);
   if(e.shiftKey&&doc.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&doc.activeElement===last){e.preventDefault();first.focus();}
  }
  else if(e.key==='Escape'){e.preventDefault();close();}
  else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(index+(e.key==='ArrowLeft'?-1:1));}
 });
 return {get open(){return dialog.open;},close,
  show(entry,start,trigger){
   photos=[...entry.photos,...(entry.contextPhotos??[])];if(!photos.length)return;
   opener=trigger;title.textContent=entry.name;show(start);dialog.showModal();closeButton.focus({preventScroll:true});
  }
 };
}
