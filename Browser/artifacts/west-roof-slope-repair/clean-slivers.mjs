import {readFile,writeFile} from 'node:fs/promises';
let p='Browser/dist/front-inside-corners.mjs',s=await readFile(p,'utf8');const a='    for(const polygon of subtract(triangle,outline))for(let k=1;k<polygon.length-1;k++){';const b=`    for(const fragment of subtract(triangle,outline)){
      // Intersecting cuts can repeat a corner within Float32 precision.
      // Weld those micron-sized edges before they become textured slivers.
      const polygon=fragment.filter((v,j)=>!j||Math.hypot(...v.slice(0,3).map((x,k)=>x-fragment[j-1][k]))>1e-5);
      if(polygon.length>2&&Math.hypot(...polygon[0].slice(0,3).map((x,k)=>x-polygon.at(-1)[k]))<1e-5)polygon.pop();
      for(let k=1;k<polygon.length-1;k++){`;
if(!s.includes(a))throw Error('Missing cut fan');s=s.replace(a,b);s=s.replace('  if(source!==geometry)source.dispose();','  }\n  if(source!==geometry)source.dispose();');await writeFile(p,s);
p='Browser/dist/west-cross-range-roof.mjs';s=await readFile(p,'utf8');const c='    for(const polygon of polygons){\n      const triangles=THREE.ShapeUtils.triangulateShape';const d=`    for(const fragment of polygons){
      const polygon=fragment.filter((v,j)=>!j||Math.hypot(...v.slice(0,3).map((x,k)=>x-fragment[j-1][k]))>1e-5);
      if(polygon.length>2&&Math.hypot(...polygon[0].slice(0,3).map((x,k)=>x-polygon.at(-1)[k]))<1e-5)polygon.pop();
      const triangles=THREE.ShapeUtils.triangulateShape`;
if(!s.includes(c))throw Error('Missing roof fan');s=s.replace(c,d);await writeFile(p,s);
