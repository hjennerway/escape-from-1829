// Photographs are bundled locally; no external image requests or tracking.
const photo=(file,caption)=>({src:`./building-photos/${file}.webp`,caption});
const front=[photo('1829-front','1829 · front elevation'),photo('1829-front-2','1829 · entrance and wings'),photo('1829-front-3','1829 · entrance detail')];
const annexe=[photo('annexe','The Annexe · historic photograph'),photo('annexe-2','The Annexe · entrance view'),photo('annexe-entrance-road','The Annexe · entrance road and hospital sign')];
const haleHuxley=[photo('daresbury-corner','Daresbury · courtyard entrance detail'),photo('dunham-daresbury-garden','Dunham / Daresbury · garden and ward elevations')];
export const BUILDING_CATALOG=Object.freeze([
 {id:'1829-centre',name:'1829 · Acton / Grindley',locations:['acton','grindley'],photos:[...front,photo('1829-back','Central building · rear elevation'),photo('grindley-mural','Grindley Ward · bridge and canal mural'),photo('grindley-interior','Grindley Ward · interior steps and doorway')]},
 {id:'1829-west',name:'1829 · Hampton / Ince',locations:['hampton','ince','west-refinement','west-1','west-2','west-3','west-4','west-5'],photos:front},
 {id:'1829-east',name:'1829 · Barton / Caldy / Ebnal',locations:['barton','caldy','ebnal'],photos:front},
 {id:'barmere',name:'1829 · Barmere Ward',photos:[photo('barmere-garden','Garden side and chimney'),photo('barmere-chimney','Low range and chimney')]},
 {id:'redesmere',name:'1829 · Redesmere / Saughall',locations:['redesmere','saughall'],photos:[]},
 {id:'farndon',name:'Farndon Ward',photos:[photo('farndon-2','Farndon · historic photograph')]},
 {id:'hale-daresbury',name:'Hale / Daresbury Ward',photos:haleHuxley},
 {id:'huxley-dunham',name:'Huxley / Dunham Ward',photos:haleHuxley},
 {id:'upton',name:'Upton / Oscroft / Frith Ward',photos:[photo('upton','Garden-facing elevation'),photo('upton-aerial','Aerial photograph')]},
 {id:'witby',name:'Witby Ward',photos:[]},
 {id:'irby-ashley',name:'Irby / Ashley Ward',photos:[photo('irby-1','Irby / Ashley · garden view'),photo('irby-3','Irby / Ashley · side view'),photo('irby-ashley-mural','Irby / Ashley Ward · stairwell mural')]},
 {id:'laundry',name:'Hospital Shop',photos:[photo('shop','Hospital Shop · garden elevation')]},
 {id:'garages',name:'Garages',photos:[photo('garages-1','Garage frontage'),photo('garages-2','Garages, offices and mortuary')]},
 {id:'mortuary',name:'Mortuary',photos:[photo('garages-2','Mortuary beside the garage offices')]},
 {id:'churton',name:'Churton / Kelsall Ward',photos:[photo('churton-roadside','Churton / Kelsall · roadside view and communications mast')]},
 {id:'church',name:'Church',photos:[photo('church','Church and grounds · aerial photograph'),photo('church-clock-front','Church · clock-facing front')]},
 {id:'tower',name:'Water Tower',photos:[1,2,3,4].map(n=>photo(`tower-${n}`,`Water tower · side ${n}${n===2?' · facing 1829':n===4?' · facing the Annexe':''}`))},
 {id:'annexe',name:'The Annexe',locations:['annexe','annexe-kitchen','annexe-rear-court','annexe-carden-photo'],photos:[...annexe,photo('annexe-kitchen','The Annexe · rear kitchen and service court'),photo('annexe-carden-picton','The Annexe · Carden / Picton side and conservatory')]},
 {id:'picton-carden',name:'Annexe · Picton / Carden Ward',photos:[photo('carden-mural','Carden Ward · archway mural')],contextPhotos:annexe},
 {id:'tarvin-jarman',locations:['tarvin-jarman','annexe-jarman-photo'],name:'Annexe · Tarvin / Jarman Ward',photos:[photo('tarvin-mural','Tarvin Ward · village mural')],contextPhotos:annexe},
 {id:'leighton-newton',locations:['leighton-newton','leighton-newton-inner','leighton-newton-outer'],name:'Annexe · Leighton / Newton Ward',photos:[{src:'./building-photos/leighton-newton-inner.jpg',caption:'Leighton / Newton · inner elevation (red camera)'},{src:'./building-photos/leighton-newton-outer.jpg',caption:'Leighton / Newton · veranda elevation (blue camera)'}],contextPhotos:annexe},
 {id:'oakmere',name:'Annexe · Oakmere Ward',photos:[photo('oakmere-rear-court','Oakmere · rear courtyard and square annex')],contextPhotos:[photo('oakmere-lawn','Oakmere lawn · adjoining central rear range')]},
 {id:'larkton-jodrell',name:'Annexe · Larkton / Jodrell Ward',photos:[photo('annexe-outer','Annexe · outer west elevation'),photo('jodrell-mural','Jodrell Ward · radio telescope mural')]},
 {id:'greenhouses',name:'Greenhouses',photos:[photo('greenhouses','Greenhouses and gardeners’ buildings'),photo('greenhouses-interior','Greenhouses · interior and growing benches')]},
 {id:'outhouse',name:'Outhouse',photos:[1,2,3].map(n=>photo(`outhouse-${n}`,`Outhouse · view ${n}`))},
 {id:'willows',name:'The Willows',locations:['willows','willows-photo','willows-plan'],photos:[photo('willows','The Willows · lower photograph supplies the building reference')]},
 {id:'estates',name:'Estates Department',photos:[photo('estates','Estates Department · service court')]},
 {id:'stores',name:'Stores',photos:[photo('stores','Stores · frontage and access ramp')]},
 {id:'grafton-edge',name:'Grafton / Edge Ward',photos:[photo('grafton','Grafton / Edge · veranda')]},
 {id:'main-admin',name:'Main / Admin Building',photos:[photo('admin-1','Main/Admin · side elevation'),photo('admin-2','Main/Admin · rear court'),photo('admin-front-approach','Main/Admin · front approach'),photo('admin-front-historic','Main/Admin · historic front elevation'),photo('admin-midwifery','Main/Admin · School of Nursing & Midwifery entrance'),photo('admin-front-elevated','Main/Admin · elevated view of the entrance and forecourt')]},
 {id:'main-kitchen',name:'Main kitchen',photos:[]},
 {id:'tower-buildings',name:'Tower service buildings',photos:[photo('tower-buildings-1','Service buildings beside the tower'),photo('workshops','Twin workshops')]},
 {id:'admin-corridor',name:'Main / Admin connecting corridor',locations:['ward-corridors'],photos:[photo('admin-corridor','Former corridor location · present-day view')]},
 {id:'estate-chimney',name:'Estate chimney',locations:['tower-buildings'],photos:[photo('chimney','Estate chimney')]}
].map(entry=>Object.freeze({locations:[entry.id],...entry})));
