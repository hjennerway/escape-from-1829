// New Point locations from Research/kml-trees/1829-12.kml.
// Omit the existing Oak22 and the earlier Oak16 relabelled Oak23 at the same coordinates.
export const KML_12_ADDITIONS=Object.freeze([
  {name:'Oak22',coordinates:[-2.902840724796577,53.21451257754731,17.16303259216218]},
  {name:'Oak23',coordinates:[-2.902728565024727,53.21450430659883,17.37597119134564]},
  {name:'Oak24',coordinates:[-2.902552747527656,53.21450061835385,20.03180133301635]},
  {name:'Oak25',coordinates:[-2.9026238321429,53.21478280687818,17.03868883305257]},
  {name:'Oak26',coordinates:[-2.902807001125182,53.21473350282105,17.47245714955386]},
  {name:'Oak27',coordinates:[-2.902684707837605,53.21486653663439,18.94269973475197]},
  {name:'Oak28',coordinates:[-2.902724182068389,53.21491602872914,30.07864852959255]},
  {name:'Oak29',coordinates:[-2.902825051350526,53.21499325141587,25.43725905933382]},
  {name:'Oak30',coordinates:[-2.902715057607522,53.21510076180343,26.83241756101319]},
  {name:'Pine14',coordinates:[-2.901156575209038,53.21438780362509,16.44252721693527]}
].map(p=>Object.freeze({...p,coordinates:Object.freeze(p.coordinates)})));
