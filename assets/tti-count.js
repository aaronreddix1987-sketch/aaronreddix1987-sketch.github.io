/* TTI visit counter. Privacy-friendly: no cookies, no IP or personal data stored by TTI,
   only anonymous totals per page, per utm_source and per post id. Counts live at
   abacus.jasoncameron.dev (free, no account). Own tests: open any page once with ?tti_nocount=1. */
(function(){
  try{
    var NS='tti-site-aaronreddix', API='https://abacus.jasoncameron.dev/hit/'+NS+'/';
    var q=new URLSearchParams(location.search);
    if(q.get('tti_nocount')==='1'){localStorage.setItem('tti_nocount','1');return;}
    if(q.get('tti_nocount')==='0'){localStorage.removeItem('tti_nocount');}
    if(localStorage.getItem('tti_nocount')==='1'||navigator.webdriver)return;
    var clean=function(s,n){return String(s||'').toLowerCase().replace(/[^a-z0-9-]/g,'').slice(0,n||24);};
    var page=clean(location.pathname.replace(/^\/+|\.html$/g,'').replace(/\/index$/,'').replace(/\//g,'-'),40)||'index';
    var SRC=['facebook','instagram','linkedin','tiktok','youtube','press','email','threads','x','google','nextdoor','reddit','podcast','qr'];
    var src=clean(q.get('utm_source')), content=clean(q.get('utm_content'),8);
    if(src&&SRC.indexOf(src)<0)src='other';
    var hit=function(k){try{fetch(API+k,{mode:'cors',keepalive:true}).catch(function(){});}catch(e){}};
    var once=function(k){var s='ttic_'+k;if(sessionStorage.getItem(s))return;sessionStorage.setItem(s,'1');hit(k);};
    once('all');
    once('p-'+page);
    if(src){
      sessionStorage.setItem('ttic_src',src);
      once('s-'+src);
      once('sp-'+src+'-'+page);
      if(/^[a-z]{0,3}[0-9]{1,3}$/.test(content))once('sc-'+src+'-'+content);
    }
    document.addEventListener('click',function(e){
      var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
      if(!a)return;var h=a.getAttribute('href')||'';
      if(h.indexOf('buy.stripe.com')>-1){
        once('b-'+page);
        var s=sessionStorage.getItem('ttic_src');if(s)once('bs-'+s);
      }else if(h.indexOf('tel:')===0){once('t-'+page);}
    },true);
  }catch(e){}
})();
