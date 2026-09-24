import {stretchAnnexeRearRange} from './annexe-rear-stretch.mjs';
// The September OS/render colour match supersedes the earlier symmetric plan.
// Pixel coordinates refer to the 310 x 395 supplied extract. The blue front is
// the fixed local anchor; circles identify blocks, not the traced wall edges.
export const ANNEXE_OS_REFINEMENT=Object.freeze({
 source:'Research/annexe-os-refinement/marked-os-map.png',
 matchingRender:'Research/annexe-os-refinement/matching-render.png',
 frontLine:[[76,73],[105,80]],
 blocks:[
  {colour:'yellow',name:'West outer wards',outline:[[29,12],[45,15],[42,23],[35,22],[31,33],[43,35],[40,50],[11,45],[15,29],[23,30]]},
  {colour:'orange',name:'West front court',outline:[[47,48],[74,56],[70,81],[40,73]],court:[[53,55],[67,60],[64,70],[57,68],[57,63],[51,62]]},
  {colour:'purple',name:'East front court',outline:[[108,64],[141,73],[132,99],[100,90]],court:[[113,71],[126,74],[124,78],[118,77],[116,82],[108,80]]},
  {colour:'pink',name:'East outer wards',outline:[[162,45],[178,49],[175,55],[171,54],[168,65],[175,65],[183,69],[177,76],[170,76],[167,84],[174,87],[174,95],[150,87],[150,67],[155,69],[153,78],[160,78],[165,53],[161,52]]},
  {colour:'brown',name:'Rear courtyard block',outline:[[90,29],[108,35],[108,52],[82,47]],court:[[95,34],[104,36],[103,43],[94,41]]},
  {colour:'pale lavender',name:'Rear angled service head',outline:[[76,6],[91,3],[89,14],[84,20],[91,27],[84,29],[74,12]]},
  {colour:'red',name:'Rear east L',outline:[[108,30],[133,26],[133,13],[139,13],[141,33],[111,39]]}
 ]
});
// Front corners map to x=-20/+20, z=17 in the existing dimension frame.
// This preserves the accepted frontage rather than rescaling the whole model.
export function annexeRefinementPixel([u,v]){
 const dx=u-90.5,dy=v-76.5,d=29*29+7*7;
 return [40*(29*dx+7*dy)/d,17+40*(-7*dx+29*dy)/d];
}
// Squared masonry fits to those pixel picks. Thin links and the small notches
// are regularised within the scan's roughly 1–2 pixel uncertainty.
const rects={
 'West front connecting ward':[-108,-8,-67,0],
 'West court inner return':[-35,0,-27,30],
 'West court front range':[-67,20,-27,30],
 'West court outer return':[-67,-6,-58,30],
 'West court corner infill':[-58,13,-46,20],
 'East front connecting ward':[65,3,109,11],
 'East court inner return':[20,-4,28,34],
 'East court front range':[20,23,65,34],
 'East court outer return':[56,-4,65,34],
 'East court corner infill':[38,14,56,23],
 'West end ward':[-108,-40,-99,0],
 // September 24 yellow outline removes the return and the pavilion end.
 'West rear pavilion':[-101,-49,-86,-39],
 'West end projecting rooms':[-115,-24,-106,-9],
 'East end ward':[99,-25,109,12],
 'East rear pavilion':[83,-47,105,-38],
 'East rear link':[94,-39,100,5],
 'East end projecting rooms':[107,-25,119,-15],
 'Central rear spine':[-5,-20,5,-12],
 'Rear west angled service range':[-37,-77,-25,-47],
 'Rear service head':[-45,-79,-23,-69],
 'Rear east connecting range':[9,-46,48,-38],
 'Rear east end pavilion':[39,-66,48,-38]
};
export function refineAnnexeRanges(ranges){
 return [...ranges.filter(spec=>spec.name!=='West rear link').map(spec=>({...spec,...(rects[spec.name]?{rect:rects[spec.name]}:{}),
  ...(/Rear west angled service range|Rear service head/.test(spec.name)?{angle:.43}:{})})),
  {name:'West court back range',rect:[-67,-6,-27,1],wardId:'tarvin-jarman'},
  {name:'East court back range',rect:[20,-4,65,3],wardId:'picton-carden'},
  {name:'West court entrance link',rect:[-28,5,-20,11]},
  {name:'West court outer link',rect:[-68,-8,-58,1]},
  {name:'West end middle rooms',rect:[-100,-27,-93,-20],wardId:'larkton-jodrell'},
  {name:'East end inner return',rect:[78,-16,87,11]},
  {name:'East end middle rooms',rect:[87,-12,100,-3]},
  {name:'East end front rooms',rect:[107,4,116,14]},
  {name:'Central rear low hall link',rect:[-5,-12,5,-5],h:4.7,rise:1.5,kitchen:true},
  {name:'Rear court west range',rect:[-19,-44,-8,-20]},
  // The kitchen photograph resolves the inner face and the marked rear view
  // confirms a small access lane, superseding the enclosed OS rectangle.
  {name:'Rear court east range',rect:[5,-44,14,-32]},
  {name:'Rear court back range',rect:[-19,-44,-3,-39]},
  {name:'Rear court back east range',rect:[1,-44,14,-39]},
  {name:'Rear court front range',rect:[-4.5,-29,6.5,-20],h:6.2,rise:4.5,kitchen:true},
  {name:'Rear court front west service link',rect:[-19,-26,-4.5,-20],h:3.3,rise:1.5,kitchen:true},
  {name:'Rear court front east service link',rect:[6.5,-32,14,-20],h:3.6,rise:1.5,kitchen:true},
  // The marked Oakmere photo face begins at z=-44. Stop the low service link
  // at that corner so it cannot bury the first ground-floor sash.
  {name:'Rear service court link',rect:[-26,-49,-14,-44],h:4.3,rise:1.3}
 ].map(spec=>({h:8.4,rise:2.3,...stretchAnnexeRearRange(spec)}));
}
export const ANNEXE_OUTER_FRONT_FITS={west:{start:67,end:108,front:0},east:{start:65,end:109,front:12}};
