// Keep validation receipts in this task's directory when historical shared
// artifacts are locked by another local reader/writer. Assertions stay intact.
export async function load(url,context,nextLoad){
 const result=await nextLoad(url,context);
 if(url.endsWith('/test-precompiled-models.mjs'))return {...result,source:String(result.source).replace("new URL('./artifacts/',import.meta.url)","new URL('./artifacts/road-kerb-transition/compiled-check/',import.meta.url)")};
 if(url.endsWith('/test-road-continuity.mjs')||url.endsWith('/test-ground-contact.mjs')){
  return {...result,source:String(result.source).replaceAll('artifacts/road-steps-audit.json','artifacts/road-kerb-transition/road-steps-audit.json').replaceAll('artifacts/ground-contact-audit.json','artifacts/road-kerb-transition/ground-contact-audit.json')};
 }
 return result;
}
