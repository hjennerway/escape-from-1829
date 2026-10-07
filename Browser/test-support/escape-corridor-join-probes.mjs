import {ESCAPE_CORRIDOR_POLYGONS,ESCAPE_CORRIDOR_DOORS,ESCAPE_GALLERY,containsPoint} from '../dist/escape-corridor-plan.mjs';

// Sideways rays immediately in front of each header catch the narrow slots
// left by side-wall mitres even when every forward header ray is blocked.
export function auditDoorHeaderJoins(THREE,root,group){
 const meshes=[],finishes=new Set();root.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
 group.traverse(o=>{if(o.isMesh&&/painted lining|Locked door masonry header/.test(o.name))finishes.add(o.material);});
 const half=(ESCAPE_GALLERY.maxX-ESCAPE_GALLERY.minX-.575)/2,failures=[];let probes=0;
 for(const door of ESCAPE_CORRIDOR_DOORS){
  const dx=door.toward[0]-door.point[0],dz=door.toward[1]-door.point[1],length=Math.hypot(dx,dz),ux=dx/length,uz=dz/length;
  for(const side of [-1,1])for(const depth of [.125,.15,.20,.26,.30,.4])for(const y of [3.78,3.9,4.4,5.025]){
   const x=side*(half-.3),origin=new THREE.Vector3(door.point[0]+uz*x+ux*depth,y,door.point[1]-ux*x+uz*depth);
   const ray=new THREE.Raycaster(origin,new THREE.Vector3(uz*side,0,-ux*side),0,.7),hit=ray.intersectObjects(meshes,false)[0];probes++;
   if(!hit||Math.abs(hit.distance-.3)>.00015||!finishes.has(hit.object.material))failures.push({id:door.id,side,depth,y,distance:hit?.distance,name:hit?.object.name,point:hit?.point.toArray()});
  }
 }
 return {doors:ESCAPE_CORRIDOR_DOORS.length,probes,failures};
}

// Inspect rendered surfaces around every passage junction, including the
// diagonal branches. Probe from inside so concealed backing cannot hide a gap.
export function auditCorridorJoins(THREE,root,group){
 const meshes=[],finishes=new Set(),skirts=new Set();root.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
 group.traverse(o=>{if(!o.isMesh)return;if(/painted lining|painted brick|outer-wall lining/.test(o.name))finishes.add(o.material);if(/skirting/.test(o.name))skirts.add(o.material);});
 const failures=[];let corners=0,probes=0;
 const direction=(a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);return [dx/l,dz/l];};
 const owns=(a,b)=>{const d=direction(a,b),mid=[(a[0]+b[0])/2-d[1]*.01,(a[1]+b[1])/2+d[0]*.01];
  return ESCAPE_CORRIDOR_POLYGONS.some(p=>containsPoint(mid,p))&&!ESCAPE_CORRIDOR_DOORS.some(door=>Math.hypot((a[0]+b[0])/2-door.point[0],(a[1]+b[1])/2-door.point[1])<.01);
 };
 for(const loop of group.userData.corridorLoops)for(let i=0;i<loop.length;i++){
  const a=loop[(i+loop.length-1)%loop.length],p=loop[i],b=loop[(i+1)%loop.length];
  if(!owns(a,p)||!owns(p,b))continue;
  // The original tower supplies its own photographed stepped base.
  if(p[1]>-60.31&&p[1]<-50.09&&Math.abs(p[0]-ESCAPE_GALLERY.minX)<.01)continue;
  const v=direction(a,p),w=direction(p,b),cross=v[0]*w[1]-v[1]*w[0];if(Math.abs(cross)<.01)continue;
  corners++;
  for(const y of [.11,.35,1.05,3.3,4.9]){
   const depth=y<.18?.3325:.2875,s=[p[0]-v[1]*depth,p[1]+v[0]*depth],e=[p[0]-w[1]*depth,p[1]+w[0]*depth],q=[e[0]-s[0],e[1]-s[1]],t=(q[0]*w[1]-q[1]*w[0])/cross,c=[s[0]+v[0]*t,s[1]+v[1]*t];
   for(const [d,sign] of [[v,-1],[w,1]])for(const along of [.003,.015,.05,.12]){
    const target=[c[0]+d[0]*along*sign,y,c[1]+d[1]*along*sign],normal=[-d[1],0,d[0]],origin=target.map((n,k)=>n+normal[k]*.4),ray=new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...normal.map(n=>-n)),0,.8),hit=ray.intersectObjects(meshes,false)[0];probes++;
    if(!hit||Math.abs(hit.distance-.4)>.00015||!(y<.18?skirts:finishes).has(hit.object.material))failures.push({corner:p,y,along,sign,target,distance:hit?.distance,name:hit?.object.name,point:hit?.point.toArray()});
   }
  }
 }
 return {corners,probes,failures};
}
