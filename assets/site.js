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
})();
