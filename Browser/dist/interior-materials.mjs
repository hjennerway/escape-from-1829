// Deterministic, local finishes: no network images or per-brick draw calls.
export function createInteriorMaterials(THREE, document) {
  let seed=1829;
  const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  function canvasTexture(paint,size=1024){
    if(!document)return null;
    const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
    const g=canvas.getContext('2d');paint(g,size);
    const texture=new THREE.CanvasTexture(canvas);
    texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=4;return texture;
  }
  function grain(g,n,amount){
    const pixels=g.getImageData(0,0,n,n);
    for(let i=0;i<pixels.data.length;i+=4){const noise=(random()-.5)*amount;for(let k=0;k<3;k++)pixels.data[i+k]+=noise;}
    g.putImageData(pixels,0,0);
  }
  function stains(g,n,count,strength){
    for(let i=0;i<count;i++){
      const x=random()*n,y=random()*n,r=15+random()*n*.14;
      const gradient=g.createRadialGradient(x,y,0,x,y,r);
      gradient.addColorStop(0,`rgba(66,53,39,${strength})`);gradient.addColorStop(1,'rgba(66,53,39,0)');
      g.fillStyle=gradient;g.fillRect(x-r,y-r,r*2,r*2);
    }
  }
  function flake(g,x,y,r,color){
    g.fillStyle=color;g.beginPath();
    for(let i=0;i<18;i++){const a=i/18*Math.PI*2,rad=r*(.55+random()*.45);const px=x+Math.cos(a)*rad,py=y+Math.sin(a)*rad*.65;i?g.lineTo(px,py):g.moveTo(px,py);}
    g.closePath();g.fill();
  }
  const brick=painted=>canvasTexture((g,n)=>{
    g.fillStyle=painted?'#b9b3a3':'#a39b8e';g.fillRect(0,0,n,n);
    const row=n/16,col=n/8;
    for(let y=0;y<16;y++)for(let x=-1;x<8;x++){
      const px=x*col+(y%2)*col/2,py=y*row;
      const v=Math.floor(random()*15);
      g.fillStyle=painted?`rgb(${204+v},${198+v},${180+v})`:`rgb(${128+v},${65+v},${53+v})`;
      g.fillRect(px+3,py+3,col-6,row-6);
      g.fillStyle=painted?'#e0d9c6':'#b0826e';g.fillRect(px+4,py+3,col-8,1.5);
      g.fillStyle=painted?'#aaa493':'#725648';g.fillRect(px+4,py+row-4,col-8,1.5);
      for(let k=0;k<10;k++){
        g.fillStyle=painted?'rgba(115,103,85,.08)':'rgba(230,201,169,.09)';
        g.fillRect(px+random()*col,py+random()*row,2+random()*24,1+random()*3);
      }
    }
    stains(g,n,45,painted?.12:.17);
    if(painted)for(let i=0;i<60;i++){
      const x=random()*n,y=random()*n,r=2+random()*11;
      flake(g,x,y,r,'#b0a795');flake(g,x,y,r*.65,'#978775');
    }
    grain(g,n,painted?10:20);
  });
  const ceiling=canvasTexture((g,n)=>{
    g.fillStyle='#cbc8bc';g.fillRect(0,0,n,n);stains(g,n,70,.09);
    for(let i=0;i<16;i++){
      const x=random()*n,y=random()*n,r=20+random()*100;
      flake(g,x,y,r,'#a39c8d');flake(g,x-2,y-3,r*.95,'#b8b0a0');
    }
    g.strokeStyle='#969184';g.lineWidth=1;
    for(let i=0;i<7;i++){
      let x=random()*n,y=random()*n;g.beginPath();g.moveTo(x,y);
      for(let k=0;k<7;k++){x+=random()*30-10;y+=random()*35;g.lineTo(x,y);}g.stroke();
    }
    grain(g,n,9);
  });
  const floor=canvasTexture((g,n)=>{
    g.fillStyle='#6b665c';g.fillRect(0,0,n,n);
    for(let y=0;y<2;y++)for(let x=0;x<3;x++){
      const v=Math.floor(random()*14),px=x*n/3,py=y*n/2;
      g.fillStyle=`rgb(${145+v},${137+v},${119+v})`;g.fillRect(px+3,py+3,n/3-6,n/2-6);
      g.strokeStyle='rgba(221,211,190,.35)';g.lineWidth=2;g.strokeRect(px+5,py+5,n/3-10,n/2-10);
    }
    stains(g,n,90,.17);
    g.strokeStyle='rgba(66,60,51,.22)';g.lineWidth=1.5;
    for(let i=0;i<95;i++){const x=random()*n,y=random()*n;g.beginPath();g.moveTo(x,y);g.lineTo(x+random()*60,y+random()*4);g.stroke();}
    grain(g,n,14);
  });
  const brickMap=brick(false),plasterMap=brick(true);
  function material(color,map,tileSize,extra={}){
    const m=new THREE.MeshStandardMaterial({color,roughness:.94,...(map?{map,bumpMap:map,bumpScale:.018}:{}),...extra});
    if(!map)return m;
    // Project in building coordinates so scaled instances keep brick/slab size,
    // courses meet at corners, and both floors use the same cached textures.
    m.onBeforeCompile=shader=>{
      shader.vertexShader='varying vec3 vFinishPosition;\nvarying vec3 vFinishNormal;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
        vec4 finishPosition=vec4(position,1.0);
        #ifdef USE_INSTANCING
          finishPosition=instanceMatrix*finishPosition;
        #endif
        vFinishPosition=finishPosition.xyz;vFinishNormal=normal;
        #ifdef USE_INSTANCING
          vFinishNormal=normalize(mat3(instanceMatrix)*normal);
        #endif`);
      shader.fragmentShader=`varying vec3 vFinishPosition;
        varying vec3 vFinishNormal;
        vec2 finishUv(){
          vec3 n=abs(vFinishNormal);
          vec2 p=n.y>.5?vFinishPosition.xz:(n.x>.5?vFinishPosition.zy:vFinishPosition.xy);
          return p/${tileSize.toFixed(3)};
        }\n`+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',THREE.ShaderChunk.map_fragment.replaceAll('vMapUv','finishUv()'));
      shader.fragmentShader=shader.fragmentShader.replace('#include <bumpmap_pars_fragment>',THREE.ShaderChunk.bumpmap_pars_fragment.replaceAll('vBumpMapUv','finishUv()'));
    };
    m.customProgramCacheKey=()=>`interior-finish-${tileSize}`;
    return m;
  }
  return {
    Floor:material(0xffffff,floor,2.5),Stone:material(0xada596),
    Plaster:material(0xffffff,plasterMap,2),Brick:material(0xffffff,brickMap,2),
    Ceiling:material(0xffffff,ceiling,5),Skirting:material(0x414745),
    RedArch:material(0x894e40),BuffArch:material(0xc5b388),
    Mortar:material(0x9c9180),Sash:material(0x9b9b88),Iron:material(0x575e59),
    Recess:material(0x303b35),Glass:material(0x768783,null,1,{emissive:0x7c8c81,emissiveIntensity:.25}),
    Panel:material(0x39443d),Brass:material(0x918263),Carpet:material(0x595d56),
    Fixture:material(0x9c9c8f),Tube:material(0xeee9d5,null,1,{emissive:0xe1e4d6,emissiveIntensity:.75}),
  };
}
