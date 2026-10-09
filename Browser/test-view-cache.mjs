import assert from 'node:assert/strict';
import {bindViewCache,navigateView} from './dist/view-cache.mjs';
const storage=new Map(),moves=[];let listeners={},state={other:'retained'};
globalThis.sessionStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
globalThis.history={get state(){return state;},replaceState:value=>{state=value;},go:n=>moves.push(n)};
globalThis.document={referrer:'',addEventListener:(type,callback)=>{listeners[type]=callback;},exitPointerLock(){}};
function arrive(url,referrer='',nextState=null){globalThis.location={href:url,pathname:new URL(url).pathname,origin:new URL(url).origin};document.referrer=referrer;state=nextState;listeners={};}
const home='https://example.test/game/';arrive(home,'',{other:'retained'});bindViewCache({intro:true});const title=state;
assert.equal(state.other,'retained');navigateView('./aerial.html?intro=1',{intro:true});assert.equal(location.href,home+'aerial.html?intro=1');
arrive(home+'aerial.html',home);bindViewCache();assert.equal(state.viewHistory.step,1);const aerial=state;
navigateView('./explore.html?at=12,20,0');arrive(home+'explore.html?at=12,20,0',home+'aerial.html');bindViewCache();assert.equal(state.viewHistory.step,2);const explore=state;
const click=(href,extra={})=>({button:0,target:{closest:()=>({href})},preventDefault(){this.prevented=true;},...extra});
let event=click(home);listeners.click(event);assert(event.prevented);assert.equal(moves.at(-1),-2);
event=click(home,{ctrlKey:true});listeners.click(event);assert(!event.prevented);
event=click(home+'?fresh=1');listeners.click(event);assert(!event.prevented);
event=click(home);event.target.closest=()=>({href:home,target:'_blank'});listeners.click(event);assert(!event.prevented);
arrive(home,'',title);navigateView('./explore.html',{intro:true});assert.equal(moves.at(-1),2);
navigateView('./aerial.html',{intro:true});assert.equal(moves.at(-1),1);
// A new destination truncates the old forward branch; it cannot replay stale steps.
navigateView('./explore.html?new=1',{intro:true});assert.equal(location.href,home+'explore.html?new=1');
assert.deepEqual(Object.keys(JSON.parse(storage.get('1829-view-history')).views),['/game/explore.html']);
arrive(home+'explore.html?new=1',home);bindViewCache();event=click(home+'index.html');listeners.click(event);assert(event.prevented);assert.equal(moves.at(-1),-1);
arrive(home+'aerial.html');bindViewCache();event=click(home);listeners.click(event);assert(!event.prevented,'A direct visit keeps the ordinary home link');
sessionStorage.getItem=()=>{throw Error('Storage disabled');};sessionStorage.setItem=()=>{throw Error('Storage disabled');};
arrive(home,'',title);navigateView('./aerial.html',{intro:true});assert.equal(location.href,home+'aerial.html');
arrive(home+'aerial.html',home,aerial);bindViewCache();event=click(home);listeners.click(event);assert(!event.prevented);
console.log('PASS: intro return distances, cached aerial/walking history, shared state preservation, modified links, direct entry and unavailable storage.');
