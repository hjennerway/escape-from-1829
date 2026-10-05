import {buildAsylumLayout} from './asylum-layout.mjs';
import {createNotebook,notebookView} from './notebook.mjs';
import {drawNotebookMap} from './notebook-map.mjs';

// Reuse the playable floor plans and map drawing without changing exploration memory.
export function createDeveloperMap(data,{root=document,getState,onClose}){
 const layout=data.floors[0].cellSize?data:buildAsylumLayout(data);
 const notebook=createNotebook(layout.floors,{outsideStairs:layout.plan?.outsideStairs??data.outsideStairs??[]});
 const panel=root.createElement('section');panel.id='developerMap';panel.className='developer-map';panel.hidden=true;
 panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','developerMapTitle');
 panel.innerHTML='<div class="developer-map-card"><div class="developer-map-header"><div><span class="eyebrow">DEVELOPER OPTIONS</span><h2 id="developerMapTitle">Full map</h2></div><button id="closeDeveloperMap" type="button" aria-label="Close full map">Close · M / Esc</button></div><nav id="developerMapLevels" aria-label="All map levels"></nav><div class="developer-map-scroll"><p id="developerMapLevel"></p><canvas id="developerMapCanvas" width="900" height="580" role="img"></canvas><p class="developer-map-legend">● You &nbsp; <em>■ Doors</em> &nbsp; <i>■ Stairs</i></p></div></div>';
 root.body.append(panel);
 const canvas=panel.querySelector('canvas'),context=canvas.getContext('2d'),nav=panel.querySelector('nav'),label=panel.querySelector('#developerMapLevel'),close=panel.querySelector('#closeDeveloperMap');
 let selected=notebook.views[0].key,previousFocus=null,background=[];
 const buttons=notebook.views.map(view=>{
  const button=root.createElement('button');button.type='button';button.textContent=view.name;button.dataset.level=view.key;
  button.addEventListener('click',()=>{selected=view.key;draw();});nav.append(button);return button;
 });
 function draw(){
  const view=notebook.views.find(view=>view.key===selected),{player,enemies=[],yaw=0}=getState();
  label.textContent=view.name+' · Fully revealed';canvas.setAttribute('aria-label','Full map of '+view.name);
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.level===selected)));
  drawNotebookMap(context,notebook,selected,player,enemies,yaw,{revealAll:true,createCanvas:()=>root.createElement('canvas')});
 }
 close.addEventListener('click',onClose);
 root.addEventListener('keydown',event=>{
  if(panel.hidden)return;
  if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();if(!event.repeat)onClose();return;}
  if(event.key==='Tab'){
   event.preventDefault();event.stopImmediatePropagation();const controls=[close,...buttons],index=controls.indexOf(root.activeElement),step=event.shiftKey?-1:1;
   controls[(index+step+controls.length)%controls.length].focus();return;
  }
  // Let the developer bindings handle M, Shift+M and minus. Other game keys stay here.
  if(event.code==='KeyM'||event.key?.toLowerCase()==='m'||event.key==='-'||['Minus','NumpadSubtract'].includes(event.code))return;
  if(['Enter',' ','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))event.stopPropagation();
  else{event.preventDefault();event.stopImmediatePropagation();}
 },true);
 return {panel,notebook,draw,
  show(){
   if(!panel.hidden)return;
   previousFocus=root.activeElement;const current=notebookView(getState().player);
   if(notebook.views.some(view=>view.key===current))selected=current;
   background=[...root.body.children].filter(element=>element!==panel).map(element=>[element,element.inert]);
   for(const [element] of background)element.inert=true;
   panel.hidden=false;draw();close.focus({preventScroll:true});
  },
  hide(){
   if(panel.hidden)return;panel.hidden=true;
   for(const [element,inert] of background)element.inert=inert;
   background=[];if(previousFocus?.isConnected&&!previousFocus.inert)previousFocus.focus({preventScroll:true});
  }
 };
}
