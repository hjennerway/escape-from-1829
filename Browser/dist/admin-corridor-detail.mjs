// The supplied winter painting shows low red-brick galleries with small
// round-headed lights. Window spacing and the unseen north side are inferred.
export function addAdminCorridorDetail(THREE,{corridor,start,end,cz,depth=6.4,height=3.6,brick,material,worldUV,omitWindow=()=>false}){
  const stone=material(0xc8c6b7),paint=material(0xd5d8ce);
  const shadow=material(0x283334),glass=material(0x536c72,{roughness:.52,metalness:.12});
  const iron=material(0x303d40),red=brick.clone();red.color.set(0xc7a391);
  const width=1.12,spring=.65,sill=1.48,radius=width/2,spacing=5.4;
  const count=Math.floor((end-start-4)/spacing)+1,mid=(start+end)/2;
  function mesh(g,m,x,y,z,name,parent=corridor){
    const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;
    o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
  }
  function box(m,x,y,z,w,h,d,name,parent=corridor){return mesh(worldUV(new THREE.BoxGeometry(w,h,d),1.7),m,x,y,z,name,parent);}
  function arch(w,h){
    const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);
    shape.lineTo(w/2,h);shape.absarc(0,h,w/2,0,Math.PI,false);shape.closePath();return shape;
  }
  function ring(r,t,depth,m,y,z,name,parent){
    const shape=new THREE.Shape();shape.absarc(0,0,r,0,Math.PI,false);
    shape.lineTo(-r+t,0);shape.absarc(0,0,r-t,Math.PI,0,true);shape.closePath();
    return mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:24}),m,0,y,z,name,parent);
  }
  corridor.userData.openings??=[];
  for(const side of [-1,1]){
    const face=new THREE.Group();face.name=side===1?'Corridor south windows':'Corridor north windows';
    face.position.set(mid,0,cz+side*depth/2);face.rotation.y=side===1?0:Math.PI;corridor.add(face);
    // A dark continuous gutter, narrow corbelled brick eaves and low plinth.
    box(red,0,.18,.045,end-start,.36,.09,'Corridor brick plinth',face);
    box(red,0,height-.21,.055,end-start,.12,.11,'Corridor brick eaves course',face);
    box(red,0,height-.11,.105,end-start,.10,.21,'Corridor projecting brick eaves',face);
    box(iron,0,height+.04,.22,end-start+.36,.14,.22,'Corridor gutter',face);
    for(let i=0;i<count;i++){
      const x=(i-(count-1)/2)*spacing;if(omitWindow(mid+side*x,side))continue;
      const window=new THREE.Group();
      window.name='Corridor round-headed window';window.position.set(x,sill,0);face.add(window);
      mesh(new THREE.ShapeGeometry(arch(width+.10,spring),24),shadow,0,-.03,.016,'Corridor window reveal',window);
      const pane=mesh(new THREE.ShapeGeometry(arch(width,spring),24),glass,0,0,.038,'Corridor arched glazing',window);pane.castShadow=false;
      // Pale narrow masonry follows the full semicircle, with a projecting sill.
      ring(radius+.19,.17,.12,stone,spring,.025,'Corridor stone arch',window);
      for(const sign of [-1,1]){
        box(stone,sign*(radius+.105),spring/2,.085,.17,spring,.12,'Corridor stone jamb',window);
        box(paint,sign*(radius-.026),spring/2,.105,.052,spring,.06,'Corridor window frame',window);
      }
      ring(radius,.055,.055,paint,spring,.078,'Corridor curved frame',window);
      box(paint,0,.025,.107,width,.05,.06,'Corridor lower frame',window);
      box(paint,0,spring,.11,width,.046,.06,'Corridor fanlight transom',window);
      box(paint,0,(spring+radius)/2,.112,.04,spring+radius-.055,.055,'Corridor central glazing bar',window);
      box(paint,0,spring/2,.11,width,.027,.05,'Corridor sash rail',window);
      box(stone,0,-.105,.11,width+.48,.16,.38,'Corridor projecting stone sill',window);
      // Small radial joints make the pale arch read as masonry at close range.
      for(let j=1;j<7;j++){
        const a=j*Math.PI/7,r=radius+.105;
        const joint=box(shadow,Math.cos(a)*r,spring+Math.sin(a)*r,.149,.15,.012,.008,'Corridor arch joint',window);
        joint.rotation.z=a;joint.castShadow=false;
      }
      corridor.userData.openings.push({x:mid+side*x,y:sill,z:cz+side*depth/2,width,spring,radius,side});
    }
    for(const x of [-(end-start)/2+1.1,0,(end-start)/2-1.1]){
      box(iron,x,height/2,.19,.09,height-.1,.10,'Corridor downpipe',face);
      for(const y of [.55,height-.75])box(iron,x,y,.17,.16,.075,.17,'Corridor pipe bracket',face);
    }
  }
}
