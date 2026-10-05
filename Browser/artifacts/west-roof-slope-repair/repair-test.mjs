import {readFile,writeFile} from 'node:fs/promises';
const p='Browser/test-west-entrance-roof-boundary.mjs';let s=await readFile(p,'utf8');const a='// Compare the blue patch with the unaffected yellow pitch above it.';s=s.replace(a,`const mainPitch=(x,z)=>{
  const h=top(x,14.6),n=h.face.normal;
  return h.point.y-n.z/n.y*(z-14.6);
};
`+a);await writeFile(p,s);
