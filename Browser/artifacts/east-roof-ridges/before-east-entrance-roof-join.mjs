// Owner's red/yellow roof correction, 5 October 2026. Extend only the last
// entrance pitches into the taller range, meeting its actual west roof plane.
export function joinEastEntranceRoof(THREE,{model,mesh,roof,white,brick,worldUV}){
  model.updateMatrixWorld(true);
  const entrance=model.getObjectByName('Entrance east recessed slate roof');
  const range=model.getObjectByName('Redesmere aligned frontage slate roof');
  const crown=15.66,eave=14.55,joinX=44.7+(crown-eave)*(51.257-44.7)/(16.2-eave);
  const leftBack=[6.7,13.06,6.6],leftFront=[6.7,13.06,17.4],leftRidge=[11.182,crown,12];
  const back=[38,13.06,6.6],front=[38,13.06,17.4],ridge=[38,crown,12];
  const end=[joinX,crown,12],highBack=[44.7,eave,6.6],highFront=[44.7,eave,16.6];
  const step=[40.6,eave,16.6],tip=[40.6,eave,17.4];
  const extension=[[back,highBack,end,ridge],[ridge,end,highFront,step,tip,front]];
  const polygons=[[leftBack,back,ridge,leftRidge],[leftRidge,ridge,front,leftFront],[leftBack,leftRidge,leftFront],...extension];
  function geometry(polygons){
    const positions=[],uv=[];
    for(const fragment of polygons){
     const p=fragment.filter((v,i)=>!i||Math.hypot(...v.map((n,k)=>n-fragment[i-1][k]))>1e-5);
     if(p.length>2&&Math.hypot(...p[0].map((n,k)=>n-p.at(-1)[k]))<1e-5)p.pop();
     for(const ids of THREE.ShapeUtils.triangulateShape(p.map(v=>new THREE.Vector2(v[0],v[2])),[])){
      const [a,b,c]=ids.map(i=>p[i]),up=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]);
      if(Math.abs(up)<1e-9)continue;
      for(const v of up>0?[a,b,c]:[a,c,b]){positions.push(...v);uv.push(v[0]/3,v[2]/3);}
     }
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
  }
  // Subtract the shared join from the taller roof. The adjoining surfaces
  // meet on its existing plane without concealed competing slate triangles.
  const cuts=extension.flatMap(p=>THREE.ShapeUtils.triangulateShape(p.map(v=>new THREE.Vector2(v[0],v[2])),[]).map(ids=>{
    const t=ids.map(i=>p[i]);if((t[1][0]-t[0][0])*(t[2][2]-t[0][2])-(t[1][2]-t[0][2])*(t[2][0]-t[0][0])<0)t.reverse();return t;
  }));
  const source=range.geometry.index?range.geometry.toNonIndexed():range.geometry,p=source.attributes.position,retained=[];
  for(let i=0;i<p.count;i+=3){
    let fragments=[[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(range.matrixWorld).toArray())];
    for(const cut of cuts)fragments=fragments.flatMap(polygon=>{
      let remainder=polygon;const out=[];
      for(let k=0;k<3&&remainder.length>2;k++){
        const a=cut[k],b=cut[(k+1)%3],inside=[],outside=[];
        const side=v=>(b[0]-a[0])*(v[2]-a[2])-(b[2]-a[2])*(v[0]-a[0]);
        for(let j=0;j<remainder.length;j++){
          const v=remainder[j],w=remainder[(j+1)%remainder.length],dv=side(v),dw=side(w);
          if(dv>=-1e-7)inside.push(v);if(dv<=1e-7)outside.push(v);
          if(dv*dw<0&&Math.abs(dv)>1e-7&&Math.abs(dw)>1e-7){const t=dv/(dv-dw),q=v.map((n,k)=>n+(w[k]-n)*t);inside.push(q);outside.push(q);}
        }
        if(outside.length>2)out.push(outside);remainder=inside;
      }return out;
    });
    retained.push(...fragments);
  }
  const old=range.geometry;range.geometry=geometry(retained).applyMatrix4(range.matrixWorld.clone().invert());if(source!==old)source.dispose();old.dispose();
  range.userData.preciseRoofUV=true;
  entrance.geometry.dispose();entrance.geometry=geometry(polygons).applyMatrix4(entrance.matrixWorld.clone().invert());
  // Close the short rising eaves with trim whose top is the slate edge.
  // The masonry below stays on the existing entrance footprint.
  for(const [name,a,b] of [['court',back,highBack],['front',front,tip]]){
    const positions=[],render=[];
    for(const [target,low,high] of [[positions,13.03,-.1],[render,null,0]]){
      const q=[[a[0],low??a[1]-.1,a[2]],[b[0],low??b[1]-.1,b[2]],[b[0],b[1]+high,b[2]],[a[0],a[1]+high,a[2]]];
      for(const tri of [[0,1,2],[0,2,3]])for(const j of name==='court'?tri:tri.toReversed())target.push(...q[j]);
    }
    for(const [v,mat,suffix] of [[positions,brick,'masonry'],[render,white,'render']]){
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(v.length/3*2),2));g.computeVertexNormals();
      mesh(worldUV(g,1.7),mat).name='East entrance rising '+name+' eave '+suffix;
    }
  }
}
