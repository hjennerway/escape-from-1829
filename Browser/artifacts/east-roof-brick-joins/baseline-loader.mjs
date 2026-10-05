import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
registerHooks({load(url,context,next){
 const result=next(url,context);
 const file=process.env.ROOF_BASELINE==='blue'&&url.endsWith('/dist/front-inside-corners.mjs')?'before-front-inside-corners.mjs':
   process.env.ROOF_BASELINE==='yellow'&&url.endsWith('/dist/east-photo-detail.mjs')?'before-east-photo-detail.mjs':null;
 return file?{...result,source:readFileSync(new URL(file,import.meta.url),'utf8')}:result;
}});
