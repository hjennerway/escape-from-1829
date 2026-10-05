import {WEST_RANGE_PLAN} from './west-range-plan.mjs';

// Owner's yellow ridge plan, 5 October 2026. The cross range and its four
// branches share one crown; every valley joins a ridge to an inside corner.
// These are fitted model coordinates, rather than surveyed dimensions.
export const WEST_ROOF_RIDGES=Object.freeze({
  height:17.08,z:(WEST_RANGE_PLAN.courtZ+WEST_RANGE_PLAN.gardenZ)/2,
  main:[-68,-30.6],
  branches:[[-68,17],[-58.4,3.7],[-52.5,14.5],[-37.5,18.5]]
});

export function joinWestCrossRangeRoof(THREE,{model,mesh,roof,brick,white,worldUV}){
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
  const wc=[-72.4,15.47,4.6],wf=[-72.4,15.47,20.9],of=[-63.6,15.47,20.9];
  // The descending arrises end above the tall cornice, before a short
  // rendered return drops to the main range's lower eave. Sharing this
  // endpoint with both pitches avoids a slate wedge through the render.
  const step0=[-65.6,15.47,4.6],step1=[-65.6,15.47,6.6],stepLow=[-65.3,14.53,6.6],step2=[-62.05,14.53,6.6];
  // The four blue descending joins end at the actual upper cornice corners.
  // Their lower returns step outboard of the render, instead of cutting a
  // narrow slate wedge through its terminal cap. Yellow crowns stay fixed.
  const cl=[-61.75,15.45,4.8],cr=[-55.05,15.45,4.8];
  const cle=[-62.05,14.53,4.6],cre=[-54.75,14.53,4.6];
  const cls=[-61.8775,15.5,3.802],crs=[-54.9225,15.5,3.802];
  const clf=[-60.13875,15.5,1.39],crf=[-56.66125,15.5,1.39];
  const gl=[-55.79,15.05,13.45],gr=[-49.21,15.05,13.45];
  const gle=[-56.09,14.53,13.9],gre=[-48.91,14.53,13.9],oge=[-63.6,14.53,13.9];
  const outerShoulder=[-63.6,15.47,WEST_RANGE_PLAN.gardenZ-.075];
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
    {name:'West front outer arm slate roof',polygons:[[outer[0],outerShoulder,of,outer[1]],[outer[1],of,wf]]},
    {name:'West courtyard polygonal bay slate roof',polygons:[[court[0],court[1],cls,cl],[court[1],clf,cls],[court[1],crf,clf],[court[1],crs,crf],[court[0],cr,crs,court[1]]]},
    {name:'West curved bay slate roof',polygons:[[garden[0],gl,gls,garden[1]],[garden[1],gls,glf],[garden[1],glf,grf],[garden[1],grf,grs],[garden[0],garden[1],grs,gr]]},
    {name:'West garden inner pavilion slate roof',polygons:[[inner[0],il,ilf,inner[1]],[inner[1],ilf,irf],[inner[0],inner[1],irf,ir]]},
    {name:'West cross-range continuous roof join',polygons:[
      [outer[0],step0,step1],
      [outer[0],step1,stepLow],
      [outer[0],stepLow,step2,cle,court[0]],
      [court[0],cre,[-53.9,14.53,4.6],...courtSeam,end,inner[0],garden[0]],
      [outer[0],garden[0],gle],
      [outer[0],gle,outerShoulder],
      [gle,oge,outerShoulder],
      [garden[0],inner[0],il,gre],
      // Short pitched returns connect the higher pavilion/bay cornices to
      // the main range's level eaves. Sharing only their raised corners left
      // long brick wedges and open triangular roof ends above the lower trim.
      [court[0],cl,cle],[court[0],cre,cr],
      [garden[0],gl,gle],[garden[0],gre,gr],
      [inner[0],end,eastGarden,ir],
      ...eastSeam.slice(1).map((p,i)=>[end,eastSeam[i],p])
    ]}
  ];
  const lerp=(p,q,t)=>p.map((v,i)=>v+(q[i]-v)*t);
  if(white){
    const renderPrism=(name,p,bottom)=>{
      const area=p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+a[0]*b[2]-b[0]*a[2];},0);
      if(area<0)p=p.toReversed();
      const vertices=[...p.map(v=>[v[0],bottom,v[2]]),...p],n=p.length,positions=[];
      const cap=THREE.ShapeUtils.triangulateShape(p.map(v=>new THREE.Vector2(v[0],v[2])),[]);
      for(const t of cap){
        const [a,b,c]=t.map(i=>p[i]);
        const up=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]);
        const indices=up>0?t:[t[0],t[2],t[1]];
        for(const i of indices)positions.push(...vertices[i+n]);
        for(const i of indices.toReversed())positions.push(...vertices[i]);
      }
      for(let i=0;i<n;i++){
        const j=(i+1)%n;
        for(const k of [i,j+n,j,i,i+n,j+n])positions.push(...vertices[k]);
      }
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
      g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(positions.length/3*2),2));g.computeVertexNormals();
      mesh(worldUV(g,1.7),white,0,0,0,true).name=name;
    };
    // Solid fascia immediately below each sloping eave; the top follows
    // the roof instead of leaving a horizontal white cap in its middle.
    const fascia=(name,a,b,inward)=>{
      const p=[a,b,b.map((v,i)=>v+(inward[i]??0)),a.map((v,i)=>v+(inward[i]??0))];
      const bottom=Math.min(a[1],b[1])-.22;
      renderPrism(name,p,bottom);
    };
    fascia('West court descending roof render return',step1,stepLow,[0,0,-.18]);
    fascia('West garden descending roof render return',outerShoulder,oge,[-.18,0,0]);
    for(const [side,corners] of [['court',[[cl,cle,.18],[cr,cre,-.18]]],['garden',[[gl,gle,.18],[gr,gre,-.18]]]])
      for(const [i,[upper,lower,inward]] of corners.entries())
        fascia('West '+side+' bay roof render return '+i,upper,lower,[inward,0,0]);
    // Continue the terminal court cornice down to the lower trim. Its cap
    // is clipped to the adjoining pitch, so even this inner corner cannot
    // put white render above, or through, the slate.
    const mx=(stepLow[1]-step1[1])/(stepLow[0]-step1[0]);
    const mz=(outer[0][1]-step1[1]-mx*(outer[0][0]-step1[0]))/(outer[0][2]-step1[2]);
    const back=step1[2]+.18,cut=step1[0]-mz*.18/mx;
    renderPrism('West court roof corner render riser',[
      [-66.08,step1[1],step1[2]],step1,
      [step1[0],step1[1]+mz*.18,back],[cut,step1[1],back],[-66.08,step1[1],back]
    ],stepLow[1]-.22);
  }
  // The later blue guide shifts the perpendicular entrance ridge eastward.
  // Clip its pitches against the retained roofs' planes, so their yellow
  // ridges survive and every new valley is an exact surface intersection.
  const branchStart=[-25.8,15.66,12],branchEnd=[-25.8,15.66,18.3];
  const branchCorners=[[-32.4,13.4,12],[-22.2,13.4,12],[-22.2,13.4,20.1],[-32.4,13.4,20.1]];
  const branchPolygons=[
    [branchStart,branchEnd,branchCorners[3],branchCorners[0]],
    [branchStart,branchCorners[1],branchCorners[2],branchEnd],
    [branchEnd,branchCorners[2],branchCorners[3]]
  ];
  function triangles(polygons){
    return polygons.flatMap(p=>THREE.ShapeUtils.triangulateShape(p.map(v=>new THREE.Vector2(v[0],v[2])),[]).map(t=>t.map(i=>p[i])));
  }
  function outline(triangle,onlyAbove=false){
    const [a,b,c]=triangle,abx=b[0]-a[0],abz=b[2]-a[2],acx=c[0]-a[0],acz=c[2]-a[2],d=abx*acz-abz*acx;
    if(Math.abs(d)<1e-8)return null;
    const p=triangle.map(v=>[v[0],v[2]]);if(d<0)p.reverse();
    if(onlyAbove){
      const mx=((b[1]-a[1])*acz-(c[1]-a[1])*abz)/d,mz=(abx*(c[1]-a[1])-acx*(b[1]-a[1]))/d;
      p.height=v=>a[1]+mx*(v[0]-a[0])+mz*(v[2]-a[2])-v[1];
    }
    return p;
  }
  const retained=triangles(faces.flatMap(f=>f.polygons));
  for(const o of roofs){
    if(o.name==='Entrance west projection slate roof')continue;
    const b=new THREE.Box3().setFromObject(o);
    if(b.max.x< -32.4||b.min.x> -22.2||b.max.z<12||b.min.z>20.1)continue;
    const source=o.geometry.index?o.geometry.toNonIndexed():o.geometry,p=source.attributes.position;
    for(let i=0;i<p.count;i+=3)retained.push([0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(o.matrixWorld).toArray()));
    if(source!==o.geometry)source.dispose();
  }
  function geometry(polygons){
    const positions=[],uv=[];
    for(const polygon of polygons){
      const triangles=THREE.ShapeUtils.triangulateShape(polygon.map(p=>new THREE.Vector2(p[0],p[2])),[]);
      for(const indices of triangles){
        const [a,b,c]=indices.map(i=>polygon[i]);
        const upward=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]);
        if(Math.abs(upward)<1e-9)continue;
        for(const p of upward>0?[a,b,c]:[a,c,b]){positions.push(...p);uv.push(p[0]/3,p[2]/3);}
      }
    }
    const result=new THREE.BufferGeometry();result.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    result.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));result.computeVertexNormals();return result;
  }
  // Subtract each new triangle in plan from the previous intersecting hips,
  // including their concealed faces. Preserve UVs and the remaining slopes.
  const patchBounds=new Map();
  const blockers=retained.map(t=>outline(t,true)).filter(Boolean);
  const joinedBranch=triangles(branchPolygons).flatMap(t=>{
    let fragments=[t];for(const blocker of blockers)fragments=fragments.flatMap(p=>outside(p,blocker));return fragments;
  });
  faces.push({name:'Entrance west projection slate roof',polygons:joinedBranch});
  const patches=triangles(faces.flatMap(f=>f.polygons)).map(t=>outline(t)).filter(Boolean);
  // Close the raised perimeter down to the adjoining roof/wall tops. The
  // different pavilion and bay cornice heights must not leave triangular
  // holes under the new slate. Internal ridges and valleys have no infill.
  if(brick){
    const contains=(x,z)=>patches.some(p=>p.every((a,i)=>{const b=p[(i+1)%p.length];return (b[0]-a[0])*(z-a[1])-(b[1]-a[1])*(x-a[0])>=-1e-8;}));
    const positions=[];
    for(const {polygons} of faces)for(const polygon of polygons)for(let i=0;i<polygon.length;i++){
      const a=polygon[i],b=polygon[(i+1)%polygon.length],dx=b[0]-a[0],dz=b[2]-a[2],length=Math.hypot(dx,dz);
      if(length<1e-6)continue;
      const nx=dz/length,nz=-dx/length,x=(a[0]+b[0])/2,z=(a[2]+b[2])/2;
      const plus=contains(x+nx*.001,z+nz*.001),minus=contains(x-nx*.001,z-nz*.001);
      if(plus===minus)continue;
      const low=p=>[p[0],(oldHeight(p[0],p[2])??oldHeight(p[0]+(plus?nx:-nx)*.001,p[2]+(plus?nz:-nz)*.001)??p[1])-.025,p[2]];
      const count=Math.max(1,Math.ceil(length/.2));
      for(let j=0;j<count;j++){
        const p=lerp(a,b,j/count),q=lerp(a,b,(j+1)/count),lp=low(p),lq=low(q);
        if(p[1]-lp[1]<.035&&q[1]-lq[1]<.035)continue;
        lp[1]=Math.min(lp[1],p[1]);lq[1]=Math.min(lq[1],q[1]);
        for(const tri of [[lp,lq,q],[lp,q,p]])for(const v of plus?tri:[...tri].reverse())positions.push(...v);
      }
    }
    if(positions.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(positions.length/3*2),2));g.computeVertexNormals();mesh(worldUV(g,1.7),brick,0,0,0,true).name='West cross-range raised roof edge masonry';}
  }
  function outside(polygon,outline){
    let bounds=patchBounds.get(outline);
    if(!bounds){bounds={left:Math.min(...outline.map(v=>v[0])),right:Math.max(...outline.map(v=>v[0])),back:Math.min(...outline.map(v=>v[1])),front:Math.max(...outline.map(v=>v[1]))};patchBounds.set(outline,bounds);}
    if(polygon.every(p=>p[0]<bounds.left-1e-7)||polygon.every(p=>p[0]>bounds.right+1e-7)||polygon.every(p=>p[2]<bounds.back-1e-7)||polygon.every(p=>p[2]>bounds.front+1e-7))return [polygon];
    const fragments=[];let remainder=polygon;
    for(let i=0;i<outline.length+(outline.height?1:0)&&remainder.length>=3;i++){
      const a=outline[i],b=outline[(i+1)%outline.length],inside=[],out=[];
      const side=i===outline.length?outline.height:p=>(b[0]-a[0])*(p[2]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
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
    if(bounds.max.x< -72.4||bounds.min.x> -22.2||bounds.max.z<1.39||bounds.min.z>21.6)continue;
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
  // Finish the entrance slate at the inner edge of the actual upper render
  // moulding. A narrow joined pitch reaches its cap; the former roof fringe
  // is removed through the whole overhang, rather than hidden in the cornice.
  const boundary=model.getObjectByName('Entrance west mitred cornice layer 3')?.userData.roofRenderBoundary;
  if(boundary){
    model.updateMatrixWorld(true);
    const slate=[];model.traverse(o=>{if(o.isMesh&&o.material===roof)slate.push(o);});
    const sample=(x,z)=>{ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));return ray.intersectObjects(slate,false)[0]?.point.y;};
    const {inner,inboard,outside:outerBoundary}=boundary,returns=[];
    const fringes=[];
    for(let i=0;i<inner.length-1;i++){
      const a=inner[i],b=inner[i+1],c=[...inboard[i]],d=[...inboard[i+1]];
      // Match every crease of the existing roof at the inboard seam.
      const dx=d[0]-c[0],dz=d[1]-c[1],length=Math.hypot(dx,dz),cuts=[0,1];
      for(const o of slate){
        const box=new THREE.Box3().setFromObject(o);
        if(box.max.x<Math.min(c[0],d[0])||box.min.x>Math.max(c[0],d[0])||box.max.z<Math.min(c[1],d[1])||box.min.z>Math.max(c[1],d[1]))continue;
        const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry,p=g.attributes.position;
        for(let j=0;j<p.count;j+=3){const t=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,j+k).applyMatrix4(o.matrixWorld));
          for(let k=0;k<3;k++){const u=t[k],v=t[(k+1)%3],ex=v.x-u.x,ez=v.z-u.z,den=dx*ez-dz*ex;if(Math.abs(den)<1e-9)continue;
            const along=((u.x-c[0])*ez-(u.z-c[1])*ex)/den,edge=((u.x-c[0])*dz-(u.z-c[1])*dx)/den;
            if(along>0&&along<1&&edge>=0&&edge<=1)cuts.push(along);
          }
        }if(g!==o.geometry)g.dispose();
      }
      const ts=cuts.sort((a,b)=>a-b).filter((t,j,a)=>!j||t-a[j-1]>1e-5);
      const seam=ts.map(t=>{const x=c[0]+dx*t,z=c[1]+dz*t;return [x,sample(x,z)??lerp(a,b,t)[1],z];});
      for(let j=0;j<ts.length-1;j++)returns.push([lerp(a,b,ts[j]),lerp(a,b,ts[j+1]),seam[j+1],seam[j]]);
      fringes.push([[c[0],0,c[1]],[d[0],0,d[1]],[outerBoundary[i+1][0],0,outerBoundary[i+1][1]],[outerBoundary[i][0],0,outerBoundary[i][1]]]);
    }
    const trimPatches=triangles(fringes).map(t=>outline(t)).filter(Boolean);
    for(const o of slate){
      const box=new THREE.Box3().setFromObject(o);if(box.max.x< -31||box.min.x> -7||box.max.z<16||box.min.z>21)continue;
      const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry,p=g.attributes.position,uv=g.attributes.uv,positions=[],tex=[],inverse=o.matrixWorld.clone().invert();
      for(let i=0;i<p.count;i+=3){let polygons=[[0,1,2].map(j=>[...new THREE.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(o.matrixWorld).toArray(),uv.getX(i+j),uv.getY(i+j)])];
        for(const patch of trimPatches)polygons=polygons.flatMap(p=>outside(p,patch));
        for(const polygon of polygons)for(let j=1;j<polygon.length-1;j++)for(const v of [polygon[0],polygon[j],polygon[j+1]]){positions.push(...new THREE.Vector3(...v.slice(0,3)).applyMatrix4(inverse).toArray());tex.push(...v.slice(3));}
      }
      const result=new THREE.BufferGeometry();result.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));result.setAttribute('uv',new THREE.Float32BufferAttribute(tex,2));result.computeVertexNormals();if(g!==o.geometry)g.dispose();o.geometry.dispose();o.geometry=result;
    }
    mesh(geometry(returns),roof,0,0,0,true).name='Entrance west slate pitches to render edge';
  }
}
