import {readFile,writeFile} from 'node:fs/promises';
let p='Browser/dist/front-inside-corners.mjs',s=await readFile(p,'utf8');s=s.replace('function cutGeometry(THREE,geometry,transform,outline){','function cutGeometry(THREE,geometry,transform,outline,weld=false){');s=s.replace('const polygon=fragment.filter((v,j)=>','const polygon=weld?fragment.filter((v,j)=>');s=s.replace('x-fragment[j-1][k]))>1e-5);','x-fragment[j-1][k]))>1e-5):fragment;');s=s.replace('if(polygon.length>2&&Math.hypot','if(weld&&polygon.length>2&&Math.hypot');s=s.replace(`      const tri=[polygon[0],polygon[k],polygon[k+1]];
      if(transform.determinant()<0)tri.reverse();
      for(const v of tri){vertices.push(...v.slice(0,3));normals.push(...v.slice(3,6));tex.push(...v.slice(6,8));}
    }
  }
  }
  if(source`, `        const tri=[polygon[0],polygon[k],polygon[k+1]];
        if(transform.determinant()<0)tri.reverse();
        for(const v of tri){vertices.push(...v.slice(0,3));normals.push(...v.slice(3,6));tex.push(...v.slice(6,8));}
      }
    }
  }
  if(source`);
s=s.replace('object.material===roof?cut.roofOutline:cut.surfaceOutline);','object.material===roof?cut.roofOutline:cut.surfaceOutline,object.material===roof);');s=s.replace('const result=cutGeometry(THREE,geometry,transform,cut);','const result=cutGeometry(THREE,geometry,transform,cut,true);');await writeFile(p,s);
p='Browser/artifacts/west-roof-slope-repair/capture.mjs';s=await readFile(p,'utf8');s=s.replace('const survey=await page.evaluate(()=>{','const survey=await page.evaluate(before=>{');s=s.replace("if(!location.search.includes('before')){",'if(!before){');s=s.replace(' assert.deepEqual(errors,[]);'," assert.deepEqual(errors,[]);");s=s.replace(' }));};\n });',' }));};\n },stage===\'before\');');
const a='}));};\n });';
// The survey has a one-line return; update its closing evaluation explicitly.
s=s.replace(' }))};\n });',' }))};\n },stage===\'before\');');
s=s.replace('}))};\n });','}))};\n },stage===\'before\');');await writeFile(p,s);
