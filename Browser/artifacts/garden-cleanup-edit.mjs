import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
mkdirSync('Browser/artifacts/garden-cleanup-baseline',{recursive:true});
const edits={
 'Browser/dist/entrance-walks.mjs':[[
`  east.moveTo(27,-43);east.lineTo(41,-43);east.lineTo(41,-19.6);
  east.lineTo(45,-19.6);east.lineTo(45,-27.4);
  east.quadraticCurveTo(45,-28.45,46.1,-28.45);
  east.lineTo(48.6,-28.45);east.lineTo(48.6,-30.55);`,
`  // Fill the small grass recess against the cross-range wall. Continue the
  // same surface through the garden cross-walk and passage, with one straight
  // lawn edge at z=30.55 instead of overlapping slabs ending at different z.
  east.moveTo(27,-43);east.lineTo(41,-43);east.lineTo(41,-16.9);
  east.lineTo(45,-16.9);east.lineTo(45,-27.4);
  east.quadraticCurveTo(45,-28.45,46.1,-28.45);
  east.lineTo(72.45,-28.45);east.lineTo(72.45,4);
  east.lineTo(79.55,4);east.lineTo(79.55,-30.55);`]],
 'Browser/dist/east-photo-detail.mjs':[[
`  // Photo foreground: an access lane close to the building and a slim young tree.
  const paving=material(0xb7b9ac);
  box(paving,61,.18,29.5,25,.1,2.1);`,
`  // The garden cross-walk shares the continuous entrance/passage gravel in
  // entrance-walks.mjs; no differently coloured slab overlaps it here.`]],
 'Browser/dist/escape-exterior.mjs':[[
`    const body=mesh(worldUV(rearArm?wingWallGeometry(THREE,base):new THREE.BoxGeometry(w,h-base,d),detail?1.7:3),detail?photoBrick:brick,x,(h+base)/2,z,true);`,
`    // The service room meets the low brick range at z=10. Its white base,
    // floor band and lower brickwork stop there instead of overlapping the
    // end range's west-facing wall over z=10..11.5.
    const serviceJoin=Math.abs(x-81.875)<.01&&z===8;
    const bodyBase=serviceJoin?4.55:base;
    const body=mesh(worldUV(rearArm?wingWallGeometry(THREE,base):new THREE.BoxGeometry(w,h-bodyBase,d),detail?1.7:3),detail?photoBrick:brick,x,(h+bodyBase)/2,z,true);
    const lowerDepth=serviceJoin?5.5:d,lowerZ=serviceJoin?7.25:z;
    if(serviceJoin)mesh(worldUV(new THREE.BoxGeometry(w,bodyBase-base,lowerDepth),1.7),photoBrick,x,(bodyBase+base)/2,lowerZ,true).name='Redesmere service wall above white base';`],[
`      else box(detail?white:cream,middle,lowerHeight/2,z,width,lowerHeight,d);
      if(!westDetail)box(detail?white:cream,middle,foundation+(detail?.04:.1),z,width+(detail?.13:.23),detail?.16:.22,d+(detail?.13:.23));`,
`      else box(detail?white:cream,middle,lowerHeight/2,lowerZ,width,lowerHeight,lowerDepth);
      if(!westDetail)box(detail?white:cream,middle,foundation+(detail?.04:.1),serviceJoin?lowerZ-.0325:z,width+(detail?.13:.23),detail?.16:.22,serviceJoin?lowerDepth+.065:d+(detail?.13:.23));`],[
`  box(path,courtyardPassage.x,.2,13,courtyardPassage.width,.1,34);`,
`  // The passage paving is joined to the garden cross-walk in addEntranceWalks.`]],
 'Browser/test-modern-entrance.mjs':[[
`assert.equal(surfaceAt(48.7,29.5).object.material.color.getHex(),0xb7b9ac,'East branch reaches the existing Redesmere courtyard paving');`,
`assert.equal(surfaceAt(48.7,29.5).object.material,forecourt.material,'East branch and Redesmere cross-walk share one gravel material');
pavedRoute([[48.1,29.5],[76,29.5],[76,6]]);`]]
};
for(const [file,replacements] of Object.entries(edits)){
 let source=readFileSync(file,'utf8').replaceAll('\r\n','\n');
 for(const [before,after] of replacements){if(source.split(before).length!==2)throw new Error('Expected one match in '+file);source=source.replace(before,after);}
 copyFileSync(file,'Browser/artifacts/garden-cleanup-baseline/'+file.split('/').pop());
 writeFileSync(file,source);
}
