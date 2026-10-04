// One neutral damask tile supplies all three room colours. These original
// canvas ornaments follow the owner's floral reference without image downloads.
export function paintRoomWallpaper(g,n){
 g.fillStyle='#ded7c8';g.fillRect(0,0,n,n);
 function leaf(x,y,angle,size){
  g.save();g.translate(x,y);g.rotate(angle);g.scale(size,size);
  g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-7,-5,-10,-16,0,-29);
  g.bezierCurveTo(8,-21,10,-10,0,0);g.fill();
  g.strokeStyle='#d4cdbc';g.lineWidth=.65;g.beginPath();g.moveTo(0,-3);g.lineTo(0,-23);g.stroke();g.restore();
 }
 function flower(x,y,r){
  for(let i=0;i<6;i++){
   g.save();g.translate(x,y);g.rotate(i*Math.PI/3);
   g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-r*.45,-r*.35,-r*.6,-r*.92,-r*.12,-r);
   g.bezierCurveTo(-r*.1,-r*1.3,r*.46,-r*1.12,r*.4,-r*.78);g.bezierCurveTo(r*.42,-r*.45,r*.1,-r*.15,0,0);g.fill();
   g.strokeStyle='#d4cdbc';g.lineWidth=.7;g.beginPath();g.moveTo(0,-r*.22);g.quadraticCurveTo(r*.08,-r*.45,r*.03,-r*.82);g.stroke();g.restore();
  }
  g.beginPath();g.arc(x,y,r*.22,0,Math.PI*2);g.fill();
 }
 function ornament(x,y){
  g.save();g.translate(x,y);g.scale(n/512*1.12,n/512);g.fillStyle='#817c6e';
  for(const side of [-1,1]){
   g.save();g.scale(side,1);g.strokeStyle='#817c6e';g.lineWidth=2.2;
   g.beginPath();g.moveTo(0,106);g.bezierCurveTo(98,87,107,8,50,-94);g.stroke();
   const branches=[[37,92,1.0],[61,75,.75],[77,52,.45],[84,25,.22],[81,-3,-.1],[73,-31,-.4],[62,-57,-.6],[50,-80,-.8]];
   for(const [lx,ly,a] of branches){leaf(lx,ly,a+1.1,.70);leaf(lx,ly,a-.6,.58);}
   g.beginPath();g.moveTo(0,87);g.bezierCurveTo(48,71,29,38,18,62);g.bezierCurveTo(10,84,44,89,46,59);g.stroke();
   g.beginPath();g.moveTo(0,73);g.bezierCurveTo(35,21,18,-24,10,-53);g.stroke();
   for(const [lx,ly,a,s] of [[13,44,.85,.8],[20,19,1.1,.8],[20,-6,.95,.72],[14,-30,.7,.65],[5,-52,.6,.5]])leaf(lx,ly,a,s);
   for(const [lx,ly,r] of [[40,18,14],[36,-14,15],[29,-44,15],[20,-73,14],[7,-97,12]])flower(lx,ly,r);
   flower(56,-101,9);leaf(62,-109,-.6,.65);g.restore();
  }
  flower(0,-120,10);flower(0,-67,14);flower(0,-25,15);flower(0,10,14);
  g.beginPath();g.moveTo(-14,44);g.bezierCurveTo(-19,80,-10,101,0,102);
  g.bezierCurveTo(10,101,19,80,14,44);g.lineTo(9,49);g.bezierCurveTo(12,74,8,90,0,92);
  g.bezierCurveTo(-8,90,-12,74,-9,49);g.closePath();g.fill();
  flower(0,122,8);g.restore();
 }
 // Staggered repeats wrap identical ornaments over every edge.
 for(let row=-1;row<=2;row++)for(let col=-1;col<=2;col++)ornament((col+(row%2?.5:0))*n/2,row*n/2);
 let seed=904;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 // Soft age stains and rubbed ink vary independently of the floral repeats.
 // Every mark wraps across the tile edges, keeping the shared map seamless.
 for(let i=0;i<48;i++){
  const x=random()*n,y=random()*n,r=n*(.04+random()*.14),faded=i%3===0;
  const colour=faded?'222,215,200':'91,81,62',strength=faded?.20+random()*.12:.07+random()*.06;
  for(const dx of [-n,0,n])for(const dy of [-n,0,n]){
   const stain=g.createRadialGradient(x+dx,y+dy,0,x+dx,y+dy,r);
   stain.addColorStop(0,`rgba(${colour},${strength})`);stain.addColorStop(1,`rgba(${colour},0)`);
   g.fillStyle=stain;g.fillRect(x+dx-r,y+dy-r,r*2,r*2);
  }
 }
 for(let i=0;i<210;i++){
  const x=random()*n,y=random()*n,w=n*(.003+random()*.014),h=n*(.0008+random()*.003);
  g.fillStyle=i%4?'rgba(222,215,200,.28)':'rgba(106,96,77,.14)';
  for(const dx of [-n,0,n])for(const dy of [-n,0,n]){
   g.beginPath();g.moveTo(x+dx,y+dy);g.lineTo(x+dx+w*.65,y+dy-h);
   g.lineTo(x+dx+w,y+dy);g.lineTo(x+dx+w*.3,y+dy+h);g.closePath();g.fill();
  }
 }
 const pixels=g.getImageData(0,0,n,n);
 for(let i=0;i<pixels.data.length;i+=4){const wear=(random()-.5)*12;for(let k=0;k<3;k++)pixels.data[i+k]+=wear;}
 g.putImageData(pixels,0,0);
}

export function paintRoomDado(g,n){
 g.fillStyle='#e3dece';g.fillRect(0,0,n,n);
 let seed=1840;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 for(let i=0;i<95;i++){
  const x=random()*n,y=random()*n,r=8+random()*55;
  for(const dx of [-n,0,n])for(const dy of [-n,0,n]){
   const stain=g.createRadialGradient(x+dx,y+dy,0,x+dx,y+dy,r);
   stain.addColorStop(0,'rgba(100,91,71,.06)');stain.addColorStop(1,'rgba(100,91,71,0)');
   g.fillStyle=stain;g.fillRect(x+dx-r,y+dy-r,r*2,r*2);
  }
 }
 for(let i=0;i<180;i++){
  const x=random()*n,y=random()*n,w=1+random()*7,h=.4+random()*2;
  g.fillStyle=i%3?'rgba(133,122,99,.18)':'rgba(252,248,231,.36)';
  for(const dx of [-n,0,n])for(const dy of [-n,0,n])g.fillRect(x+dx,y+dy,w,h);
 }
 const pixels=g.getImageData(0,0,n,n);
 for(let i=0;i<pixels.data.length;i+=4){const wear=(random()-.5)*6;for(let k=0;k<3;k++)pixels.data[i+k]+=wear;}
 g.putImageData(pixels,0,0);
}
