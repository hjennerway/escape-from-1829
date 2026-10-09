// Use the browser's back/forward cache to retain the live WebGL pages. History
// still navigates normally when a device has evicted a page from memory.
const key='1829-view-history';
function read(){try{return JSON.parse(sessionStorage.getItem(key));}catch{return null;}}
function save(value){try{sessionStorage.setItem(key,JSON.stringify(value));}catch{}}
function mark(value){history.replaceState({...history.state,viewHistory:value},'');}

export function bindViewCache({intro=false}={}){
  let current=history.state?.viewHistory;
  if(intro){
    if(!current?.intro){current={id:crypto.randomUUID(),intro:true,step:0};mark(current);}
  }else{
    const saved=read(),pending=saved?.pending;
    if(pending?.path===location.pathname&&pending.from===document.referrer){
      current={id:saved.id,step:pending.step};mark(current);
      saved.pending=null;save(saved);
    }
    document.addEventListener('click',event=>{
      const link=event.target.closest?.('a[href]');
      if(!link||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      if((link.target&&link.target!=='_self')||link.hasAttribute?.('download'))return;
      const target=new URL(link.href),home=new URL('./',location.href);
      if(target.search||target.hash)return;
      if(target.origin!==home.origin||![home.pathname,home.pathname+'index.html'].includes(target.pathname))return;
      const entry=history.state?.viewHistory;
      if(Number.isInteger(entry?.step)&&entry.step>0&&read()?.id===entry.id){event.preventDefault();document.exitPointerLock?.();history.go(-entry.step);}
    });
  }
}

export function restoreCachedView(destination){
  const url=new URL(destination,location.href),current=history.state?.viewHistory,saved=read();
  if(current?.intro&&saved?.id===current.id){
    const cached=saved.views?.[url.pathname];
    if(Number.isInteger(cached?.step)&&cached.step>0&&!url.hash&&[...url.searchParams.keys()].every(name=>name==='intro')){history.go(cached.step);return true;}
  }
  return false;
}

export function navigateView(destination,{intro=false}={}){
  if(intro&&restoreCachedView(destination))return;
  const url=new URL(destination,location.href),current=history.state?.viewHistory,saved=read();
  if(current&&(intro?current.intro:current.step>0)){
    const step=intro?1:current.step+1;
    const views=intro||saved?.id!==current.id?{}:Object.fromEntries(Object.entries(saved.views??{}).filter(([,view])=>view.step<step));
    views[url.pathname]={step};
    save({id:current.id,views,pending:{path:url.pathname,from:location.href,step}});
  }else{
    // A direct link starts its own history; it must not jump to an old intro.
    save(null);
  }
  location.href=url.href;
}
