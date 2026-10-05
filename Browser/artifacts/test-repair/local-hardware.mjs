// Keep validation outputs isolated; each test uses the verified hardware launcher.
import fs from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
import {dirname,isAbsolute,relative,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const artifacts=fileURLToPath(new URL('../',import.meta.url));
const destination=fileURLToPath(new URL('./hardware-media/',import.meta.url));
const original={writeFile:fs.promises.writeFile.bind(fs.promises),mkdir:fs.promises.mkdir.bind(fs.promises),writeFileSync:fs.writeFileSync.bind(fs),mkdirSync:fs.mkdirSync.bind(fs)};
function outputPath(path){
  if(typeof path!=='string'&&!(path instanceof URL))return path;
  const absolute=resolve(path instanceof URL?fileURLToPath(path):path);
  const local=relative(artifacts,absolute);
  if(local==='..'||local.startsWith('..'+sep)||isAbsolute(local)||absolute===destination||absolute.startsWith(destination+sep))return path;
  return resolve(destination,local);
}
fs.promises.mkdir=(path,...args)=>original.mkdir(outputPath(path),...args);
fs.promises.writeFile=async(path,...args)=>{const target=outputPath(path);if(target!==path)await original.mkdir(dirname(target),{recursive:true});return original.writeFile(target,...args);};
fs.mkdirSync=(path,...args)=>original.mkdirSync(outputPath(path),...args);
fs.writeFileSync=(path,...args)=>{const target=outputPath(path);if(target!==path)original.mkdirSync(dirname(target),{recursive:true});return original.writeFileSync(target,...args);};
syncBuiltinESMExports();
console.log('Local validation: verified hardware launcher; unchanged assertions; isolated output paths.');
