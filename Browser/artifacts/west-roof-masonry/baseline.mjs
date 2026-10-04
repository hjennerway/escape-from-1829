import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
registerHooks({load(url,context,nextLoad){
 const result=nextLoad(url,context);
 if(url.endsWith('/dist/west-court-photo-detail.mjs'))return {...result,source:readFileSync(new URL('./before-west-court-photo-detail.mjs',import.meta.url),'utf8')};
 return result;
}});
