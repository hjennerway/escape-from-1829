// Keep this repair's browser receipts separate from earlier task artifacts.
export async function load(url,context,nextLoad){
 const result=await nextLoad(url,context);
 if(url.endsWith('/test-escape-corridor-finishes-browser.mjs'))return {...result,source:String(result.source).replace("'./artifacts/corridor-repairs/finishes/'","'./artifacts/chimney-walking-shell/finishes/'")};
 if(url.endsWith('/test-explore-workshops-browser.mjs'))return {...result,source:String(result.source).replace('./artifacts/corridor-door-access/${mode}/','./artifacts/chimney-walking-shell/door-access-${mode}/')};
 return result;
}
