import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const commit='96d5930a8dbdb363409bbc2d3341718b00e17c9c';
const repository='KayKit-Game-Assets/KayKit-Furniture-Bits-1.0';
const source=`https://raw.githubusercontent.com/${repository}/${commit}/addons/kaykit_furniture_bits/Assets/`;
const destination=new URL('./dist/models/furniture/',import.meta.url);
const names=['bed_single_A','shelf_B_large','table_medium','book_set'];
const files=['LICENSE.txt','gltf/furniturebits_texture.png',...names.flatMap(name=>[`gltf/${name}.gltf`,`gltf/${name}.bin`])];
const hash=data=>createHash('sha256').update(data).digest('hex');
if(process.argv.includes('--check')){
 const manifest=JSON.parse(await readFile(new URL('manifest.json',destination)));
 if(manifest.commit!==commit||manifest.models.join(',')!==names.join(','))throw Error('Furniture source selection changed');
 for(const file of manifest.files){const data=await readFile(new URL(file.path,destination));if(hash(data)!==file.sha256)throw Error('Furniture asset changed: '+file.path);}
 console.log(`PASS: four retained KayKit CC0 furniture models and licence, ${manifest.files.length} pinned source files verified.`);
}else{
 await mkdir(destination,{recursive:true});
 const records=[];
 for(const file of files){
  const response=await fetch(source+file);if(!response.ok)throw Error(`Furniture download ${response.status}: ${file}`);
  const data=Buffer.from(await response.arrayBuffer()),path=file.replace('gltf/','');
  await writeFile(new URL(path,destination),data);records.push({path,bytes:data.length,sha256:hash(data)});
 }
 await writeFile(new URL('manifest.json',destination),JSON.stringify({author:'Kay Lousberg',license:'CC0-1.0',repository:`https://github.com/${repository}`,commit,models:names,files:records},null,2)+'\n');
 console.log(`Downloaded four retained CC0 models (${records.reduce((n,f)=>n+f.bytes,0)} bytes), including their original licence.`);
}
