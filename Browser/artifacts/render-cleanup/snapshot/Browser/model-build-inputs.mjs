import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';

export const dist=new URL('./dist/',import.meta.url);
// Used both when compiling and by the development server, so local edits never
// silently display a stale binary. Production deploys source and model together.
export async function modelSourceHash(){
  const hash=createHash('sha256'),sources=new Map();
  async function visit(url){
    if(sources.has(url.href))return;
    const source=await readFile(url,'utf8');sources.set(url.href,source);
    // Follow the actual static and dynamic model imports. Unrelated UI/photo
    // edits do not invalidate an otherwise current estate binary.
    for(const match of source.matchAll(/\b(?:from\s*|import\s*(?:\(\s*)?)['"](\.[^'"]+)['"]/g))await visit(new URL(match[1],url));
  }
  await visit(new URL('aerial-scene.mjs',dist));
  for(const [url,source] of [...sources].sort(([a],[b])=>a<b?-1:a>b?1:0)){hash.update(url.slice(dist.href.length));hash.update(source);}
  return hash.digest('hex');
}
