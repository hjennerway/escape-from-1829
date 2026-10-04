import {WEST_RANGE_PLAN} from './west-range-plan.mjs';

// The green garden return is recessed behind the yellow lower wing. Only
// the west forward root changes; the matching east and rear wings stay fixed.
export function westForwardRootFootprint(overhang=0){
  const {innerLeft,innerRight,innerFrontZ}=WEST_RANGE_PLAN;
  // The low root stops beneath the tall pavilion. Its former east shoulder
  // occupied the open inside corner and carried the circled roof wedge.
  return [[innerLeft-overhang,16-overhang],[innerRight+overhang,16-overhang],
    [innerRight+overhang,innerFrontZ-overhang],[-32+overhang,innerFrontZ-overhang],
    [-32+overhang,30+overhang],[-41-overhang,30+overhang],
    [-41-overhang,innerFrontZ-overhang],[innerLeft-overhang,innerFrontZ-overhang]];
}
export function westForwardRootGeometry(THREE,bottom,top,overhang=0){
  const shape=new THREE.Shape(westForwardRootFootprint(overhang).map(([x,z])=>new THREE.Vector2(x,-z)));
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:top-bottom,bevelEnabled:false});
  geometry.rotateX(-Math.PI/2);geometry.translate(0,bottom,0);
  return geometry;
}

// The remaining garden hip starts with low eaves below the pavilion's upper
// windows. Its rear shoulder is trimmed back into the tall pavilion.
export function trimWestForwardRootRoof(THREE,geometry,{centreZ=23}={}){
  const {innerLeft,innerFrontZ}=WEST_RANGE_PLAN;
  const xEdge=innerLeft-.4+36.5,zEdge=innerFrontZ-centreZ;
  const source=geometry.index?geometry.toNonIndexed():geometry;
  const attributes=source.attributes,output=Object.fromEntries(Object.keys(attributes).map(k=>[k,[]]));
  const split=(polygon,axis,edge)=>{
    const low=[],high=[];
    for(let i=0;i<polygon.length;i++){
      const a=polygon[i],b=polygon[(i+1)%polygon.length],da=a.position[axis]-edge,db=b.position[axis]-edge;
      if(da<=0)low.push(a);if(da>=0)high.push(a);
      if((da<0&&db>0)||(da>0&&db<0)){
        const t=da/(da-db),v=Object.fromEntries(Object.keys(attributes).map(k=>[k,a[k].map((n,j)=>n+(b[k][j]-n)*t)]));
        low.push(v);high.push(v);
      }
    }
    return {low,high};
  };
  for(let i=0;i<attributes.position.count;i+=3){
    const triangle=[0,1,2].map(j=>Object.fromEntries(Object.entries(attributes).map(([k,a])=>[k,Array.from({length:a.itemSize},(_,n)=>a.getComponent(i+j,n))])));
    const z=split(triangle,2,zEdge),x=split(z.low,0,xEdge);
    for(const polygon of [z.high,x.high])for(let j=1;j<polygon.length-1;j++)for(const v of [polygon[0],polygon[j],polygon[j+1]])
      for(const k of Object.keys(attributes))output[k].push(...v[k]);
  }
  if(source!==geometry)source.dispose();
  const result=new THREE.BufferGeometry();
  for(const [k,a] of Object.entries(attributes))result.setAttribute(k,new THREE.Float32BufferAttribute(output[k],a.itemSize));
  return result;
}
