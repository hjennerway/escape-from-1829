import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../dist/aerial-layouts.mjs';
import {KML_TREES} from '../dist/kml-tree-data.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},measureText(t){return {width:t.length*16}},strokeText(){},fillText(){}})})};
const e=createEscapeExterior(THREE,1.5),l=createAerialLayouts(THREE,e);e.model.updateMatrixWorld(true);
const tree=KML_TREES.find(t=>t.name==='Beech2'),r=new THREE.Raycaster(),hits=[];
for(let i=0;i<180;i++){const a=i/180*Math.PI*2,p=[tree.x+1.8*Math.cos(a),tree.z+1.8*Math.sin(a)];r.set(new THREE.Vector3(p[0],2,p[1]),new THREE.Vector3(0,-1,0));const h=r.intersectObject(l.historicRoads,true)[0];if(h&&['black road','stone kerb'].includes(h.object.userData.surface))hits.push({i,p,name:h.object.name});}console.log(hits);
