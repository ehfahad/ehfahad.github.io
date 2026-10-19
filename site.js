
(function(){var t=null;try{t=localStorage.getItem('theme')}catch(e){}
 var sys=false;try{sys=window.matchMedia('(prefers-color-scheme: dark)').matches}catch(e){}
 if(t==='dark'||(t!=='light'&&sys)){document.documentElement.setAttribute('data-theme','dark')}})();
function toggleMenu(b){var n=b.closest('nav'),o=n.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false')}
function toggleTheme(){var d=document.documentElement,on=d.getAttribute('data-theme')==='dark';
 if(on){d.removeAttribute('data-theme')}else{d.setAttribute('data-theme','dark')}
 try{localStorage.setItem('theme',on?'light':'dark')}catch(e){}}
function showTab(g,id){document.querySelectorAll('[data-g="'+g+'"]').forEach(function(e){var on=e.dataset.id===id;e.classList.toggle('on',on);
 if(e.classList.contains('tab'))e.setAttribute('aria-selected',on?'true':'false')})}
function filt(c){document.querySelectorAll('.chip').forEach(function(e){e.classList.toggle('on',e.dataset.c===c)});
 document.querySelectorAll('.news li').forEach(function(li){li.style.display=(c==='all'||li.dataset.c===c)?'':'none'});
 document.querySelectorAll('.yblock').forEach(function(b){var any=[].some.call(b.querySelectorAll('li'),function(li){return li.style.display!=='none'});b.style.display=any?'':'none'})}
