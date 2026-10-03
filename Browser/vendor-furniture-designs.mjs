import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const shop='d670906ae258a80eefe9ec65d5cccffe67d2f1fb',bench='081fd0bc28486aff01fa4dde2d64227809a7ac01';
const sources=[
 {repository:'ShopPrentice/shopprentice',commit:shop,license:'MIT',files:['LICENSE','examples/windsor-chair/README.md','examples/windsor-chair/model.json','examples/windsor-chair/windsor_chair.py','examples/windsor-chair/iso.png','examples/shaker-nightstand/README.md','examples/shaker-nightstand/model.json','examples/shaker-nightstand/shaker_nightstand.py','examples/shaker-nightstand/screenshots/iso-top-right.png']},
 {repository:'Compagnia-d-Arme-del-Santo-Luca/medieval_furniture',commit:bench,license:'GPL-3.0',files:['LICENSE','README.md','stp_files/Panca_50.stp']}
];
const root=new URL('../Research/room-furnishings/sources/',import.meta.url),hash=data=>createHash('sha256').update(data).digest('hex');
if(process.argv.includes('--check')){
 const manifest=JSON.parse(await readFile(new URL('manifest.json',root)));
 for(const source of sources){const saved=manifest.find(s=>s.repository===source.repository);if(saved.commit!==source.commit)throw Error('Furniture design revision changed');for(const f of saved.files)if(hash(await readFile(new URL(f.local,root)))!==f.sha256)throw Error('Furniture source changed: '+f.local);}
 const assets=new URL('./dist/models/furniture/',import.meta.url),designs=JSON.parse(await readFile(new URL('design-manifest.json',assets)));
 for(const f of designs.files)if(hash(await readFile(new URL(f.path,assets)))!==f.sha256)throw Error('Generated furniture changed: '+f.path);
 console.log('PASS: pinned Windsor/Shaker MIT sources, Panca GPL-3.0 STEP source, original licences and generated mesh hashes.');
}else{
 const records=[];
 for(const source of sources){
  const record={...source,files:[]},folder=source.repository.split('/')[1];
  for(const path of source.files){
   const url=`https://raw.githubusercontent.com/${source.repository}/${source.commit}/${path}`,response=await fetch(url);if(!response.ok)throw Error(`${response.status}: ${url}`);
   const data=Buffer.from(await response.arrayBuffer()),local=folder+'/'+path,destination=new URL(local,root);await mkdir(new URL('./',destination),{recursive:true});await writeFile(destination,data);record.files.push({path,local,bytes:data.length,sha256:hash(data)});
  }
  records.push(record);
 }
 await writeFile(new URL('manifest.json',root),JSON.stringify(records,null,2)+'\n');
 const assets=new URL('./dist/models/furniture/',import.meta.url);await mkdir(assets,{recursive:true});
 for(const [folder,name] of [['shopprentice','ShopPrentice-MIT.txt'],['medieval_furniture','Panca-GPL-3.0.txt']])await writeFile(new URL(name,assets),await readFile(new URL(folder+'/LICENSE',root)));
 console.log('Downloaded pinned furniture design sources, references and original licences.');
}
