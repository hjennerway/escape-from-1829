import {readFile,writeFile} from 'node:fs/promises';
let p='Browser/dist/entrance-west-photo-detail.mjs',s=await readFile(p,'utf8');s=s.replace('const heights=[12.75,12.75,13.3,13.3,13.3,endTop-.39];',`// The west branch now shares the projection's level side/front eave.
  // Its mirrored east frontage retains the existing sampled roof return.
  const heights=[12.75,12.75,includeReception?13.3:roofTop(...line[2])-.39,13.3,13.3,endTop-.39];`);await writeFile(p,s);
p='Browser/dist/escape-exterior.mjs';s=await readFile(p,'utf8');s=s.replace("['Entrance west projection slate roof','Entrance west slate pitches to render edge']","['Entrance west projection slate roof','Entrance west slate pitches to render edge','West cross-range continuous roof join','West entrance corner slate to yellow boundary']");await writeFile(p,s);
p='Browser/dist/front-inside-corners.mjs';s=await readFile(p,'utf8');s=s.replace(`    // The owner's yellow entrance-side boundary replaces sampled coping
    // heights. The later blue-circled repair removes the raised short step:
    // descend from the pavilion eave to the level back edge, then continue
    // to the actual terminal entrance cornice.`,`    // The blue/yellow correction continues the main roof plane to the back
    // render, then joins the canted return to the terminal entrance cornice.`);await writeFile(p,s);
