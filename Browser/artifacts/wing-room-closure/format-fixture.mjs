import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const file=new URL('../../fixtures/asylum-wall-joins.json',import.meta.url),fixtures=JSON.parse(await readFile(file));
const text='[\n'+fixtures.map(f=>'  {"floor":'+f.floor+',"gaps":[\n'+f.gaps.map(g=>'    '+JSON.stringify(g)).join(',\n')+'\n  ]}').join(',\n')+'\n]\n';
assert.deepEqual(JSON.parse(text),fixtures);await writeFile(file,text);
