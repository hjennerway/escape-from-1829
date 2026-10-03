// A quiet clock only sounds near Reception on the ground floor.
export function createReceptionClockAudio({getFloors,getContext,enabled=()=>true,startSeconds=10*3600+10*60}){
 let seconds=startSeconds,lastTick=Math.floor(seconds),lastHour=Math.floor(seconds/3600),strikes=0,nextStrike=0;
 function note(ctx,hz,length,gain,harmonic=false){
  const time=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
  o.type='sine';o.frequency.setValueAtTime(hz,time);if(!harmonic)o.frequency.exponentialRampToValueAtTime(hz*.65,time+length);
  g.gain.setValueAtTime(.0001,time);g.gain.linearRampToValueAtTime(gain,time+.004);g.gain.exponentialRampToValueAtTime(.0001,time+length);
  o.connect(g);g.connect(ctx.destination);o.onended=()=>{o.disconnect();g.disconnect();};o.start(time);o.stop(time+length);
 }
 return {update(actor,dt){
  if(dt<=0)return;
  seconds+=dt;const tick=Math.floor(seconds),hour=Math.floor(seconds/3600),clock=getFloors()[0]?.furniture?.find(i=>i.kind==='longcaseClock');
  const distance=clock?Math.hypot(actor.x-clock.x,actor.z-clock.z):Infinity;
  const ctx=!actor.outside&&actor.floor===0&&distance<9&&enabled()?getContext():null;
  const gain=ctx?.state==='running' ? .018*(1-distance/9)**2 : 0;
  if(tick!==lastTick){if(gain)note(ctx,tick%2?1550:1250,.045,gain);lastTick=tick;}
  if(hour!==lastHour){strikes=hour%12||12;nextStrike=seconds;lastHour=hour;}
  if(strikes&&seconds>=nextStrike){
   if(gain){note(ctx,480,1.05,gain*2.7,true);note(ctx,720,.65,gain*.8,true);}
   strikes--;nextStrike=seconds+.95;
  }
 },get seconds(){return seconds;}};
}
