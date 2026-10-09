import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';

const before=new Map(['escape-corridors.mjs','explore-irby-entrance.mjs'].map(name=>[
 new URL('../../dist/'+name,import.meta.url).href,
 readFileSync(new URL('before/'+name,import.meta.url),'utf8')
]));
registerHooks({load(url,context,nextLoad){
 const result=nextLoad(url,context);
 return before.has(url)?{...result,source:before.get(url)}:result;
}});
try{
 await import('../../test-explore-workshops.mjs');
 throw new Error('The original overlapping floor unexpectedly passed.');
}catch(error){
 if(!error.message.includes('One level floor surface on each side of the Irby threshold joint'))throw error;
 console.log('PASS: the new floor regression rejects the original coplanar threshold/concrete overlap.');
}
