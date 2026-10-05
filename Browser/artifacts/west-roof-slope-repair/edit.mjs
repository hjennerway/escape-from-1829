import {readFile,writeFile} from 'node:fs/promises';
const path='Browser/dist/front-inside-corners.mjs';let s=await readFile(path,'utf8');
const replacements=[
["    const yellowHeight=(i,t)=>i===5?14.3+.23*Math.min(1,t/pavilionEnd):i===2?14.3:\n      yellowReturn+(14.3-yellowReturn)*t;\n",''],
["    const yellowRuns=[];",`    // Match the marked main pitch at the render's inner edge. Keeping the
    // existing plane removes both the blue tongue and its steeper patch.
    const pitchHeight=(i,t)=>{
      const p=yellowPoint(i,t,-.115);
      ray.set(new THREE.Vector3(p.x,30,p.z),new THREE.Vector3(0,-1,0));
      return ray.intersectObjects(slate,false)[0]?.point.y??14.3;
    };
    const yellowHeight=(i,t)=>i===5||i===2?pitchHeight(i,t):
      yellowReturn+(pitchHeight(2,0)-yellowReturn)*t;
    const yellowRuns=[];`],
["        for(let j=0;j<steps.length-1;j++){","        for(let j=0;i===1&&j<steps.length-1;j++){"],
["        let cut=[[a.x,a.z],[b.x,b.z],[outerB.x,outerB.z],[outerA.x,outerA.z]];",`        // Retract the back roof fringe without replacing its original pitch.
        const cutA=i===1?a:yellowPoint(i,0,-.115),cutB=i===1?b:yellowPoint(i,end,-.115);
        let cut=[[cutA.x,cutA.z],[cutB.x,cutB.z],[outerB.x,outerB.z],[outerA.x,outerA.z]];`]
];
s=s.replaceAll('\r\n','\n');for(const [a,b] of replacements){if(!s.includes(a))throw Error('Missing source context: '+a);s=s.replace(a,b);}await writeFile(path,s);
const p='Browser/dist/entrance-west-photo-detail.mjs';s=await readFile(p,'utf8');const a='const heights=[12.75,12.75,roofTop(...line[2])-.39,13.3,13.3,endTop-.39];';if(!s.includes(a))throw Error('Missing entrance context');s=s.replace(a,'const heights=[12.75,12.75,13.3,13.3,13.3,endTop-.39];');await writeFile(p,s);
