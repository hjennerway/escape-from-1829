import {readFileSync,writeFileSync} from 'node:fs';
const file='Browser/artifacts/rear-roads-preview.mjs';let s=readFileSync(file,'utf8');s=s.replace("import {writeFileSync} from 'node:fs';","import {readFileSync,writeFileSync} from 'node:fs';");
s=s.replace('const data=await page.evaluate(()=>{','const data=await page.evaluate(p=>{');
s=s.replace(/camera.position.set\(409,208,30\);camera.up.set\(1,0,.12\);camera.lookAt\(409,0,30\);camera.fov=48;/,"const a=p[3],b=p[4],u=[-Math.sin(a)*Math.sin(b),Math.cos(b),-Math.cos(a)*Math.sin(b)],f=[-Math.sin(a)*Math.cos(b),-Math.sin(b),-Math.cos(a)*Math.cos(b)];camera.position.set(...p.slice(0,3));camera.up.set(...u);camera.lookAt(...f.map((v,i)=>p[i]+v));camera.fov=2*Math.atan(376.5/p[5])*180/Math.PI;");
s=s.replace('return marks;\n});','return marks;\n},JSON.parse(readFileSync("Browser/artifacts/rear-roads-fit.json")).parameters);');writeFileSync(file,s);
