const button=document.getElementById('locationsButton');
const panel=document.getElementById('locationsPanel');
const picker=document.getElementById('locationsPicker');
const list=panel.querySelector('ul');
const alphabetical=new Intl.Collator('en-GB',{sensitivity:'base',numeric:true});

function sortLocations(){
  const items=[...list.children];
  const sorted=[...items].sort((a,b)=>alphabetical.compare(a.textContent.trim(),b.textContent.trim()));
  // Only move nodes when needed, so observing the reorder cannot loop.
  if(sorted.some((item,index)=>item!==items[index]))list.append(...sorted);
}

sortLocations();
// Shared by aerial and walking menus, including later additions or renames.
new MutationObserver(sortLocations).observe(list,{childList:true,subtree:true,characterData:true});

function closeLocations(){
  panel.hidden=true;
  button.setAttribute('aria-expanded','false');
}

button.addEventListener('click',()=>{
  panel.hidden=!panel.hidden;
  button.setAttribute('aria-expanded',String(!panel.hidden));
});
document.addEventListener('click',event=>{
  if(!picker.contains(event.target))closeLocations();
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!panel.hidden){
    closeLocations();
    button.focus();
  }
});
picker.addEventListener('focusout',event=>{
  if(!picker.contains(event.relatedTarget))closeLocations();
});

for(const link of panel.querySelectorAll('a')){
  const url=new URL(link.href);
  if(url.pathname===location.pathname&&url.search===location.search)link.setAttribute('aria-current','page');
}
