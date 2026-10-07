// A rough, wavering hinge sound, synthesized locally without an audio download.
export function createDoorCreakAudio({getContext,enabled=()=>true}){
 const buffers=new Map(),playing=new Map();
 function buffer(ctx,opening,duration){
  const key=[ctx.sampleRate,opening,duration].join(':');if(buffers.has(key))return buffers.get(key);
  const sound=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),data=sound.getChannelData(0);
  let phase=0,grain=0,seed=opening?1829:1931;
  for(let i=0;i<data.length;i++){
   const t=i/ctx.sampleRate,u=t/duration;
   seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;const noise=(seed>>>0)/2147483648-1;
   grain+=.16*(noise-grain);
   const pitch=(opening?145+240*u:385-235*u)+24*Math.sin(t*31)+11*Math.sin(t*83);
   phase+=Math.PI*2*pitch/ctx.sampleRate;
   const friction=.55+.45*Math.sin(t*47+3*Math.sin(t*12))**2;
   const envelope=Math.min(1,t/.04,(duration-t)/.12)*Math.sin(Math.PI*u)**.45;
   data[i]=envelope*friction*(.38*Math.sin(phase)+.17*Math.sin(phase*2.01)+.09*Math.sin(phase*3)+.13*grain+.055*noise);
  }
  buffers.set(key,sound);return sound;
 }
 function stop(id){
  const source=playing.get(id);if(!source)return;playing.delete(id);source.stop();
 }
 return {play({id,opening,duration=.95}){
  stop(id);const ctx=getContext();if(!enabled()||ctx?.state!=='running')return;
  const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer(ctx,opening,duration);gain.gain.value=.16;
  source.connect(gain);gain.connect(ctx.destination);playing.set(id,source);
  source.onended=()=>{source.disconnect();gain.disconnect();if(playing.get(id)===source)playing.delete(id);};source.start();
 },stop(){for(const id of [...playing.keys()])stop(id);}};
}
