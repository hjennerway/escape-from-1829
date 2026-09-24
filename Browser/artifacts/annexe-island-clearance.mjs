import {HISTORIC_ROAD_TRACES} from '../dist/historic-road-layout.mjs';
import {IRBY_ROUNDED_BEND} from '../dist/irby-junction-rounding.mjs';
import {KML_TREES} from '../dist/kml-tree-data.mjs';
const t=KML_TREES.find(t=>t.name==='Beech2'),p=[t.x,t.z];
const dist=(p,a,b)=>{const v=b.map((x,i)=>x-a[i]),l=v.reduce((s,x)=>s+x*x,0),u=Math.max(0,Math.min(1,v.reduce((s,x,i)=>s+x*(p[i]-a[i]),0)/l));return Math.hypot(...a.map((x,i)=>x+u*v[i]-p[i]));};
const min=pts=>Math.min(...pts.slice(1).map((b,i)=>dist(p,pts[i],b)));
for(const r of HISTORIC_ROAD_TRACES.filter(r=>/tree-gap|southern fork/.test(r.name)))console.log(r.name,min(r.points));
console.log('bend lawn edge',min(IRBY_ROUNDED_BEND.points));
for(const c of [[314,-88.5],[315,-90],[316,-91],[318,-90],[317,-89]]){
const a=[298,-99],b=[312,-94],d=[319.3,-84.912],pts=Array.from({length:25},(_,i)=>{const t=i/24,q=1-t;return a.map((v,k)=>q*q*q*v+3*q*q*t*b[k]+3*q*t*t*c[k]+t*t*t*d[k]);});console.log(c,min(pts));
}
