// Run from the repository with NODE_PATH pointing to a runtime containing sharp.
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),sharp=require('sharp');
const sources={
 'oakmere-rear-court':'Research/oakmere/rear-court-photo.png',
 'willows':'Research/willows/img1.jpg',
 '1829-front':'Browser/dist/exterior/1829front.webp','1829-front-2':'Browser/dist/exterior/1829front2.webp','1829-front-3':'Browser/dist/exterior/1829front3.webp',
 '1829-back':'Research/1829-back/img1.jpg',
 'grindley-mural':'Research/grindley/ward-mural.png',
 'grindley-interior':'Research/grindley/interior-steps.png',
 'barmere-garden':'Research/redesmere-chimney/img1.jpg','barmere-chimney':'Research/redesmere-chimney/img2.jpg',
 'annexe':'Browser/dist/art/annexe.png','annexe-2':'Browser/dist/art/annexe2.png','chimney':'Browser/dist/art/chimney.png',
 'annexe-kitchen':'Research/annexe-kitchen/img1.jpg',
 'annexe-entrance-road':'Research/annexe-photos/entrance-road.png',
 'jodrell-mural':'Research/annexe-photos/jodrell-mural.png',
 'tarvin-mural':'Research/annexe-photos/tarvin-mural.png',
 'carden-mural':'Research/annexe-photos/carden-mural.png',
 'annexe-outer':'Research/annexe-outer-front/img1.jpg','oakmere-lawn':'Research/oakmere/lawn-gallery.png',
 'farndon-2':'Research/farndon/img2.jpg',
 'daresbury-corner':'Research/hale-daresbury-huxley-dunham/inside-corners/img2.jpg',
 'dunham-daresbury-garden':'Research/hale-daresbury-huxley-dunham/inside-corners/img1.jpg',
 'upton':'Research/upton-frith-oscroft/outward-facade.jpg','upton-aerial':'Research/upton-frith-oscroft/aerial.png',
 'irby-1':'Research/irby-ashley/img1.jpg','irby-3':'Research/irby-ashley/img3.jpg',
 'irby-ashley-mural':'Research/irby-ashley/ward-mural.png',
 'shop':'Research/laundry/img1.jpg','garages-1':'Research/garages/img1.jpg','garages-2':'Research/garages/img2.jpg',
 'church':'Research/church/googleearth.png','church-clock-front':'Research/church/clock-front-reference.png',
 'churton-roadside':'Research/churton-kelsall/roadside-mast.png',
 ...Object.fromEntries([1,2,3,4].map(n=>[`tower-${n}`,`Research/water-tower/${n}.jpg`])),
 ...Object.fromEntries([1,2,3].map(n=>[`outhouse-${n}`,`Research/outhouse/img${n}.jpg`])),
 'greenhouses':'Research/greenhouses/img1.jpg','greenhouses-interior':'Research/greenhouses/interior.png','estates':'Research/estates/img1.jpg','stores':'Research/tower-buildings/img2.jpg','grafton':'Research/grafton-edge/veranda.jpg',
 'admin-1':'Research/main-refine2/img1.jpg','admin-2':'Research/main-refine2/img2.jpg',
 'admin-front-approach':'Research/main-admin-photos/img3.jpg','admin-front-historic':'Research/main-admin-photos/img4.jpg',
 'admin-midwifery':'Research/main-admin-photos/img1.jpg','admin-front-elevated':'Research/main-admin-photos/img2.jpg',
 'tower-buildings-1':'Research/tower-buildings/img1.jpg','workshops':'Research/tower-buildings/twin-workshops/img1.jpg',
 'admin-corridor':'Research/historic-roads/admin-to-annexe-photo.png'
};
const root=new URL('../',import.meta.url),output=new URL('./dist/building-photos/',import.meta.url);
await mkdir(output,{recursive:true});
const manifest={};
for(const [name,source] of Object.entries(sources)){
 const {fileURLToPath}=await import('node:url');
 const info=await sharp(fileURLToPath(new URL(source,root))).rotate().resize({width:1200,height:1000,fit:'inside',withoutEnlargement:true}).webp({quality:80}).toFile(fileURLToPath(new URL(`${name}.webp`,output)));
 manifest[name]={source,width:info.width,height:info.height,bytes:info.size};
}
await writeFile(new URL('sources.json',output),JSON.stringify(manifest,null,2)+'\n');
console.log(`Prepared ${Object.keys(manifest).length} photographs (${Math.round(Object.values(manifest).reduce((n,p)=>n+p.bytes,0)/1024)} KB).`);
