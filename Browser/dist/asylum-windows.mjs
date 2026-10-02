// Fit each generated sash inside its original facade bay. The sill is wider
// and deeper than the glass; reserve masonry clearance around that full trim.
export const ASYLUM_WINDOW_WIDTH=1.1;
export const ASYLUM_WINDOW_CLEARANCE=.15;
const epsilon=1e-7,halfSill=(ASYLUM_WINDOW_WIDTH+.2)/2;
export function asylumWindowCenters(wall,walls){
 const {a,b}=wall,length=Math.hypot(b[0]-a[0],b[1]-a[1]);
 if(!wall.exterior||length<3.5)return [];
 const count=Math.floor(length/4.2),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length;
 const project=p=>[(p[0]-a[0])*dx+(p[1]-a[1])*dz,-(p[0]-a[0])*dz+(p[1]-a[1])*dx];
 const normalReach=.16+.09+ASYLUM_WINDOW_CLEARANCE,alongReach=halfSill+.09+ASYLUM_WINDOW_CLEARANCE;
 const blocked=[];
 for(const other of walls){
  if(other===wall)continue;
  const p=project(other.a),q=project(other.b),dn=q[1]-p[1];
  let lo=0,hi=1;
  if(Math.abs(dn)<epsilon){if(Math.abs(p[1])>normalReach)continue;}
  else{
   const cuts=[(-normalReach-p[1])/dn,(normalReach-p[1])/dn].sort((a,b)=>a-b);
   lo=Math.max(0,cuts[0]);hi=Math.min(1,cuts[1]);if(lo>hi)continue;
  }
  const ends=[p[0]+(q[0]-p[0])*lo,p[0]+(q[0]-p[0])*hi];
  blocked.push([Math.min(...ends)-alongReach,Math.max(...ends)+alongReach]);
 }
 let previous=-Infinity;
 return Array.from({length:count},(_,i)=>{
  const target=length*(i+.5)/count,margin=halfSill+ASYLUM_WINDOW_CLEARANCE;
  let spans=[[Math.max(margin,length*i/count,previous+2*halfSill+ASYLUM_WINDOW_CLEARANCE),Math.min(length-margin,length*(i+1)/count)]];
  spans=spans.filter(([lo,hi])=>lo<=hi);
  for(const [lo,hi] of blocked)spans=spans.flatMap(([a,b])=>{
   if(hi<=a||lo>=b)return [[a,b]];
   return [...(lo>a?[[a,lo]]:[]),...(hi<b?[[hi,b]]:[])];
  });
  if(!spans.length)throw new Error(`No clear window bay at ${a[0]},${a[1]} to ${b[0]},${b[1]} (bay ${i})`);
  const candidates=spans.map(([lo,hi])=>Math.max(lo,Math.min(hi,target)));
  candidates.sort((a,b)=>Math.abs(a-target)-Math.abs(b-target)||a-b);
  previous=candidates[0];return previous;
 });
}
