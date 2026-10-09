import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const before=new Map(['escape-corridors.mjs','explore-irby-entrance.mjs'].map(name=>[
 new URL('../../dist/'+name,import.meta.url).href,
 readFileSync(new URL('before/'+name,import.meta.url),'utf8')
]));
registerHooks({load(url,context,nextLoad){
 const result=nextLoad(url,context);
 return before.has(url)?{...result,source:before.get(url)}:result;
}});
const test=process.argv[2]??'test-jarman.mjs';
if(!/^test-[a-z0-9-]+\.mjs$/.test(test))throw new Error('Invalid diagnostic test name.');
await import('../../'+test);
