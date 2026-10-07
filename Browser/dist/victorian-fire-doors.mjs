// Fictional period styling for the existing exit leaves. Keep the outer stiles
// flat so Escape's four chain anchors still bed against the original timber.
export function addVictorianFireDoorDetails(part,{width,height,depth}){
 const surface=depth/2,column=width*.18,panelWidth=width*.255;
 for(const face of [-1,1]){
  for(const u of [-column,column])for(const [centre,size] of [[.20,.22],[.51,.25],[.82,.23]]){
   const y=height*centre,h=height*size;
   part('VictorianInset',u,y,face*(surface+.004),panelWidth,h,.008);
   // Broad outer moulding and a finer inner bead give each field a deep rebate.
   for(const side of [-1,1]){
    part('VictorianTimber',u+side*(panelWidth/2+.018),y,face*(surface+.013),.036,h+.072,.026);
    part('VictorianTimber',u,y+side*(h/2+.018),face*(surface+.013),panelWidth,.036,.026);
    part('VictorianTimber',u+side*(panelWidth/2-.006),y,face*(surface+.020),.012,h,.012);
    part('VictorianTimber',u,y+side*(h/2-.006),face*(surface+.020),panelWidth-.024,.012,.012);
   }
  }
  // Three short iron hinge straps with visible pin barrels and fixing studs.
  for(const y of [height*.12,height*.43,height*.91]){
   part('VictorianIron',-width/2+.115,y,face*(surface+.007),.20,.055,.014);
   part('VictorianIron',-width/2+.035,y,face*(surface+.022),.035,.15,.044);
   for(const u of [-width/2+.085,-width/2+.175])part('VictorianKnob',u,y,face*(surface+.017),.015,.015,.012);
  }
  // A small oval knob on a tall mortice-lock plate replaces the panic bar.
  const handle=width/2-.14;
  part('VictorianIron',handle,1.04,face*(surface+.009),.085,.27,.018);
  part('VictorianKnob',handle,1.09,face*(surface+.046),.070,.065,.065);
  part('VictorianInset',handle,.968,face*(surface+.020),.012,.045,.008);
 }
}
