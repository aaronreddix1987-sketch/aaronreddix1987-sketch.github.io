(function(){
  var b=document.querySelector('.menu-btn'),m=document.getElementById('menu');
  if(b&&m){
    b.addEventListener('click',function(){var o=m.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false');b.textContent=o?'Close':'Menu';});
    m.addEventListener('click',function(e){if(e.target.tagName==='A'){m.classList.remove('open');b.setAttribute('aria-expanded','false');b.textContent='Menu';}});
  }
  function money(n){return '$'+Math.round(n).toLocaleString('en-US');}
  function num(id){var el=document.getElementById(id);if(!el)return 0;var v=parseFloat(String(el.value).replace(/[^0-9.]/g,''));return isFinite(v)&&v>0?v:0;}
  var mc=document.getElementById('calc-missed');
  if(mc){
    var run=function(){
      var wk=num('mc-calls')*Math.min(num('mc-rate'),100)/100*num('mc-value');
      document.getElementById('mc-week').textContent=money(wk);
      document.getElementById('mc-month').textContent=money(wk*52/12)+' a month · '+money(wk*52)+' a year';
    };
    mc.addEventListener('input',run);run();
  }
  var bc=document.getElementById('calc-buyback');
  if(bc){
    var run2=function(){
      var pay=num('bb-pay');
      document.getElementById('bb-rate').textContent=money(pay/2000/4)+' an hour';
      document.getElementById('bb-hour').textContent='Your time is worth about '+money(pay/2000)+' an hour.';
    };
    bc.addEventListener('input',run2);run2();
  }
  // quote builder
  var qf=document.getElementById('quote-form');
  if(qf){
    var ids=['q-fo','q-web','q-app','q-auto'];
    var runQ=function(){
      var once=0,mo=0,from=false,picks=[];
      ids.forEach(function(id){
        var el=document.getElementById(id),o=el.options[el.selectedIndex];
        once+=+o.getAttribute('data-once')||0;mo+=+o.getAttribute('data-mo')||0;
        if(o.getAttribute('data-from'))from=true;
        if(el.selectedIndex>0)picks.push(o.getAttribute('data-name')||o.textContent);
      });
      document.getElementById('q-once').textContent=(from?'From ':'')+money(once);
      document.getElementById('q-mo').textContent=money(mo);
      document.getElementById('q-note').textContent=picks.length?picks.length+(picks.length===1?' service':' services')+' picked. Send it to us and we will set up your free call.':'Pick at least one service to see a price.';
      var body='Hi Aaron, here is the quote I built on your site:\n'+(picks.length?picks.map(function(p){return '- '+p;}).join('\n'):'- (nothing picked yet)')+'\nOne time: '+(from?'from ':'')+money(once)+'\nEach month: '+money(mo)+'\n\nBusiness name:\nBest time to call me:';
      document.getElementById('q-sms').href='sms:+17473018586?&body='+encodeURIComponent(body);
      document.getElementById('q-mail').href='mailto:aaronreddix1987@gmail.com?subject='+encodeURIComponent('My quote from your site')+'&body='+encodeURIComponent(body);
    };
    qf.addEventListener('change',runQ);runQ();
  }
  // installable app
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
    window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});
  }
  var ib=document.getElementById('install-btn'),inote=document.getElementById('install-note'),dp=null;
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();dp=e;if(ib)ib.hidden=false;if(inote)inote.textContent='Tap Install the app. It takes a few seconds.';});
  if(ib)ib.addEventListener('click',function(){if(!dp)return;dp.prompt();dp.userChoice.then(function(){dp=null;ib.hidden=true;});});
  window.addEventListener('appinstalled',function(){if(ib)ib.hidden=true;if(inote)inote.textContent='Installed. Look for the TTI icon on your home screen.';});
  if(inote&&(window.matchMedia('(display-mode: standalone)').matches||navigator.standalone))inote.textContent='You are using the app now.';
})();
