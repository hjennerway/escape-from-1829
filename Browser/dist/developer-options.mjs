// Shared by aerial, walking and escape; each page waits for an explicit minus press.
export function bindDeveloperOptions({THREE,exterior,plan,root=document,target=document,getMapState=()=>({player:{floor:-1},enemies:[],yaw:0}),onMapChange=()=>{},onDoorsChange=null,onChange=()=>{},loadMap=()=>import('./developer-map.mjs')}){
 const toggle=root.getElementById('developerToggle'),shortcuts=root.getElementById('developerShortcuts');
 const stairs=root.getElementById('stairOverlayToggle'),status=root.getElementById('developerStatus');
 const mapToggle=root.getElementById('developerMapToggle');
 const doorsToggle=root.getElementById('developerDoorsToggle');
 const aerialHelp=root.getElementById('aerialHelp');
 // The phone timeline must leave room when extra shortcut rows are revealed.
 if(aerialHelp&&root.documentElement&&typeof ResizeObserver!=='undefined')new ResizeObserver(()=>root.documentElement.style.setProperty('--aerial-help-height',aerialHelp.getBoundingClientRect().height+'px')).observe(aerialHelp);
 let revealed=false,enabled=false,staircases=false,mapRevealed=false,fullMap=false,doorsUnlocked=false,overlay=null,pending=null,map=null,mapPending=null,planPending=null;
 const readPlan=()=>planPending??=(async()=>plan())().catch(error=>{planPending=null;throw error;});
 function sync(){
  toggle.hidden=!revealed;toggle.setAttribute('aria-pressed',String(enabled));shortcuts.hidden=!enabled;
  stairs?.setAttribute('aria-pressed',String(staircases));mapToggle?.setAttribute('aria-pressed',String(fullMap));
  if(doorsToggle){doorsToggle.hidden=!onDoorsChange;doorsToggle.setAttribute('aria-pressed',String(doorsUnlocked));}
  onChange();
 }
 async function prepare(){
  if(overlay||pending)return pending;
  status.textContent='Loading staircase overlay…';
  pending=(async()=>{
   const [{createStairOverlay},data]=await Promise.all([import('./stair-overlay.mjs'),readPlan()]);
   overlay=createStairOverlay(THREE,exterior,data);status.textContent='';
  })().catch(error=>{staircases=false;sync();status.textContent='Staircase overlay could not load. Press Shift+M to retry.';console.warn('Staircase overlay unavailable',error);}).finally(()=>{pending=null;});
  return pending;
 }
 async function prepareMap(){
  if(map){map.show();return;}if(mapPending)return mapPending;
  status.textContent='Loading full map…';
  mapPending=(async()=>{
   const [{createDeveloperMap},data]=await Promise.all([loadMap(),readPlan()]);
   map=createDeveloperMap(data,{root,getState:getMapState,onClose:()=>setMap(false)});
   status.textContent='';if(fullMap)map.show();
  })().catch(error=>{setMap(false);status.textContent='Full map could not load. Press M to retry.';console.warn('Full map unavailable',error);}).finally(()=>{mapPending=null;});
  return mapPending;
 }
 function setMap(show){
  const changed=fullMap!==show;fullMap=show;if(show)mapRevealed=true;sync();
  if(!show)map?.hide();if(changed)onMapChange(show);if(show)prepareMap();
 }
 function setDoorsUnlocked(show){
  show=!!show&&enabled&&!!onDoorsChange;if(doorsUnlocked===show)return;
  doorsUnlocked=show;onDoorsChange(show);sync();
 }
 function toggleDeveloper(){enabled=!enabled;if(!enabled){staircases=false;mapRevealed=false;setDoorsUnlocked(false);setMap(false);status.textContent='';}sync();}
 function toggleStairs(){if(!enabled||!stairs)return;staircases=!staircases;sync();if(staircases)prepare();}
 function toggleMap(){if(enabled)setMap(!fullMap);}
 toggle.addEventListener('click',toggleDeveloper);stairs?.addEventListener('click',toggleStairs);mapToggle?.addEventListener('click',toggleMap);
 doorsToggle?.addEventListener('click',()=>setDoorsUnlocked(!doorsUnlocked));
 target.addEventListener('keydown',event=>{
  if(event.repeat||event.ctrlKey||event.altKey||event.metaKey)return;
  const input=event.target;
  if(input?.isContentEditable||['TEXTAREA','SELECT'].includes(input?.tagName)||(input?.tagName==='INPUT'&&!['checkbox','range'].includes(input.type)))return;
  if(event.key==='-'||(!event.shiftKey&&['Minus','NumpadSubtract'].includes(event.code))){event.preventDefault();revealed=true;toggleDeveloper();}
  else if(enabled&&(event.code==='KeyM'||event.key?.toLowerCase()==='m')){event.preventDefault();if(event.shiftKey)toggleStairs();else toggleMap();}
  else if(enabled&&onDoorsChange&&!event.shiftKey&&(event.code==='KeyU'||event.key?.toLowerCase()==='u')){event.preventDefault();setDoorsUnlocked(!doorsUnlocked);}
 });
 sync();if(staircases)prepare();
 return {get enabled(){return enabled;},get doorsUnlocked(){return doorsUnlocked;},setDoorsUnlocked,get staircases(){return staircases;},get overlay(){return overlay;},get fullMap(){return fullMap;},get mapRevealed(){return mapRevealed;},get map(){return map;},render(renderer,camera){if(enabled&&staircases&&overlay)overlay.render(renderer,camera);}};
}
