import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
registerHooks({load(url,context,next){
 const result=next(url,context),name=url.split('/').at(-1);
 if(['west-front-photo-detail.mjs','annexe-larkton-recess.mjs'].includes(name))return {...result,source:readFileSync(new URL('before-'+name,import.meta.url),'utf8')};
 return result;
}});
