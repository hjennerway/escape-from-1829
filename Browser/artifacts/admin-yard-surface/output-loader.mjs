// Keep this task's keyboard/touch browser evidence in its own folder.
export async function load(url,context,nextLoad){
 const result=await nextLoad(url,context);
 if(url.endsWith('/test-explore-workshops-browser.mjs'))return {...result,source:String(result.source).replace('./artifacts/corridor-door-access/${mode}/','./artifacts/admin-yard-surface/door-access-${mode}/')};
 return result;
}
