import assert from 'node:assert/strict';
import {EARTH_ANCHOR} from './dist/earth-registration.mjs';
import {distanceToEstate,locateOnEstate,bindDeviceLocation,OUTSIDE_SITE_MESSAGE} from './dist/device-location.mjs';

const square=[[0,0],[200,0],[200,200],[0,200]];
assert.equal(distanceToEstate(100,100,square),0,'Interior points work even far from an edge');
assert.equal(distanceToEstate(200,100,square),0);
assert.equal(distanceToEstate(299,100,square),99);
assert.equal(distanceToEstate(301,100,square),101);
assert.equal(distanceToEstate(260,280,square),100,'Corners use radial distance, not an expanded bounding box');
const concave=[[0,0],[300,0],[300,100],[100,100],[100,300],[0,300]];
assert.equal(distanceToEstate(200,200,concave),100,'Indentations are outside the estate');
assert.equal(distanceToEstate(NaN,0),Infinity);
assert.equal(distanceToEstate(0,19.5),0,'1829 entrance is inside');
assert.equal(distanceToEstate(440,-10),0,'Annexe is inside');
assert.equal(distanceToEstate(160,300),0,'Southern grounds are inside');

// Invert the established rotation for fixtures at exact offsets from the edge.
function coordinatesAt(x,z){
  const length=Math.hypot(.55,.835),dx=x-EARTH_ANCHOR.x,dz=z-EARTH_ANCHOR.z;
  return {latitude:EARTH_ANCHOR.latitude+(.835*dx+.55*dz)/length/111320,
    longitude:EARTH_ANCHOR.longitude+(-.55*dx+.835*dz)/length/(111320*Math.cos(EARTH_ANCHOR.latitude*Math.PI/180))};
}
assert.equal(locateOnEstate(coordinatesAt(0,-354)).nearby,true);
assert.equal(locateOnEstate(coordinatesAt(0,-355)).nearby,true,'Exactly 100 m is allowed');
assert.equal(locateOnEstate(coordinatesAt(0,-356)).nearby,false);
assert.equal(locateOnEstate({latitude:51.5074,longitude:-.1278}).nearby,false);
for(const coords of [undefined,{}, {latitude:NaN,longitude:0},{latitude:91,longitude:0},{latitude:0,longitude:181}])assert.equal(locateOnEstate(coords),null);

class Button extends EventTarget{
  disabled=true;attributes=new Map();
  setAttribute(key,value){this.attributes.set(key,value);}
  removeAttribute(key){this.attributes.delete(key);}
  click(){this.dispatchEvent(new Event('click'));}
}
function setup(overrides={}){
  const button=new Button(),status={textContent:''},requests=[],locations=[];
  const marker={visible:false,point:null,show(point){this.point=point;this.visible=true;},hide(){this.visible=false;}};
  const geolocation={getCurrentPosition(success,error,options){requests.push({success,error,options});}};
  bindDeviceLocation({button,status,marker,geolocation,secureContext:true,onLocate:point=>locations.push(point),...overrides});
  return {button,status,marker,requests,locations};
}
{
  const {button,status,marker,requests,locations}=setup();
  assert.equal(requests.length,0,'No permission prompt before a click');
  button.click();button.click();assert.equal(requests.length,1,'Ignore duplicate requests while locating');
  assert(button.disabled);assert.equal(button.attributes.get('aria-busy'),'true');
  assert.deepEqual(requests[0].options,{enableHighAccuracy:true,timeout:15000,maximumAge:0});
  requests[0].success({coords:{...EARTH_ANCHOR,accuracy:8}});
  assert(marker.visible);assert.equal(marker.point.x,0);assert.equal(marker.point.z,19.5);
  assert.equal(locations.length,1);assert(!button.disabled);assert(!button.attributes.has('aria-busy'));
  assert.match(status.textContent,/marked in red.*8 m/);
  button.click();assert(!marker.visible,'A refreshed request removes the stale marker');
  requests[1].success({coords:{latitude:51.5074,longitude:-.1278,accuracy:10000}});
  assert.equal(status.textContent,OUTSIDE_SITE_MESSAGE,'Poor accuracy does not widen the 100 m limit');
  assert(!marker.visible);assert.equal(locations.length,1,'Outside fixes never recenter the camera');
  button.click();requests[2].success({coords:coordinatesAt(440,-10)});
  assert(marker.visible);assert.equal(locations.length,2,'A later valid request can recover');
  button.click();requests[3].success({coords:{latitude:NaN,longitude:0}});
  assert(!marker.visible);assert.match(status.textContent,/could not find/);assert(!button.disabled);
}
for(const [code,message] of [[1,/denied/],[2,/could not find/],[3,/timed out/],[9,/unavailable/]]){
  const {button,status,marker,requests}=setup();button.click();requests[0].error({code});
  assert.match(status.textContent,message);assert(!marker.visible);assert(!button.disabled);
}
for(const [overrides,message] of [[{secureContext:false},/HTTPS/],[{geolocation:null},/does not support/],
  [{geolocation:{getCurrentPosition(){throw new Error('Unavailable');}}},/unavailable/]]){
  const {button,status,marker}=setup(overrides);button.click();
  assert.match(status.textContent,message);assert(!marker.visible);assert(!button.disabled);
}
console.log('Device location: perimeter, exact 100 m cutoff, corners, coordinate alignment, fresh fixes, retries and errors passed.');
