import {readFile} from 'node:fs/promises';

export async function load(url,context,nextLoad){
 if(!url.endsWith('/dist/tower-workshops.mjs'))return nextLoad(url,context);
 let source=(await readFile(new URL(url),'utf8')).replaceAll('\r\n','\n');
 const start=source.indexOf('   if(h.y0){\n    const height='),end=source.indexOf('   z=h.z+h.w/2;}',start);
 if(start<0||end<0)throw Error('Interior sash correction not found');
 source=source.slice(0,start)+"   if(h.y0){box(glass,[.035,h.y1-h.y0,h.w],[westX+.275,(h.y0+h.y1)/2,h.z],'Inner sash glass');for(const dz of [-h.w/2,0,h.w/2])box(cream,[.065,h.y1-h.y0,.045],[westX+.31,(h.y0+h.y1)/2,h.z+dz],'Inner sash muntin');box(cream,[.3,.13,h.w+.2],[westX+.36,h.y0-.065,h.z],'Stone window sill');}\n"+source.slice(end);
 return {format:'module',source,shortCircuit:true};
}
