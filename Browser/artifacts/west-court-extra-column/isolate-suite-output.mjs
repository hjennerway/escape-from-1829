import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
 const result=next(url,context);
 if(!url.endsWith('/test-ground-contact.mjs'))return result;
 const source=typeof result.source==='string'?result.source:Buffer.from(result.source).toString('utf8');
 return {...result,source:source.replace("new URL('artifacts/ground-contact-audit.json',import.meta.url)","new URL('artifacts/west-court-extra-column/ground-contact-audit.json',import.meta.url)")};
}});
