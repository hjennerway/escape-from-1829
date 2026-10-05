import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
 const result=next(url,context);if(!url.endsWith('/dist/front-inside-corners.mjs'))return result;
 const source=typeof result.source==='string'?result.source:Buffer.from(result.source).toString('utf8');
 return {...result,source:source.replace(/  \/\/ End the buried main cornice[\s\S]*?(?=  model.userData.frontInsideCornerOpenings)/,'')};
}});
