import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const files=process.env.ORIGINAL_DETAIL==='bands'?['west-lawn-photo-detail']:process.env.ORIGINAL_DETAIL==='all'?['front-inside-corners','west-lawn-photo-detail']:['front-inside-corners'];
registerHooks({load(url,context,next){
 const name=files.find(name=>url.endsWith('/dist/'+name+'.mjs'));
 return name?{format:'module',shortCircuit:true,source:readFileSync(new URL(name+'-before.mjs',import.meta.url),'utf8')}:next(url,context);
}});
