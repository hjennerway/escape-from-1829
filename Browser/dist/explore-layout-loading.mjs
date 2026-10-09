import {buildAsylumLayout} from './asylum-layout.mjs';

// Build the exact shared walls, doors, stairs and navigation on a worker while
// the estate downloads/restores. Keep the original builder as a worker fallback.
export async function loadExploreLayout({fetchFile=fetch,makeWorker=()=>new Worker(new URL('./explore-layout-worker.mjs',import.meta.url),{type:'module'})}={}){
  const response=await fetchFile(new URL('./asylum-plan.json',import.meta.url));
  if(!response.ok)throw Error('Floor plans could not load');
  const plan=await response.json();let worker,timer;
  try{
    const floors=await new Promise((resolve,reject)=>{
      worker=makeWorker();
      worker.onmessage=({data})=>data.error?reject(Error(data.error)):resolve(data.floors);
      worker.onerror=()=>reject(Error('Floor-plan worker unavailable'));
      timer=setTimeout(()=>reject(Error('Floor-plan worker timed out')),30000);
      worker.postMessage(plan);
    });
    return {plan,floors};
  }catch{
    worker?.terminate();worker=null;
    return {plan,floors:buildAsylumLayout(plan).floors};
  }finally{clearTimeout(timer);worker?.terminate();}
}
