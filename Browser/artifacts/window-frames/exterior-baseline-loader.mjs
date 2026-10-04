import {registerHooks} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
const loaded=[],replaced=[];
const originals=new Map([['asylum-architecture.mjs','before-architecture.mjs.txt'],['asylum-room-finishes.mjs','before-room-finishes.mjs.txt']]);
registerHooks({load(url,context,next){
 if(url.includes('/dist/'))loaded.push(url.slice(url.lastIndexOf('/dist/')+6));
 for(const [file,saved] of originals)if(url.endsWith('/dist/'+file)){
  replaced.push(file);return {format:'module',source:readFileSync(new URL(saved,import.meta.url),'utf8'),shortCircuit:true};
 }
 return next(url,context);
}});
process.on('exit',()=>writeFileSync(new URL('exterior-baseline-imports.json',import.meta.url),JSON.stringify({replaced,loaded:[...new Set(loaded)].sort()},null,2)+'\n'));
