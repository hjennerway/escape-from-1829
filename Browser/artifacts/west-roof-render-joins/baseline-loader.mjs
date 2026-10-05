import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
registerHooks({load(url,context,next){
 const result=next(url,context),file=url.endsWith('/dist/west-cross-range-roof.mjs')?'before-roof.mjs':url.endsWith('/dist/west-refinement.mjs')?'before-west-refinement.mjs':url.endsWith('/dist/west-court-photo-detail.mjs')?'before-west-court-photo-detail.mjs':null;
 return file?{...result,source:readFileSync(new URL(file,import.meta.url),'utf8')}:result;
}});
