import assert from 'node:assert/strict';
export async function load(url,context,nextLoad){
 const result=await nextLoad(url,context);if(!url.endsWith('/dist/tower-workshops.mjs'))return result;
 let source=String(result.source);
 const edits=[
  ['replacedBounds.some(bounds=>bounds.intersectsBox(b))||',''],
  ['||oldGalleryFitting(o)',''],
  ['   if(oldGalleryFitting(o)){removed.push([o,o.parent]);o.removeFromParent();continue;}',''],
  ["oldGalleryRoof?[{...runs.find(r=>r.id==='gallery'),half:FARNDON_CORRIDOR.width,startPadding:0,endPadding:0}]:",''],
  [" masonry([galleryRight,-40.5],[galleryRight,-16.6],gallery.height,8.84,'Stores gallery upper masonry');",''],
  [" masonry([galleryRight,-16.6],[galleryLeft,-16.6],gallery.height,8.84,'Stores gallery upper end return');",'']
 ];
 for(const [from,to] of edits){assert(source.includes(from),'Baseline marker missing: '+from);source=source.replace(from,to);}
 const roof=/ if\(galleryRoof\)addWorkshopGalleryRoof\(THREE,\{group,resources,gallery,roof:galleryRoof,brick:outsideBrick,ridge:galleryRidge\?\?red,masonry,segments:\[[\s\S]*?\n \]\}\);/;
 assert(roof.test(source),'Baseline gallery roof marker missing');source=source.replace(roof,'');
 return {...result,source};
}
