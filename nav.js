// navigation helper for numbered slides (1.html .. N.html)
(function(){
  'use strict';
  function currentIndex(){
    var p = window.location.pathname.replace(/\\/g,'/');
    var name = p.split('/').pop();
    var m = name.match(/(\d+)\.html$/);
    return m ? parseInt(m[1],10) : null;
  }

  function fileFor(i){ return i + '.html'; }

  function goTo(i){ if(i==null) return; window.location.href = fileFor(i); }

  function setup(){
    var idx = currentIndex();
    if(idx===null) return;
    var prev = document.getElementById('nav-prev');
    var next = document.getElementById('nav-next');
    if(prev){ if(idx>1){ prev.classList.remove('disabled'); prev.href = fileFor(idx-1); } else { prev.classList.add('disabled'); prev.removeAttribute('href'); } }
    if(next){
      // find max by probing up to 100 pages; stop when file missing
      var max = null;
      for(var i=idx+1;i<=100;i++){
        var xhr = new XMLHttpRequest();
        xhr.open('HEAD', fileFor(i), false);
        try { xhr.send(); } catch(e){ break; }
        if(xhr.status>=200 && xhr.status<400){ max = i; } else break;
      }
      if(max!==null){ next.classList.remove('disabled'); next.href = fileFor(idx+1); } else { next.classList.add('disabled'); next.removeAttribute('href'); }
    }

    // keyboard
    document.addEventListener('keydown', function(e){
      if(e.key==='ArrowRight' || e.key==='PageDown'){
        if(idx!==null) { var nx = idx+1; if(next && !next.classList.contains('disabled')) goTo(nx); }
      } else if(e.key==='ArrowLeft' || e.key==='PageUp'){
        if(idx>1 && prev && !prev.classList.contains('disabled')) goTo(idx-1);
      }
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', setup); else setup();

})();
