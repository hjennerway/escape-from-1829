import {WEST_RANGE_PLAN} from './west-range-plan.mjs';

// Owner's yellow ridge plan, 5 October 2026. The cross range and its four
// branches share one crown; every valley joins a ridge to an inside corner.
// These are fitted model coordinates, rather than surveyed dimensions.
export const WEST_ROOF_RIDGES=Object.freeze({
  height:17.08,z:(WEST_RANGE_PLAN.courtZ+WEST_RANGE_PLAN.gardenZ)/2,
  main:[-68,-30.6],
  branches:[[-68,17],[-58.4,3.7],[-52.5,14.5],[-37.5,18.5]]
});

export function joinWestCrossRangeRoof(THREE,{model,mesh,roof,brick,worldUV}){
  model.updateMatrixWorld(true);
  const roofs=[];
  model.traverse(o=>{if(o.isMesh&&o.material===roof&&new THREE.Box3().setFromObject(o).max.y>14.4)roofs.push(o);});
  const ray=new THREE.Raycaster();
  const oldHeight=(x,z)=>{
    ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
    return ray.intersectObjects(roofs,false)[0]?.point.y;
  };
  const {height,z}=WEST_ROOF_RIDGES;
  const ridge=x=>[x,height,z];
  const [outer,court,garden,inner]=WEST_ROOF_RIDGES.branches.map(([x,end])=>[ridge(x),[x,height,end]]);
  const end=ridge(WEST_ROOF_RIDGES.main[1]);
  const wc=[-72.4,15.47,4.6],wf=[-72.4,15.47,20.9],of=[-63.6,15.47,20.9],og=[-63.6,15.47,13.9];
  const step0=[-65.95,15.47,4.6],step1=[-65.95,14.53,6.6],step2=[-61.8775,14.53,6.6];
  const cl=[-61.8775,15.5,4.74],cr=[-54.9225,15.5,4.74];
  const cls=[-61.8775,15.5,3.802],crs=[-54.9225,15.5,3.802];
  const clf=[-60.13875,15.5,1.39],crf=[-56.66125,15.5,1.39];
  const gl=[-55.817,15.1,13.9],gr=[-49.183,15.1,13.9];
  const gls=[-55.817,15.1,15.944],grs=[-49.183,15.1,15.944];
  const glf=[-53.7305,15.1,17.96],grf=[-51.2695,15.1,17.96];
  const il=[-40.4,14.53,13.9],ir=[-34.6,14.53,15.5],ilf=[-40.4,14.53,21.6],irf=[-34.6,14.53,21.6];
  // The eastern end joins the retained lower Reception/rear-arm roofs.
  // Sample their actual planes at every crease, avoiding a raised slate lip.
  function seam(axis,fixed,start,finish,floor=0){
    const fixedIndex=axis==='x'?0:2,varyingIndex=axis==='x'?2:0,intervals=[],cuts=[start,finish];
    for(const o of roofs){
      const bounds=new THREE.Box3().setFromObject(o);
      if(fixed<bounds.min.getComponent(fixedIndex)-1e-5||fixed>bounds.max.getComponent(fixedIndex)+1e-5)continue;
      const source=o.geometry.index?o.geometry.toNonIndexed():o.geometry,p=source.attributes.position;
      for(let i=0;i<p.count;i+=3){
        const triangle=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(o.matrixWorld).toArray()),points=[];
        for(let j=0;j<3;j++){
          const a=triangle[j],b=triangle[(j+1)%3],da=a[fixedIndex]-fixed,db=b[fixedIndex]-fixed;
          if(Math.abs(da)<1e-6)points.push([a[varyingIndex],a[1]]);
          if(da*db<0){const t=da/(da-db);points.push([a[varyingIndex]+(b[varyingIndex]-a[varyingIndex])*t,a[1]+(b[1]-a[1])*t]);}
        }
        points.sort((a,b)=>a[0]-b[0]);
        if(points.length<2)continue;
        const a=points[0],b=points.at(-1);
        if(b[0]-a[0]<1e-6||b[0]<start||a[0]>finish)continue;
        const m=(b[1]-a[1])/(b[0]-a[0]),c=a[1]-m*a[0],left=Math.max(start,a[0]),right=Math.min(finish,b[0]);
        intervals.push({left,right,m,c});cuts.push(left,right);
        if(floor&&Math.abs(m)>1e-9){const t=(floor-c)/m;if(t>left&&t<right)cuts.push(t);}
      }
      if(source!==o.geometry)source.dispose();
    }
    for(let i=0;i<intervals.length;i++)for(let j=0;j<i;j++){
      const a=intervals[i],b=intervals[j];if(Math.abs(a.m-b.m)<1e-9)continue;
      const t=(b.c-a.c)/(a.m-b.m);if(t>Math.max(a.left,b.left)&&t<Math.min(a.right,b.right))cuts.push(t);
    }
    return cuts.sort((a,b)=>a-b).filter((t,i,a)=>!i||t-a[i-1]>1e-5).map(t=>{
      const x=axis==='x'?fixed:t,z=axis==='x'?t:fixed;
      return [x,Math.max(floor,oldHeight(x,z)??floor),z];
    });
  }
  const courtSeam=[...seam('z',4.6,-38,-31,14.53),...seam('z',4.6,-31,-27).slice(1)];
  const eastSeam=seam('x',-27,4.6,15.5),eastCourt=eastSeam[0],eastGarden=eastSeam.at(-1);
  const faces=[
    {name:'West end continuous slate roof',polygons:[[outer[0],outer[1],wf,wc],[outer[0],wc,step0]]},
    {name:'West front outer arm slate roof',polygons:[[outer[0],og,of,outer[1]],[outer[1],of,wf]]},
    {name:'West courtyard polygonal bay slate roof',polygons:[[court[0],court[1],cls,cl],[court[1],clf,cls],[court[1],crf,clf],[court[1],crs,crf],[court[0],cr,crs,court[1]]]},
    {name:'West curved bay slate roof',polygons:[[garden[0],gl,gls,garden[1]],[garden[1],gls,glf],[garden[1],glf,grf],[garden[1],grf,grs],[garden[0],garden[1],grs,gr]]},
    {name:'West garden inner pavilion slate roof',polygons:[[inner[0],il,ilf,inner[1]],[inner[1],ilf,irf],[inner[0],inner[1],irf,ir]]},
    {name:'West cross-range continuous roof join',polygons:[
      [outer[0],step0,step1,step2,cl,court[0]],
      [court[0],cr,[-53.9,14.53,4.6],...courtSeam,end,inner[0],garden[0]],
      [outer[0],garden[0],gl,og],
      [garden[0],inner[0],il,gr],
      [inner[0],end,eastGarden,ir],
      ...eastSeam.slice(1).map((p,i)=>[end,eastSeam[i],p])
    ]}
  ];
  // The short raised edge over the lower rear arm needs a brick return down
  // to its retained slate, continuing the existing masonry at this junction.
  if(brick){
    const positions=[];
    for(let i=1;i<courtSeam.length;i++){
      const a=courtSeam[i-1],b=courtSeam[i],ay=oldHeight(a[0],a[2])??13.06,by=oldHeight(b[0],b[2])??13.06;
      if(a[1]-ay<.001&&b[1]-by<.001)continue;
      const lowA=[a[0],ay-.04,a[2]],lowB=[b[0],by-.04,b[2]];
      for(const p of [lowA,a,b,lowA,b,lowB])positions.push(...p);
    }
    if(positions.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(positions.length/3*2),2));g.computeVertexNormals();mesh(worldUV(g,1.7),brick,0,0,0,true).name='West cross-range raised roof edge masonry';}
  }
  const lerp=(p,q,t)=>p.map((v,i)=>v+(q[i]-v)*t);
  function geometry(polygons){
    const positions=[],uv=[];
    for(const polygon of polygons){
      const triangles=THREE.ShapeUtils.triangulateShape(polygon.map(p=>new THREE.Vector2(p[0],p[2])),[]);
      for(const indices of triangles){
        const [a,b,c]=indices.map(i=>polygon[i]);
        const upward=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]);
        if(Math.abs(upward)<1e-9)continue;
        for(const p of upward>0?[a,b,c]:[a,c,b]){positions.push(...p);uv.push(p[0]/3,(p[2]+p[1])/3);}
      }
    }
    const result=new THREE.BufferGeometry();result.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    result.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));result.computeVertexNormals();return result;
  }
  // Subtract each new triangle in plan from the previous intersecting hips,
  // including their concealed faces. Preserve UVs and the remaining slopes.
  const patches=faces.flatMap(f=>f.polygons.flatMap(p=>THREE.ShapeUtils.triangulateShape(p.map(v=>new THREE.Vector2(v[0],v[2])),[]).map(t=>{
    const outline=t.map(i=>[p[i][0],p[i][2]]);
    const [a,b,c]=outline;
    if((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])<0)outline.reverse();
    return outline;
  })));
  function outside(polygon,outline){
    const fragments=[];let remainder=polygon;
    for(let i=0;i<outline.length&&remainder.length>=3;i++){
      const a=outline[i],b=outline[(i+1)%outline.length],inside=[],out=[];
      const side=p=>(b[0]-a[0])*(p[2]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
      for(let j=0;j<remainder.length;j++){
        const p=remainder[j],q=remainder[(j+1)%remainder.length],dp=side(p),dq=side(q);
        if(dp>=-1e-7)inside.push(p);if(dp<=1e-7)out.push(p);
        if((dp>1e-7&&dq< -1e-7)||(dp< -1e-7&&dq>1e-7)){
          const v=lerp(p,q,dp/(dp-dq));inside.push(v);out.push(v);
        }
      }
      if(out.length>=3)fragments.push(out);remainder=inside;
    }
    return fragments;
  }
  for(const o of roofs){
    const bounds=new THREE.Box3().setFromObject(o);
    if(bounds.max.x< -72.4||bounds.min.x> -27||bounds.max.z<1.39||bounds.min.z>21.6)continue;
    const source=o.geometry.index?o.geometry.toNonIndexed():o.geometry,p=source.attributes.position,uv=source.attributes.uv;
    const positions=[],tex=[],toLocal=o.matrixWorld.clone().invert();
    for(let i=0;i<p.count;i+=3){
      let polygons=[[0,1,2].map(j=>[...new THREE.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(o.matrixWorld).toArray(),uv.getX(i+j),uv.getY(i+j)])];
      for(const patch of patches)polygons=polygons.flatMap(polygon=>outside(polygon,patch));
      for(const polygon of polygons)for(let j=1;j<polygon.length-1;j++){
        const [a,b,c]=[polygon[0],polygon[j],polygon[j+1]];
        if(Math.abs((b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]))<1e-8)continue;
        for(const v of [a,b,c]){positions.push(...new THREE.Vector3(...v.slice(0,3)).applyMatrix4(toLocal).toArray());tex.push(...v.slice(3));}
      }
    }
    const result=new THREE.BufferGeometry();result.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));result.setAttribute('uv',new THREE.Float32BufferAttribute(tex,2));result.computeVertexNormals();
    if(source!==o.geometry)source.dispose();o.geometry.dispose();o.geometry=result;
  }
  for(const {name,polygons} of faces){
    const result=geometry(polygons),existing=model.getObjectByName(name);
    if(existing){result.applyMatrix4(existing.matrixWorld.clone().invert());existing.geometry.dispose();existing.geometry=result;}
    else mesh(result,roof,0,0,0,true).name=name;
  }
}
