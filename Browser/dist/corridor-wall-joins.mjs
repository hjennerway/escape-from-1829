// All layers use the same corner bisector. Depth is measured inward from the
// passage outline, so masonry, painted lining and skirting meet at one mitre.
export function corridorWallJoins(a,b,loops){
 const unit=(a,b)=>{const x=b[0]-a[0],z=b[1]-a[1],l=Math.hypot(x,z);return [x/l,z/l];},u=unit(a,b);
 const slope=other=>{const cross=u[0]*other[1]-u[1]*other[0];if(Math.abs(cross)<1e-6)return 0;
  const q=[u[1]-other[1],other[0]-u[0]];return (q[0]*other[1]-q[1]*other[0])/cross;
 };
 const result={start:0,end:0,offset:0};
 for(const loop of loops)for(let i=0;i<loop.length;i++){
  const p=loop[i];
  if(Math.hypot(p[0]-a[0],p[1]-a[1])<1e-5)result.start=slope(unit(loop[(i+loop.length-1)%loop.length],p));
  if(Math.hypot(p[0]-b[0],p[1]-b[1])<1e-5)result.end=slope(unit(p,loop[(i+1)%loop.length]));
 }
 return result;
}

// Only cut ends move. Window apertures and their frames keep their established
// positions. This supports both rectangular panels and extruded arched walls.
export function miterCorridorWall(geometry,length,joins,xOrigin=0,zOrigin=0){
 const p=geometry.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i)+xOrigin,depth=p.getZ(i)+zOrigin;
  if(Math.abs(x)<1e-4)p.setX(i,p.getX(i)+joins.start*depth);
  else if(Math.abs(x-length)<1e-4)p.setX(i,p.getX(i)+joins.end*depth);
 }
 p.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}
