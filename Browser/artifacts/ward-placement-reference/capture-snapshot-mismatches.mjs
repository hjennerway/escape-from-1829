// Diagnostic only: collect obsolete fingerprint assertions while allowing the
// remaining independent geometry assertions to run. Never used by npm test.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const failures=[];
for(const method of ['deepEqual','deepStrictEqual','equal','strictEqual']){
 const original=assert[method];
 assert[method]=function(actual,expected,...rest){
  try{return original(actual,expected,...rest);}catch(error){
   const fingerprint=(value)=>typeof value==='string'?/^[a-f0-9]{64}$/.test(value):value&&typeof value==='object'&&Object.values(value).some(fingerprint);
   if(!fingerprint(actual)||!fingerprint(expected))throw error;
   failures.push({method,actual,expected,message:rest[0],stack:error.stack.split('\n').slice(-5)});
  }
 };
}
process.on('exit',code=>writeFileSync(process.env.SNAPSHOT_AUDIT_OUTPUT,JSON.stringify({code,failures},null,2)+'\n'));
