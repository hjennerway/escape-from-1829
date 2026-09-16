import {readFileSync,writeFileSync} from 'node:fs';
for(const [source,target] of [['../dist/escape-exterior.mjs','escape-exterior-baseline.mjs'],['annexe-before-os.mjs.txt','annexe-baseline.mjs'],['annexe-outer-before-os.mjs.txt','annexe-outer-baseline.mjs'],['annexe-oakmere-before-os.mjs.txt','annexe-oakmere-baseline.mjs']]){
 let text=readFileSync(new URL(source,import.meta.url),'utf8').replaceAll("from './","from '../dist/");
 for(const [name,baseline] of [['annexe','annexe'],['annexe-outer-front','annexe-outer'],['annexe-oakmere-detail','annexe-oakmere']])text=text.replaceAll("from '../dist/"+name+".mjs'","from './"+baseline+"-baseline.mjs'");
 writeFileSync(new URL(target,import.meta.url),text);
}
