// Plain double-door storage in the dispensary cabinet's worn timber/brass finish.
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {FURNITURE_CATALOG} from './asylum-furniture.mjs';
import {createMedicalFurnitureMaterials} from './medical-furniture-models.mjs';

export function createWardrobeModel(THREE){
 const materials=createMedicalFurnitureMaterials(THREE),pieces={};
 function add(key,geometry){(pieces[key]??=[]).push(geometry);}
 function box(key,w,h,d,x,y,z){add(key,new THREE.BoxGeometry(w,h,d).translate(x,y,z));}
 // Rectangular case with a low closed plinth; no glazed top, drawers or open shelf.
 box('darkWood',1.42,.12,.54,0,.06,-.025);
 box('darkWood',1.38,1.99,.035,0,1.115,-.3075);
 for(const x of [-.715,.715])box('wood',.07,1.99,.60,x,1.115,-.025);
 for(const y of [.14,2.13])box('wood',1.50,.04,.60,0,y,-.025);
 box('darkWood',1.36,1.95,.025,0,1.135,.235);
 for(const side of [-1,1]){
  const x=side*.342;
  box('wood',.666,1.89,.034,x,1.135,.258);
  // Shallow timber framing makes the two solid doors legible in room lighting.
  for(const edge of [-1,1])box('wood',.045,1.89,.014,x+edge*.3105,1.135,.282);
  for(const y of [.2125,2.0575])box('wood',.621,.045,.014,x,y,.282);
  add('brass',new THREE.SphereGeometry(.027,12,8).translate(side*.078,1.12,.298));
  for(const y of [.45,1.82])box('brass',.018,.10,.008,side*.663,y,.293);
 }
 const parts=Object.entries(pieces).map(([key,list])=>({geometry:mergeGeometries(list),material:materials[key],paint:materials[key]}));
 const bounds=new THREE.Box3();for(const part of parts){part.geometry.computeBoundingBox();bounds.union(part.geometry.boundingBox);}
 const size=bounds.getSize(new THREE.Vector3()),model=FURNITURE_CATALOG.cupboard;
 for(const part of parts){
  part.geometry.translate(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y,-(bounds.min.z+bounds.max.z)/2);
  part.geometry.scale(model.width/size.x,model.height/size.y,model.depth/size.z);
  part.geometry.computeBoundingBox();part.geometry.computeBoundingSphere();
 }
 for(const [key,material] of Object.entries(materials))if(!pieces[key])material.dispose();
 return parts;
}
