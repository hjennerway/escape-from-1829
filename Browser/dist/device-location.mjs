import {earthToScene} from './earth-registration.mjs';

export const LOCATION_MARGIN_METRES=100;
export const OUTSIDE_SITE_MESSAGE='This only works near the West Cheshire Hospital site';

// Approximate outer grounds in scene metres, including the annexe and southern
// approach. Follows the modelled outer roads in historic-road-layout.mjs and
// the saved lanes in modern-road-data.mjs. This is not a surveyed boundary.
// Keep independent of visible layouts, building bounds and the background plane.
export const ESTATE_PERIMETER=Object.freeze([
  [-140,95],[-110,-95],[-110,-255],[175,-255],[255,-193],
  [635,-205],[655,-145],[580,-75],[525,85],[410,145],
  [275,265],[175,350],[20,300],[-140,155]
].map(point=>Object.freeze(point)));

export function distanceToEstate(x,z,perimeter=ESTATE_PERIMETER){
  if(!Number.isFinite(x)||!Number.isFinite(z))return Infinity;
  let inside=false,distance=Infinity;
  for(let i=0,j=perimeter.length-1;i<perimeter.length;j=i++){
    const [ax,az]=perimeter[j],[bx,bz]=perimeter[i];
    const dx=bx-ax,dz=bz-az,lengthSquared=dx*dx+dz*dz;
    const t=lengthSquared?Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/lengthSquared)):0;
    distance=Math.min(distance,Math.hypot(x-ax-t*dx,z-az-t*dz));
    if((az>z)!==(bz>z)&&x<(bx-ax)*(z-az)/(bz-az)+ax)inside=!inside;
  }
  return inside?0:distance;
}

export function locateOnEstate({latitude,longitude}={}){
  if(!Number.isFinite(latitude)||Math.abs(latitude)>90||!Number.isFinite(longitude)||Math.abs(longitude)>180)return null;
  const [x,z]=earthToScene(latitude,longitude);
  return {x,z,nearby:distanceToEstate(x,z)<=LOCATION_MARGIN_METRES+1e-6};
}

// A screen-sized pin with its tip at the device's ground position. Drawing it
// last keeps the location readable even when historic buildings cover the fix.
export function createDeviceLocationMarker(THREE,scene,doc=document){
  const canvas=doc.createElement('canvas');canvas.width=64;canvas.height=80;
  const ctx=canvas.getContext('2d');
  ctx.beginPath();ctx.moveTo(32,76);
  ctx.bezierCurveTo(26,64,6,44,6,29);
  ctx.bezierCurveTo(6,-4,58,-4,58,29);
  ctx.bezierCurveTo(58,44,38,64,32,76);
  ctx.closePath();ctx.fillStyle='#e33135';ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.stroke();
  ctx.beginPath();ctx.arc(32,28,9,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const material=new THREE.SpriteMaterial({map:texture,sizeAttenuation:false,depthTest:false,depthWrite:false,fog:false,toneMapped:false});
  const sprite=new THREE.Sprite(material);
  sprite.name='Device location marker';sprite.center.set(.5,0);
  sprite.renderOrder=1000;sprite.visible=false;scene.add(sprite);
  return {
    show({x,z}){sprite.position.set(x,.6,z);sprite.visible=true;},
    hide(){sprite.visible=false;},
    update(camera,viewportHeight){
      if(!sprite.visible)return;
      const height=2*Math.tan(camera.fov*Math.PI/360)*42/Math.max(1,viewportHeight);
      sprite.scale.set(height*.8,height,1);
    }
  };
}

// One fresh fix per press; location never leaves this page or enters storage.
export function bindDeviceLocation({button,status,marker,onLocate=()=>{},geolocation=globalThis.navigator?.geolocation,secureContext=globalThis.isSecureContext}){
  function finish(message){
    button.disabled=false;button.removeAttribute('aria-busy');
    status.textContent=message;
  }
  function fail(error){
    marker.hide();
    const messages={
      1:'Location access was denied. Allow location access in your browser settings and try again.',
      2:'Your device could not find your location. Try again outdoors or check your location settings.',
      3:'Finding your location timed out. Please try again.'
    };
    finish(messages[error?.code]??'Your location is unavailable. Please try again.');
  }
  button.addEventListener('click',()=>{
    if(button.disabled)return;
    marker.hide();
    if(!secureContext){finish('Location needs a secure connection. Open this site using HTTPS.');return;}
    if(!geolocation){finish('This browser does not support device location.');return;}
    button.disabled=true;button.setAttribute('aria-busy','true');status.textContent='Finding your location…';
    try{
      geolocation.getCurrentPosition(position=>{
        const point=locateOnEstate(position?.coords);
        if(!point){fail({code:2});return;}
        if(!point.nearby){finish(OUTSIDE_SITE_MESSAGE);return;}
        marker.show(point);onLocate(point);
        const accuracy=position.coords.accuracy;
        finish('Your location is marked in red.'+(Number.isFinite(accuracy)&&accuracy>=0?' Accuracy: about '+Math.ceil(accuracy)+' m.':''));
      },fail,{enableHighAccuracy:true,timeout:15000,maximumAge:0});
    }catch(error){fail(error);}
  });
  button.disabled=false;
}
