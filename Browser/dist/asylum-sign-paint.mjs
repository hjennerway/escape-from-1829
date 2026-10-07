// Shared aged cream-painted timber for floor and door plaques. Paint in a
// fixed design space so atlas tiles and standalone boards keep the same style.
export function paintAsylumSign(g,lines,{x=0,y=0,width=1024,height=320,seed:paintSeed=1829}={}){
 g.save();g.translate(x,y);g.scale(width/1024,height/320);
 let seed=paintSeed;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 g.fillStyle='#544331';g.fillRect(0,0,1024,320);
 const wash=g.createLinearGradient(0,0,0,320);wash.addColorStop(0,'#c6b997');wash.addColorStop(.42,'#e0d4b5');wash.addColorStop(1,'#b8aa89');
 g.fillStyle=wash;g.fillRect(9,8,1006,304);
 // Uneven old paint, horizontal timber grain and water stains stay behind the
 // lettering. Seeded wear makes source, compiled and fallback signs identical.
 for(let i=0;i<9000;i++){
  g.fillStyle=random()>.5?'rgba(74,55,30,.07)':'rgba(255,246,212,.12)';
  g.fillRect(9+random()*1006,8+random()*304,1+random()*5,1+random()*2);
 }
 for(let i=0;i<75;i++){
  g.strokeStyle='rgba(76,56,32,.07)';g.lineWidth=.5+random();g.beginPath();const y=15+random()*290,x=random()*1024;g.moveTo(x,y);g.lineTo(Math.min(1015,x+50+random()*320),y+random()*2);g.stroke();
 }
 for(let i=0;i<18;i++){
  const x=random()*1024,y=random()*320,r=20+random()*85,stain=g.createRadialGradient(x,y,0,x,y,r);
  stain.addColorStop(0,'rgba(90,61,26,.08)');stain.addColorStop(1,'rgba(90,61,26,0)');g.fillStyle=stain;g.fillRect(x-r,y-r,r*2,r*2);
 }
 g.strokeStyle='#685b42';g.lineWidth=3;g.strokeRect(28,27,968,266);g.lineWidth=1;g.strokeRect(34,33,956,254);
 g.fillStyle='#342f24';g.textAlign='center';g.textBaseline='middle';
 for(const [i,line] of lines.entries()){
  const text=line.toUpperCase();let size=lines.length===1?112:(i===0?90:64);g.font=`${size}px Georgia, 'Times New Roman', serif`;
  while(size>12&&g.measureText(text).width>870)g.font=`${--size}px Georgia, 'Times New Roman', serif`;
  g.fillText(text,512,165+(i-(lines.length-1)/2)*100);
 }
 // Fine scratches through the ink suggest wear without sacrificing legibility.
 for(let i=0;i<100;i++){g.fillStyle='rgba(216,202,166,.28)';g.fillRect(75+random()*874,115+random()*93,1+random()*8,.5+random());}
 for(let i=0;i<260;i++){
  const edge=Math.floor(random()*4),x=edge<2?random()*1024:(edge===2?9:1015),y=edge<2?(edge===0?8:312):random()*320;
  g.fillStyle=random()>.6?'#796044':'#55422e';g.fillRect(x-random()*6,y-random()*4,2+random()*15,2+random()*7);
 }
 for(const x of [52,972])for(const y of [52,268]){
  g.fillStyle='rgba(98,61,24,.22)';g.beginPath();g.arc(x+2,y+2,10,0,Math.PI*2);g.fill();
  g.fillStyle='#69604a';g.beginPath();g.arc(x,y,6,0,Math.PI*2);g.fill();g.strokeStyle='#312d23';g.lineWidth=2;g.beginPath();g.moveTo(x-4,y-2);g.lineTo(x+4,y+2);g.stroke();
 }
 g.restore();
}

export function asylumSignTexture(THREE,lines,{seed=1829,name='Aged asylum sign',document=globalThis.document}={}){
 const canvas=document?.createElement('canvas');if(!canvas)return null;
 canvas.width=1024;canvas.height=320;paintAsylumSign(canvas.getContext('2d'),lines,{seed});
 const texture=new THREE.CanvasTexture(canvas);texture.name=name;texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}

export function asylumSignGeometry(THREE,width,height,depth){
 const geometry=new THREE.BoxGeometry(width,height,depth),uv=geometry.attributes.uv;
 // Lettering belongs to the front; the back and thin edges expose timber.
 for(const group of geometry.groups)if(group.materialIndex!==4){
  const vertices=new Set();for(let i=group.start;i<group.start+group.count;i++)vertices.add(geometry.index.getX(i));
  for(const vertex of vertices)uv.setXY(vertex,.002+uv.getX(vertex)*.004,.002+uv.getY(vertex)*.004);
 }
 return geometry;
}
