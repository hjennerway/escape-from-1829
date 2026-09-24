// Isolate the simultaneous east-veranda task without touching shared files.
import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){const r=next(url,context);let s=String(r.source);
 if(url.endsWith('/dist/annexe.mjs'))s=s.replace(/^import \{addAnnexeEastVeranda\}.*\r?\n/m,'').replace(/^.*model.userData.eastVeranda=addAnnexeEastVeranda.*\r?\n/m,'');
 if(url.endsWith('/dist/annexe-os-refinement.mjs')&&!s.includes("{name:'East end inner return'"))s=s.replace("{name:'East end front rooms'","{name:'East end inner return',rect:[78,-16,87,11]},\n  {name:'East end middle rooms',rect:[87,-12,100,-3]},\n  {name:'East end front rooms'");
 return s===String(r.source)?r:{...r,source:s};}});
