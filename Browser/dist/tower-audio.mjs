// Short, synthesized water drops and resonant stair/yard footsteps. No loop
// outlives a pause; the game schedules sounds only while play advances.
export function createTowerAudio({getContext,enabled=()=>true}){
 const active=new Set();
 function stop(){for(const o of active){try{o.stop();}catch{}}active.clear();}
 function play(kind,volume=1){
  const ctx=getContext();if(!enabled()||ctx?.state!=='running')return;
  const drop=kind==='drip',yard=kind==='yard',frequency=drop?1100:yard?74:145,duration=drop?.17:.12;
  for(const [delay,level] of [[0,1],[.18,.32],[.37,.12]]){
   const o=ctx.createOscillator(),gain=ctx.createGain(),at=ctx.currentTime+delay;
   o.type=drop?'sine':'triangle';o.frequency.setValueAtTime(frequency,at);o.frequency.exponentialRampToValueAtTime(drop?430:frequency*.4,at+duration);
   gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime((drop?.027:yard?.03:.018)*level*volume,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
   o.connect(gain);gain.connect(ctx.destination);active.add(o);o.onended=()=>{active.delete(o);o.disconnect();gain.disconnect();};o.start(at);o.stop(at+duration+.01);
  }
 }
 return {play,stop};
}
