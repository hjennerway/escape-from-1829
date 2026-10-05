import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const test=new URL('../../test-asylum-stairs.mjs',import.meta.url),architecture=new URL('../../dist/asylum-architecture.mjs',import.meta.url);
const original=(await readFile(new URL('asylum-architecture-before.mjs',import.meta.url),'utf8'))
 .replace(/from '(\.[^']+)'/g,(_,path)=>`from '${new URL(path,architecture).href}'`);
const originalUrl='data:text/javascript;base64,'+Buffer.from(original).toString('base64');
const source=(await readFile(test,'utf8'))
 .replace("import {buildAsylumArchitecture} from './dist/asylum-architecture.mjs';",`const {buildAsylumArchitecture}=await import(${JSON.stringify(originalUrl)});`)
 .replace(/from '(\.[^']+)'/g,(_,path)=>`from '${new URL(path,test).href}'`)
 .replaceAll('import.meta.url',JSON.stringify(test.href));
await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(source).toString('base64')),/full-height well wall/);
console.log('PASS: saved original open-well architecture fails the full-height wall regression.');
