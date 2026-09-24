import {readFileSync,writeFileSync} from 'node:fs';
let s=readFileSync('Browser/artifacts/rear-roads-fit.mjs','utf8');
s=s.replace("script=script.replace('Research/admin", "script=script.replace('const residual=p=>world.flatMap((q,i)=>project(p,q)', 'const residual=p=>world.flatMap((q,i)=>project([...p,744,376.5],q)');\nscript=script.replace('let p=[409,208,30,-2.1,1.4,845,744,376]','let p=[409,208,30,-2.1,1.4,845]');\nscript=script.replace('const [r,u,f]=axes(p);','p=[...p,744,376.5];const [r,u,f]=axes(p);');\nscript=script.replace('Research/admin");
writeFileSync('Browser/artifacts/rear-roads-fit.mjs',s);
