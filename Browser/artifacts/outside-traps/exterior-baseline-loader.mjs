// Read-only isolation check: retain the repaired collision helper while loading
// the committed exterior geometry, to distinguish concurrent model changes.
import {execFileSync} from 'node:child_process';
const source=execFileSync('git',['show','HEAD:Browser/dist/escape-exterior.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,encoding:'utf8'});
export async function load(url,context,next){
 if(url.endsWith('/dist/escape-exterior.mjs'))return {format:'module',source,shortCircuit:true};
 return next(url,context);
}
