import {registerHooks} from 'node:module';
// Reconstruct only this task's pre-edit state in memory to distinguish
// existing historical snapshot failures from this east-wing correction.
registerHooks({load(url,context,next){
 const result=next(url,context);
 if(!url.includes('/Browser/dist/'))return result;
 if(url.endsWith('/annexe-os-refinement.mjs')){
  let source=String(result.source);
  source=source.replace(/  \/\/ Red\/yellow correction[^\n]*\r?\n  \/\/ The existing 4\.3-eave[^\n]*/,
   "  {name:'East end inner return',rect:[78,-16,87,11]},\n  {name:'East end middle rooms',rect:[87,-12,100,-3]},");
  return {...result,source};
 }
 if(url.endsWith('/annexe.mjs'))return {...result,source:String(result.source).replace(/^import \{addAnnexeEastVeranda\}[^\n]*\n/m,'').replace(/^ model\.userData\.eastVeranda=addAnnexeEastVeranda[^\n]*\n/m,'')};
 return result;
}});
