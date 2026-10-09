import {ADMIN_FRONT_CORRIDOR as source} from './admin-front-corridor.mjs';

// Close the extended entrance against its raised roof, retaining the existing
// ridge and pavilion contact. Clipping only one roof skirt leaves a floating
// remnant beside the new door, with the original gable below the ceiling.
export function addExploreEntranceEnvelope(THREE,{group,resources,gallery,entrance,width,head,brick,roof,panel}){
 const [x,z]=entrance.point,left=gallery.minX,right=source.adminWallX,ridge=source.x;
 const eave=gallery.height+.06,top=eave+source.rise;
 const roofY=x=>top-source.rise*Math.abs(x-ridge)/(x<ridge?ridge-left+.22:source.width/2+.22);
 function face(points,triangles,material,name){
  const geometry=new THREE.BufferGeometry(),vertices=triangles.flatMap(t=>t.flatMap(i=>points[i]));
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(triangles.flatMap(t=>t.flatMap(i=>[points[i][0]/2,points[i][1]/2+points[i][2]/2])),2));
  geometry.computeVertexNormals();resources.add(geometry);
  const mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.castShadow=mesh.receiveShadow=true;mesh.userData.noWalkingCollision=true;group.add(mesh);
 }
 // An outer masonry skin keeps the interior painted band inside the entrance.
 const exteriorZ=z+.135;
 for(const [a,b,base] of [[left,x-width/2-.08,.04],[x-width/2-.08,x+width/2+.08,head],[x+width/2+.08,ridge,.04],[ridge,right,.04]]){
  const bottom=Math.min(gallery.ceiling-.05,roofY(a),roofY(b));
  panel([a,exteriorZ],[b,exteriorZ],base,bottom,brick,'Admin entrance exterior masonry',base<head,.03);
  face([[a,bottom,z+.15],[b,bottom,z+.15],[b,roofY(b),z+.15],[a,roofY(a),z+.15]],[[0,1,2],[0,2,3]],brick,'Admin entrance closed roof gable');
 }
 for(const [a,b] of [[left-.22,ridge],[ridge,right]]){
  face([[a,roofY(a),z+.15],[b,roofY(b),z+.15],[b,roofY(b),source.joinZ],[a,roofY(a),source.joinZ]],[[0,1,2],[0,2,3]],roof,'Explore admin entrance slate roof');
 }
 // Close the upper exposed east wall above the retained pavilion connection.
 face([[right,source.height,z],[right,roofY(right),z],[right,roofY(right),source.joinZ],[right,source.height,source.joinZ]],[[0,2,1],[0,3,2]],brick,'Admin entrance pavilion roof return');
 face([[left,gallery.height,z],[left,roofY(left),z],[left,roofY(left),source.joinZ],[left,gallery.height,source.joinZ]],[[0,1,2],[0,2,3]],brick,'Admin entrance west roof return');
}
