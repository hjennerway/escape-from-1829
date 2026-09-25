const names=['escape-exterior.mjs','east-photo-detail.mjs','entrance-walks.mjs'];
export async function load(url,context,nextLoad){
 if(names.some(name=>url.endsWith('/dist/'+name))){
  const {readFile}=await import('node:fs/promises');
  return {format:'module',source:await readFile(new URL('./garden-cleanup-baseline/'+url.split('/').pop(),import.meta.url),'utf8'),shortCircuit:true};
 }
 return nextLoad(url,context);
}
