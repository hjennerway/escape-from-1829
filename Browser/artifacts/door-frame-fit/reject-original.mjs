import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const originalLayout=new URL('./asylum-layout-before.mjs',import.meta.url),originalArchitecture=new URL('./asylum-architecture-before.mjs',import.meta.url),test=new URL('../../test-asylum-door-frames.mjs',import.meta.url),dist=new URL('../../dist/',import.meta.url);
const encode=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
function imports(source,base,layout){return source.replace(/from\s*(['"])(\.[^'"]+)\1/g,(match,quote,path)=>'from '+quote+(path.endsWith('/asylum-layout.mjs')&&layout?layout:new URL(path,base).href)+quote);}
const layout=encode(imports(await readFile(originalLayout,'utf8'),new URL('asylum-layout.mjs',dist)));
const architecture=encode(imports(await readFile(originalArchitecture,'utf8'),new URL('asylum-architecture.mjs',dist),layout));
let source=await readFile(test,'utf8');
source=source.replace("from './dist/asylum-layout.mjs'",`from '${layout}'`).replace("from './dist/asylum-architecture.mjs'",`from '${architecture}'`);
source=imports(source,test).replace("new URL('./dist/asylum-plan.json',import.meta.url)",`new URL('${new URL('asylum-plan.json',dist).href}')`);
let failure;
try{await import(encode(source));}catch(error){failure=error;}
assert(failure instanceof assert.AssertionError,'The original renderer must fail the current independent casing survey');
const result={rejected:true,reason:failure.message};await writeFile(new URL('./original-rejected.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(result);
