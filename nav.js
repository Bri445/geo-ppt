// navigation helper for numbered slides (1.html .. N.html)
(function(){
  'use strict';
  function currentIndex(){
    var p = window.location.pathname.replace(/\\/g,'/');
    var name = p.split('/').pop();
    // treat index.html or empty filename as page 1
    if(!name || name==='index.html') return 1;
    var m = name.match(/(\d+)\.html$/);
    return m ? parseInt(m[1],10) : null;
  }

  function fileFor(i){ return i + '.html'; }
  // Map page 1 to index.html so hosting platforms (like Vercel) serve the root correctly
  function fileFor(i){ return i===1 ? 'index.html' : (i + '.html'); }

  function goTo(i){ if(i==null) return; window.location.href = fileFor(i); }

  function setup(){
    var idx = currentIndex();
    if(idx===null) return;
    // warm up common external resources (fonts, icons) to reduce first-paint delays
    preconnect('https://fonts.googleapis.com');
    preconnect('https://fonts.gstatic.com');
    preconnect('https://cdn.jsdelivr.net');
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
      if(max!==null){ next.classList.remove('disabled'); next.href = fileFor(idx+1);
        // prefetch the next slide to make navigation faster
        prefetchSlide(idx+1);
        // also prefetch the slide after next (speculative)
        if(max >= idx+2) prefetchSlide(idx+2);
      } else { next.classList.add('disabled'); next.removeAttribute('href'); }
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

  /* --- Prefetch / Preconnect helpers --- */
  function preconnect(url){
    try{
      var l = document.createElement('link');
      l.rel = 'preconnect';
      l.href = url;
      l.crossOrigin = '';
      document.head.appendChild(l);
    }catch(e){}
  }

  function prefetchSlide(i){
    var url = fileFor(i);
    // modern browsers: <link rel=prefetch>
    try{
      var l = document.createElement('link');
      l.rel = 'prefetch';
      l.href = url;
      l.as = 'document';
      document.head.appendChild(l);
    }catch(e){}
    // also do a background fetch to warm the HTTP cache (falls back gracefully)
    try{
      fetch(url, {method: 'GET', credentials: 'same-origin', cache: 'force-cache'})
        .then(function(resp){ /* intentionally empty - just warm cache */ })
        .catch(function(){ /* ignore errors */ });
    }catch(e){}
  }

})();
