import {WEST_RANGE_PLAN} from './west-range-plan.mjs';

// The owner's purple roof guide joins the shortened cross range to its
// taller outer pavilion and court bay. Keep the exposed eaves and roof
// outlines, extending the main ridge through the former small recessed hip.
export function joinWestCrossRangeRoof(THREE,{model,mesh,roof}){
  const {courtZ,gardenZ,recessRearZ}=WEST_RANGE_PLAN;
  const ridgeZ=(courtZ+gardenZ)/2,ridgeY=14.53+(gardenZ-courtZ)*.3;
  model.updateMatrixWorld(true);
  const roofs=model.children.filter(o=>o.isMesh&&o.material===roof&&new THREE.Box3().setFromObject(o).min.y>14.4);
  const ray=new THREE.Raycaster();
  const oldHeight=(x,z)=>{
    ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));
    return ray.intersectObjects(roofs,false)[0]?.point.y;
  };
  // [x, court edge z/y, ridge y, garden edge z/y]. The outer arm's
  // shoulder stays inside its slate overhang; the court collar meets the
  // bay's existing rear roof edge above its brick and white cornice.
  const stations=[
    [-65.95,recessRearZ-.4,oldHeight(-65.95,recessRearZ-.4),oldHeight(-65.95,ridgeZ),gardenZ,oldHeight(-65.95,gardenZ)],
    [-64.4,recessRearZ-.4,14.53,ridgeY-.18,gardenZ,oldHeight(-64.4,gardenZ)],
    [-61.8775,courtZ-.26,15.5,ridgeY,gardenZ+.4,14.53],
    [-54.9225,courtZ-.26,15.5,ridgeY,gardenZ+.4,14.53],
    [-52.5,courtZ-.4,14.53,ridgeY,gardenZ+.4,14.53]
  ];
  const front=stations.map(s=>[[s[0],s[2],s[1]],[s[0],s[3],ridgeZ]]);
  // Stop the garden pitch at the host hip's ridge end, keeping the original
  // middle garden branch intact. Sample its shared edge at the roof valleys.
  const endX=-48.6-21.2/2-.4+((gardenZ-courtZ)/2+.4)*.83;
  const garden=[...stations.slice(0,3),[endX,0,0,oldHeight(endX,ridgeZ),gardenZ+.4,oldHeight(endX,gardenZ+.4)]]
    .map(s=>[[s[0],s[3],ridgeZ],[s[0],s[5],s[4]]]);
  const regions=[front,garden];
  const patches=regions.flatMap(region=>region.slice(1).map((b,i)=>{
    const a=region[i];return [[a[0][0],a[0][2]],[b[0][0],b[0][2]],[b[1][0],b[1][2]],[a[1][0],a[1][2]]];
  }));
  const positions=[],uv=[];
  function triangle(a,b,c){
    if((b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2])<0)[b,c]=[c,b];
    for(const v of [a,b,c]){positions.push(...v);uv.push(v[0]/3,(v[2]+v[1])/3);}
  }
  const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
  // Border samples follow the upper envelope of the retained roofs exactly;
  // the interior stays on straight slate pitches through the raised ridge.
  for(const region of regions)for(let i=1;i<region.length;i++){
    const a=region[i-1],b=region[i],cols=8,rows=24;
    const point=(u,v)=>{
      const p=lerp(lerp(a[0],a[1],v),lerp(b[0],b[1],v),u);
      if((region===garden&&v===1)||(region===front&&v===0)||(i===1&&u===0)||(i===region.length-1&&u===1))p[1]=oldHeight(p[0],p[2])??p[1];
      return p;
    };
    for(let x=0;x<cols;x++)for(let z=0;z<rows;z++){
      const p=point(x/cols,z/rows),q=point((x+1)/cols,z/rows),r=point((x+1)/cols,(z+1)/rows),s=point(x/cols,(z+1)/rows);
      triangle(p,q,r);triangle(p,r,s);
    }
  }
  // Cut away the old intersecting hips within the new slate surface. UVs
  // interpolate at each cut so the retained roofs keep their tile scale.
  function outside(polygon,outline){
    const fragments=[];let remainder=polygon;
    for(let i=0;i<outline.length&&remainder.length>=3;i++){
      const a=outline[i],b=outline[(i+1)%outline.length],inside=[],out=[];
      const side=p=>(b[0]-a[0])*(p[2]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
      for(let j=0;j<remainder.length;j++){
        const p=remainder[j],q=remainder[(j+1)%remainder.length],dp=side(p),dq=side(q);
        if(dp>=-1e-8)inside.push(p);if(dp<=1e-8)out.push(p);
        if((dp>1e-8&&dq< -1e-8)||(dp< -1e-8&&dq>1e-8)){
          const t=dp/(dp-dq),v=p.map((n,k)=>n+(q[k]-n)*t);inside.push(v);out.push(v);
        }
      }
      if(out.length>=3)fragments.push(out);remainder=inside;
    }
    return fragments;
  }
  for(const o of roofs){
    const bounds=new THREE.Box3().setFromObject(o);
    if(bounds.max.x<=stations[0][0]||bounds.min.x>=-52.5||bounds.max.z<=courtZ-.4||bounds.min.z>=gardenZ+.4)continue;
    const source=o.geometry.index?o.geometry.toNonIndexed():o.geometry,p=source.attributes.position,uv=source.attributes.uv;
    const positions=[],tex=[];
    for(let i=0;i<p.count;i+=3){
      let polygons=[[0,1,2].map(j=>[...new THREE.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(o.matrixWorld).toArray(),uv.getX(i+j),uv.getY(i+j)])];
      for(const patch of patches)polygons=polygons.flatMap(polygon=>outside(polygon,patch));
      for(const polygon of polygons)for(let j=1;j<polygon.length-1;j++)for(const v of [polygon[0],polygon[j],polygon[j+1]]){positions.push(...v.slice(0,3));tex.push(...v.slice(3));}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(tex,2));geometry.computeVertexNormals();
    if(source!==o.geometry)source.dispose();o.geometry=geometry;o.position.set(0,0,0);o.rotation.set(0,0,0);o.scale.set(1,1,1);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();
  mesh(geometry,roof,0,0,0,true).name='West cross-range continuous roof join';
}
