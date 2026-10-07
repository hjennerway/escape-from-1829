// The owner's October 7 red/yellow ridges share the existing entrance crown.
// Build the whole eastern cross-range as adjoining faces, including both bays
// and the end pavilion, before the entrance cornice cuts and eave finishing.
export function joinEastEntranceRoof(THREE,{model,mesh,roof,white,brick,worldUV}){
  model.updateMatrixWorld(true);
  const crown=15.66;
  const ridge=(x,z=12)=>[x,crown,z],edge=(x,z,y=14.55)=>[x,y,z];
  const start=ridge(38),inner=ridge(46),root=ridge(49.5);
  const garden=ridge(53.1),court=ridge(59.8),end=ridge(66.7);
  const back=[38,13.06,6.6],front=[38,13.06,17.4];
  const backStep=edge(44.7,6.6),backCorner=edge(44.7,4.1);
  // The follow-up orange cut stops on the existing diagonal crease. Keep
  // the upper triangle on its authored plane; the lower one continues the
  // entrance pitch, with its blue-marked corner at the 13.06 wall-top eave.
  const cutFraction=(backStep[0]-back[0])/(root[0]-back[0]);
  const split=back.map((v,i)=>v+(root[i]-v)*cutFraction);
  const loweredStep=[backStep[0],back[1],backStep[2]];
  const frontStep=edge(40.6,17.4),frontCorner=edge(40.6,19.9);
  const courtHalf=3.45*1.07,courtFlat=3.45*(Math.SQRT2-1)*1.07;
  const courtReturn=4.5-3.45*(Math.SQRT2-1)-.16;
  const cl=edge(59.8-courtHalf,4.1,14.6),cr=edge(63.65,4.1,14.6);
  const cls=edge(cl[0],courtReturn,14.6),crs=edge(59.8+courtHalf,courtReturn,14.6);
  const clf=edge(59.8-courtFlat,.89,14.6),crf=edge(59.8+courtFlat,.89,14.6);
  const courtTip=ridge(59.8,2.6);
  const gl=edge(53.1-2.4*1.07,19.9,14.6),gr=edge(53.1+2.4*1.07,19.9,14.6);
  const glf=edge(53.1-1.125*1.07,21.16,14.6),grf=edge(53.1+1.125*1.07,21.16,14.6);
  const gardenTip=ridge(53.1,20.1);
  const recess=edge(cr[0],6.82),returnCorner=edge(65.85,6.82,14.53);
  const endCourt=edge(65.85,4.6,14.53),outerCourt=edge(70.15,4.6,14.53);
  const outerGarden=edge(70.15,25.4,14.53),innerGarden=edge(61.85,25.4,14.53);
  const gardenCorner=edge(61.85,19.9),endBack=ridge(66.7,6.6),endFront=ridge(66.7,22.3);
  const faces=[
    ['Entrance east recessed slate roof',[
      [[6.7,13.06,6.6],back,start,ridge(11.182)],
      [ridge(11.182),start,front,[6.7,13.06,17.4]],
      [[6.7,13.06,6.6],ridge(11.182),[6.7,13.06,17.4]],
      [inner,start,back],[root,inner,split],[split,inner,back],
      [back,loweredStep,split],
      [start,inner,frontStep,front]
    ]],
    ['Redesmere aligned frontage slate roof',[
      // Keep the upper side in the higher roof mesh, so the eave finisher
      // recognizes the adjacent roof across the new vertical step.
      [backStep,root,split],
      [backStep,backCorner,root],
      [inner,root,frontCorner],[inner,frontCorner,frontStep],
      [root,backCorner,cl,court],
      [root,garden,gl,frontCorner],
      [garden,end,gardenCorner,gr],
      [court,cr,recess,returnCorner,endBack,end]
    ]],
    ['East courtyard polygonal bay slate roof',[
      [court,cl,cls,courtTip],[courtTip,cls,clf],
      [courtTip,clf,crf],[courtTip,crf,crs],[courtTip,crs,cr,court]
    ]],
    ['East curved bay slate roof',[
      [garden,gardenTip,gl],[gardenTip,glf,gl],
      [gardenTip,grf,glf],[gardenTip,gr,grf],[garden,gr,gardenTip]
    ]],
    ['Garden pavilion slate roof',[
      [end,endBack,outerCourt,outerGarden,endFront],
      [endFront,outerGarden,innerGarden],
      [end,gardenCorner,innerGarden,endFront]
    ]],
    ['East courtyard fire-exit corner slate roof',[
      [endBack,returnCorner,endCourt],[endBack,endCourt,outerCourt]
    ]]
  ];
  function geometry(polygons){
    const positions=[],uv=[];
    for(const p of polygons){
      for(const ids of THREE.ShapeUtils.triangulateShape(p.map(v=>new THREE.Vector2(v[0],v[2])),[])){
        const [a,b,c]=ids.map(i=>p[i]);
        const up=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]);
        if(Math.abs(up)<1e-9)continue;
        for(const v of up>0?[a,b,c]:[a,c,b]){positions.push(...v);uv.push(v[0]/3,v[2]/3);}
      }
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
  }
  for(const [name,polygons] of faces){
    const existing=model.getObjectByName(name),g=geometry(polygons);
    g.applyMatrix4(existing.matrixWorld.clone().invert());existing.geometry.dispose();existing.geometry=g;
    existing.userData.preciseRoofUV=true;
  }
  // Close the orange cut from the lowered slate to the unchanged upper edge.
  // The render tapers where the two roof planes meet; no brick crosses it.
  const bandFraction=1-.1/(backStep[1]-loweredStep[1]);
  const bandTip=loweredStep.map((v,i)=>v+(split[i]-v)*bandFraction);
  const bandStart=[backStep[0],backStep[1]-.1,backStep[2]];
  for(const [mat,points,name] of [
    [brick,[loweredStep,bandStart,bandTip],'brick'],
    [white,[bandStart,backStep,split,bandTip],'render']
  ]){
    const positions=[];
    for(let i=1;i<points.length-1;i++){
      const triangle=[points[0],points[i],points[i+1]];
      const [a,b,c]=triangle.map(v=>new THREE.Vector3(...v));
      if(b.sub(a).cross(c.sub(a)).x>0)triangle.reverse();
      for(const v of triangle)positions.push(...v);
    }
    if(mat===white){
      const top=geometry([[backStep,split,[split[0]+.12,split[1],split[2]],[backStep[0]+.12,backStep[1],backStep[2]]]]);
      positions.push(...top.attributes.position.array);top.dispose();
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(positions.length/3*2),2));g.computeVertexNormals();
    mesh(worldUV(g,1.7),mat).name='East court stepped abutment '+name;
  }
  // The garden-side rising entrance eave retains its previous footprint.
  // Finish each return with brick and a white cap that ends at the slate edge.
  const roofs=faces.map(([name])=>model.getObjectByName(name));
  model.updateMatrixWorld(true);
  const probe=new THREE.Raycaster(new THREE.Vector3(41.04,30,17.4),new THREE.Vector3(0,-1,0));
  const frontWall=[41.04,probe.intersectObjects(roofs,false)[0].point.y,17.4];
  for(const [name,a,b] of [['front',front,frontStep],['front return',frontStep,frontWall]]){
    for(const [material,low,high,suffix] of [[brick,13.03,-.1,'masonry'],[white,null,0,'render']]){
      // Clip the brick at the existing cornice. Its starting top would
      // otherwise fall below its bottom and fold across the white strip.
      const t=low!==null&&a[1]+high<low?(low-a[1]-high)/(b[1]-a[1]):0;
      const left=a.map((v,i)=>v+(b[i]-v)*t);
      const q=[[left[0],low??left[1]-.1,left[2]],[b[0],low??b[1]-.1,b[2]],[b[0],b[1]+high,b[2]],[left[0],left[1]+high,left[2]]],positions=[];
      for(const tri of [[0,1,2],[0,2,3]]){
        if(tri.some((index,i)=>Math.hypot(...q[index].map((v,k)=>v-q[tri[(i+1)%3]][k]))<1e-7))continue;
        for(const j of name==='court'?tri.toReversed():tri)positions.push(...q[j]);
      }
      if(low===null){
        // A real top return supplies the roof finish with its edge support.
        // Without it the automatic finish adds a coplanar white fascia over
        // the brick triangle, which flickers after compiled batching.
        const inset=name==='court'?.12:-.12;
        const top=geometry([[a,b,[b[0],b[1],b[2]+inset],[a[0],a[1],a[2]+inset]]]);
        positions.push(...top.attributes.position.array);top.dispose();
      }
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
      g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(positions.length/3*2),2));g.computeVertexNormals();
      mesh(worldUV(g,1.7),material).name='East entrance rising '+name+' eave '+suffix;
    }
  }
  // The filled frontage begins at x=41. Its 0.4-unit overhang needs an
  // opaque return to that wall, including the short outside corner.
  const soffit=new THREE.BoxGeometry(.4,.25,2.5);
  mesh(soffit,white,40.8,14.425,18.65,true).name='East frontage stepped eave soffit';
}
