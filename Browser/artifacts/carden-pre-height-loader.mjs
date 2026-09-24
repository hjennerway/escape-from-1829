import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
 const result=next(url,context);if(!url.endsWith('/annexe.mjs')&&!url.endsWith('/annexe-carden-detail.mjs'))return result;
 let s=String(result.source);
 if(url.endsWith('/annexe.mjs'))s=s.replace(' shortenAnnexeTowers(THREE,model,ranges,openings);','');
 else s=s.replaceAll('*ANNEXE_TOWER_HEIGHT_SCALE','').replace('z:-27.25,w:8.87,d:18.5','z:-24,w:8.87,d:12').replace("window('Carden low rear sash',24.735,2.5,-36.535,1.4,3.0,Math.PI,{bars:false});","window('Carden low side sash',20.335,2.5,-31.3,1.4,3.0,Math.PI/2,{bars:false});");
 return {...result,source:s};
}});
