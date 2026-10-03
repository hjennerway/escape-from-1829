import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const files=new Set(['inner-court-photo-detail.mjs','rear-court-photo-detail.mjs','annexe.mjs','asylum-outside.mjs']);
registerHooks({load(url,context,next){
 const name=url.split('/').at(-1);
 if(url.includes('/Browser/dist/')&&files.has(name))return {format:'module',source:readFileSync(new URL('before-'+name,import.meta.url),'utf8'),shortCircuit:true};
 return next(url,context);
}});
