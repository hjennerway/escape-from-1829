import {buildAsylumLayout} from './asylum-layout.mjs';
onmessage=({data})=>{
  try{postMessage({floors:buildAsylumLayout(data).floors});}
  catch(error){postMessage({error:error.message});}
};
