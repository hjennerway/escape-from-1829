import {readFileSync} from 'node:fs';
for(const name of ['delivery.txt','suite-remainder.txt'])console.log(name,readFileSync(new URL(name,import.meta.url),'utf8').slice(-1800));
