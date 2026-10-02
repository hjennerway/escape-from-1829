import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
registerHooks({load(url,context,next){
 for(const name of ['inner-east-elevation','wing-roof-junctions'])if(url.endsWith('/dist/'+name+'.mjs'))return {format:'module',source:readFileSync(new URL('./before-'+name+'.mjs',import.meta.url),'utf8'),shortCircuit:true};
 if(url.endsWith('/dist/escape-exterior.mjs')){
  const result=next(url,context);return {...result,source:String(result.source).replaceAll('(innerCornerRoom?.8:.48)','.48')};
 }
 return next(url,context);
}});
