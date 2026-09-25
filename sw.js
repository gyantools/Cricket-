/* CricPulse service worker: app shell cache + network-first pages. Live data is never cached. */
const V='cp-be6a1870';
const SCOPE=self.registration.scope;
const SHELL=['','app.css','app.js','404.html','favicon.svg','icon-192.png','manifest.webmanifest'].map(p=>SCOPE+p);
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.origin!==location.origin) return;                        // ESPN / news APIs: always live
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{ if(res.ok){ const c=res.clone(); caches.open(V).then(x=>x.put(r,c)); } return res; })
      .catch(()=>caches.match(r).then(x=>x||caches.match(SCOPE+'404.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{ if(res.ok){ const c=res.clone(); caches.open(V).then(x=>x.put(r,c)); } return res; }).catch(()=>hit);
    return hit||net;
  }));
});
