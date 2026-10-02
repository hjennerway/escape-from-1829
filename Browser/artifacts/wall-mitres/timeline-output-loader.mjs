import {readFile} from 'node:fs/promises';
export async function load(url,context,nextLoad){
 if(url.endsWith('/test-timeline-browser.mjs'))return {format:'module',shortCircuit:true,
  source:(await readFile(new URL(url),'utf8')).replace("new URL('./artifacts/',import.meta.url)","new URL('./artifacts/wall-mitres/timeline/',import.meta.url)")};
 return nextLoad(url,context);
}
