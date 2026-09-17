import {earthToScene} from './earth-registration.mjs';

// Exact Point coordinates from Research/kml-trees/1829.kml (Pine1–13, Oak1–2)
// and 1829-3.kml (Oak3–12), in KML order:
// longitude, latitude, altitude. LookAt coordinates are camera targets only.
export const KML_TREE_POINTS=Object.freeze([
  {name:'Pine1',coordinates:[-2.899462848266841,53.21333437945022,37.49250189993169]},
  {name:'Pine2',coordinates:[-2.899621577301846,53.21338387439018,35.47946022802977]},
  {name:'Pine3',coordinates:[-2.900355604075859,53.21351028636158,32.65776581109127]},
  {name:'Pine4',coordinates:[-2.900312794836286,53.21357516939867,39.12988516652521]},
  {name:'Pine5',coordinates:[-2.900316125924371,53.21364563728186,35.971519526475]},
  {name:'Pine6',coordinates:[-2.900316353792806,53.21370914425854,39.25220333444722]},
  {name:'Pine7',coordinates:[-2.900203080148801,53.21374583871513,39.33182443728457]},
  {name:'Pine8',coordinates:[-2.900191102517814,53.2138068166832,41.30698755440273]},
  {name:'Pine9',coordinates:[-2.899989065809271,53.21377469849358,39.11542980679501]},
  {name:'Pine10',coordinates:[-2.9000317313145,53.21368465879902,37.99185710885625]},
  {name:'Pine11',coordinates:[-2.899964754092471,53.21360481569926,36.24931435218394]},
  {name:'Pine12',coordinates:[-2.899722378534257,53.21361598272873,24.1099832560852]},
  {name:'Pine13',coordinates:[-2.898631599455427,53.2125584822905,37.36121821953898]},
  {name:'Oak1',coordinates:[-2.901802582414038,53.21189670504701,35.08346590540516]},
  {name:'Oak2',coordinates:[-2.901838541265734,53.21178513694809,32.00858831807729]},
  {name:'Oak3',coordinates:[-2.902344128207587,53.21248561331796,35.98067115999154]},
  {name:'Oak4',coordinates:[-2.902333865037892,53.21258965162429,37.0641219211794]},
  {name:'Oak5',coordinates:[-2.902483210885791,53.21282341726073,32.17707593431088]},
  {name:'Oak6',coordinates:[-2.902530981766892,53.21255114499343,31.37011161316265]},
  {name:'Oak7',coordinates:[-2.902583810576798,53.21238964285296,24.84110814786095]},
  // The source contains two distinct Oak8 placemarks; retain both locations.
  {name:'Oak8',coordinates:[-2.902590751251743,53.21229930019896,30.67505009129795]},
  {name:'Oak8',coordinates:[-2.902736321407863,53.21198317016966,30.56306583090104]},
  {name:'Oak9',coordinates:[-2.902762045239078,53.21188861729267,30.7640180335697]},
  {name:'Oak10',coordinates:[-2.903047758876757,53.21165999664634,30.37999153737037]},
  {name:'Oak11',coordinates:[-2.903340424125412,53.21157351354389,29.30406315347999]},
  {name:'Oak12',coordinates:[-2.903499951363692,53.21152005173493,35.67578333191555]}
].map(point=>Object.freeze({...point,coordinates:Object.freeze(point.coordinates)})));

// Stable pseudorandom yaw varies the copies without changing them at reload.
let rotationSeed=182917;
export const KML_TREES=Object.freeze(KML_TREE_POINTS.map(point=>{
  const [longitude,latitude,altitude]=point.coordinates,[x,z]=earthToScene(latitude,longitude);
  rotationSeed=(Math.imul(rotationSeed,1664525)+1013904223)>>>0;
  const pine=point.name.startsWith('Pine');
  return Object.freeze({name:point.name,species:pine?'pine':'oak',x,z,latitude,longitude,altitude,
    height:pine?24:22,radius:pine?5.8:10,seed:pine?182900:182902,
    rotation:rotationSeed/2**32*Math.PI*2});
}));
export const KML_PINE_TREES=Object.freeze(KML_TREES.filter(tree=>tree.species==='pine'));
export const KML_OAK_TREES=Object.freeze(KML_TREES.filter(tree=>tree.species==='oak'));
