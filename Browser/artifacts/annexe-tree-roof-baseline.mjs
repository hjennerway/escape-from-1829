import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){const result=next(url,context);if(url.endsWith('/kml-tree-data.mjs'))return {...result,source:String(result.source).replace("const scale=point.name==='Oak24'?.55:1;","const scale=1;")};return result;}});
await import(new URL('../'+process.argv[2],import.meta.url));
