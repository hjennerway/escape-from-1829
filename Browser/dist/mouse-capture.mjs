// Resume only after capture is confirmed. Chrome briefly rejects requests after
// its native Escape gesture; retry that rejection within the same engagement.
export function createMouseCapture(canvas,{enabled=true,document:target=document,onLost=()=>{}}={}){
 let pending=null,wanted=false;
 function clear(){
  const request=pending;pending=null;
  if(request){clearTimeout(request.timeout);clearTimeout(request.retry);}
  return request;
 }
 function release(){wanted=false;clear();if(target.pointerLockElement===canvas)target.exitPointerLock?.();}
 function complete(){
  if(target.pointerLockElement!==canvas)return;
  const request=clear();request?.ready();
 }
 function fail(request){
  if(pending!==request)return;
  wanted=false;clear();request.failed();
 }
 function rejected(request,error){
  if(pending!==request)return;
  if(target.hidden||target.hasFocus?.()===false){fail(request);return;}
  if(error&&error.name!=='NotAllowedError'){fail(request);return;}
  // Error events and Promise rejections can both describe the same request.
  // Space retries beyond Chrome's 1.25s Escape cooldown. Rapid retries also
  // count toward its lock-request rate limit, making capture less reliable.
  if(!request.retry)request.retry=setTimeout(()=>{request.retry=null;attempt(request);},1400);
 }
 function attempt(request){
  if(pending!==request)return;
  if(target.hidden||target.hasFocus?.()===false){fail(request);return;}
  try{
   const result=canvas.requestPointerLock();request.promise=!!result?.then;
   result?.then(()=>{if(pending===request)complete();},error=>rejected(request,error));
  }catch(error){rejected(request,error);}
 }
 target.addEventListener('pointerlockchange',()=>{
  if(target.pointerLockElement===canvas){
   if(wanted)complete();else target.exitPointerLock?.();
  }else if(wanted&&!pending){wanted=false;onLost();}
 });
 target.addEventListener('pointerlockerror',()=>{if(pending&&!pending.promise)rejected(pending);});
 return {
  get pending(){return !!pending;},
  release,
  request(ready=()=>{},failed=()=>{}){
   if(pending)return;
   if(!enabled||!canvas.requestPointerLock){ready();return;}
   wanted=true;
   if(target.pointerLockElement===canvas){ready();return;}
   const request=pending={ready,failed,retry:null,promise:false};
   request.timeout=setTimeout(()=>fail(request),3500);
   attempt(request);
  }
 };
}
