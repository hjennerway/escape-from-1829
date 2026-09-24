import {readFileSync,writeFileSync} from 'node:fs';
const url=new URL('../test-oakmere.mjs',import.meta.url);let s=readFileSync(url,'utf8').replace(/from '([^']+)'/g,(all,p)=>p.startsWith('.')?"from '"+new URL(p,url).href+"'":all);
for(const mark of ['const e=','e.scene.update','for(const o of detail','for(const name of','const cap=','const obstacles=','const walker=','const p=detail','const layouts='])s=s.replace(mark,"console.log("+JSON.stringify(mark)+");\n"+mark);
writeFileSync(new URL('./debug-oakmere-outward.mjs',import.meta.url),s);
