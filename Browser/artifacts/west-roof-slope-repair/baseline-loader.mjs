import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const mode=process.env.ROOF_BASELINE??'all';
const files=new Map([
 ['/dist/front-inside-corners.mjs','before-latest-corners.mjs'],
 ['/dist/entrance-west-photo-detail.mjs','before-entrance.mjs'],
 ['/dist/west-cross-range-roof.mjs','before-roof.mjs']
]);
registerHooks({load(url,context,next){
 for(const [suffix,file] of files){
  if(!url.endsWith(suffix))continue;
  if(mode==='blue'&&!suffix.includes('front-inside'))continue;
  if(mode==='red'&&!suffix.includes('entrance-west-photo'))continue;
  return {format:'module',source:readFileSync(new URL(file,import.meta.url),'utf8'),shortCircuit:true};
 }
 return next(url,context);
}});
