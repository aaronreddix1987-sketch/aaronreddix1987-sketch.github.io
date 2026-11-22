/* Total Transformation Inc. app shell. Network first, saved copy as backup. */
var CACHE="tti-v10-2026-11-22";
var SHELL=["/","/services.html","/front-office.html","/ebooks.html","/case-study.html","/contact.html","/app.html","/platform.html","/news.html","/offline.html","/assets/site.css","/assets/site.js","/assets/favicon.svg","/assets/icons/icon-192.png"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return Promise.all(SHELL.map(function(u){return c.add(u).catch(function(){});}));}).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
self.addEventListener("fetch",function(e){
  var req=e.request;
  if(req.method!=="GET")return;
  var url=new URL(req.url);
  if(url.origin!==location.origin)return;
  if(url.pathname.indexOf("/dl/")===0||url.pathname.indexOf("/board/")===0||/\.json$/i.test(url.pathname)||/^\/(checkout|buy|access|download)\.html/.test(url.pathname)||url.pathname.indexOf("/sites/")===0||/\.(mp4|pdf|zip)$/i.test(url.pathname))return;
  if(url.pathname.indexOf("/thank-you")===0||url.pathname.indexOf("/love-and-rehab-thank-you")===0)return;
  e.respondWith(
    fetch(req).then(function(res){
      if(res&&res.ok&&res.type==="basic"&&!url.search){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy);});}
      return res;
    }).catch(function(){
      return caches.match(req,{ignoreSearch:true}).then(function(hit){
        if(hit)return hit;
        if(req.mode==="navigate")return caches.match("/offline.html");
        return Response.error();
      });
    })
  );
});
