import {PERIODS,DEFAULT_PERIOD,periodForYear,periodNote,locationSection,existsInYear} from './estate-periods.mjs';

export function bindTimelineControls(timeline,root=document,onChange=()=>{}){
 const slider=root.querySelector('#periodSlider'),title=root.querySelector('#periodTitle'),year=root.querySelector('#periodYear'),description=root.querySelector('#periodDescription'),note=root.querySelector('#periodNote');
 const previous=root.querySelector('#previousPeriod'),next=root.querySelector('#nextPeriod');
 const params=new URLSearchParams(location.search);
 slider.min=0;slider.max=PERIODS.length-1;slider.step=1;
 const ticks=root.querySelector('#periodTicks');
 ticks.replaceChildren(...PERIODS.map(period=>{const tick=document.createElement('span');tick.title=String(period.year);return tick;}));
 function refreshLinks(){
  for(const link of document.querySelectorAll('a[href]')){
   const url=new URL(link.getAttribute('href'),location.href);
   if(url.origin!==location.origin||!/(?:aerial|explore)\.html$/.test(url.pathname))continue;
   url.searchParams.set('period',timeline.period.year);
   link.href=url.pathname+url.search+url.hash;
   if(link.closest('#locationsPanel')){
    const section=locationSection(url.searchParams.get('view')??'');
    link.closest('li').hidden=Boolean(section&&!existsInYear(section,timeline.period.year));
   }
  }
 }
 function select(value,{save=true}={}){
  const index=Math.max(0,Math.min(PERIODS.length-1,Math.round(Number(value))||0));
  const period=timeline.setPeriod(PERIODS[index].year);
  slider.value=String(index);slider.setAttribute('aria-valuetext',period.year+' — '+period.title);
  year.textContent=period.year;title.textContent=period.title;
  description.textContent=period.description;description.hidden=!period.description;
  note.textContent=periodNote(period.year);note.hidden=!note.textContent;
  previous.disabled=index===0;next.disabled=index===PERIODS.length-1;
  for(const [i,tick] of [...ticks.children].entries())tick.classList.toggle('selected',i===index);
  if(save){const url=new URL(location.href);url.searchParams.set('period',period.year);history.replaceState(null,'',url);}
  refreshLinks();onChange(period);
 }
 slider.addEventListener('input',()=>select(slider.value));
 previous.addEventListener('click',()=>select(Number(slider.value)-1));
 next.addEventListener('click',()=>select(Number(slider.value)+1));
 addEventListener('popstate',()=>select(PERIODS.indexOf(periodForYear(new URLSearchParams(location.search).get('period'))),{save:false}));
 const initial=periodForYear(params.get('period')??DEFAULT_PERIOD);
 select(PERIODS.indexOf(initial),{save:false});
 return {select,refreshLinks};
}
