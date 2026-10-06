export function createInteriorLoadingStatus(document,loader){
 const panel=document.createElement('div'),text=document.createElement('span'),retry=document.createElement('button');panel.id='roomPreparing';panel.setAttribute('role','status');panel.style.cssText='position:fixed;right:1rem;bottom:7rem;z-index:20;padding:.8rem 1rem;background:#19281eed;color:#eee9d9;border-radius:.25rem;font:14px sans-serif';
 retry.textContent='Try again';retry.style.cssText='margin-left:.8rem';retry.onclick=()=>loader.retry();panel.append(text,retry);document.body.append(panel);panel.hidden=true;
 return ()=>{panel.hidden=!loader.holding;text.textContent=loader.failed?'This area could not be prepared.':'Preparing the next room…';retry.hidden=!loader.failed;};
}
