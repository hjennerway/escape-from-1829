// Test-only control: load the current estate without this task's annexe changes.
// This distinguishes concurrent edits from regressions introduced here.
import {registerHooks} from 'node:module';
registerHooks({load(url,context,nextLoad){
 const result=nextLoad(url,context);
 if(!url.endsWith('/annexe.mjs'))return result;
 return {...result,source:String(result.source)
  .replace("   if(b.name==='Central rear spine'&&face==='end'&&side<0)continue;",'')
  .replace(' model.userData.oakmereElevation=addOakmereElevation(THREE,{model,host:ranges.find(b=>b.name===\'Central rear spine\'),brick,roof,material,worldUV,hipRoof});','')};
}});
