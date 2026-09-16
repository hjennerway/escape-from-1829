import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url)));
const previous=process.argv.length>2?JSON.parse(readFileSync(new URL('../../Research/annexe-photo-placement/test-results.json',import.meta.url))):[];
const commands=process.argv.length>2?process.argv.slice(2).map(file=>'node '+file):pkg.scripts.test.split(' && ');
const updates=commands.map(command=>{
 const file=command.replace(/^node /,''),p=spawnSync(process.execPath,[file],{cwd:new URL('../',import.meta.url),encoding:'utf8'});
 console.log((p.status===0?'PASS ':'FAIL ')+file);return {file,status:p.status,output:p.stdout+p.stderr};
});
const results=[...previous.filter(r=>!updates.some(u=>u.file===r.file)),...updates];
writeFileSync(new URL('../../Research/annexe-photo-placement/test-results.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
console.log(`${results.filter(r=>r.status===0).length}/${results.length} passed`);

