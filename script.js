/* Friday Quiet enhancements
   - Line-by-line poem reveal
   - Ambient gradient mouse glow
   - Cursor ripple
   - Pause world toggle
   - Ambient audio toggle
   - Footer exhale timestamp
   - Selection tooltip wink
*/

(function(){
  const poem = document.getElementById('poem');
  const pauseBtn = document.getElementById('pauseToggle');
  const soundBtn = document.getElementById('soundToggle');
  const audio = document.getElementById('ambient');
  const exhale = document.getElementById('exhale');

  /* 1) Line-by-line reveal: wrap <br> runs into spans */
  if (poem && poem.dataset.reveal === 'true'){
    const p = poem.querySelector('p');
    const parts = p.innerHTML.split('<br>');
    const wrapped = parts.map(s => s
      .replace(/^\s+|\s+$/g,'')
      .replace(/&nbsp;/g,' ')
    ).map(line => `<span class="line">${line}</span><br/>`).join('');
    p.innerHTML = wrapped;

    // Reveal on intersect
    const io = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          // Stagger children
          const lines = poem.querySelectorAll('span.line');
          lines.forEach((el, i)=>{
            setTimeout(()=> el.classList.add('visible'), i*160);
          });
          io.disconnect();
        }
      });
    }, { threshold: 0.2 });
    io.observe(poem);
  }

  /* 2) Ambient mouse glow within poem */
  let glowRAF = 0;
  poem.addEventListener('mousemove', e=>{
    poem.classList.add('hovering');
    cancelAnimationFrame(glowRAF);
    glowRAF = requestAnimationFrame(()=>{
      const rect = poem.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      poem.style.setProperty('--mx', x + '%');
      poem.style.setProperty('--my', y + '%');
    });
  });
  poem.addEventListener('mouseleave', ()=> poem.classList.remove('hovering'));

  /* 3) Cursor ripple, throttled */
  let lastRipple = 0;
  document.addEventListener('mousemove', e=>{
    const now = performance.now();
    if (now - lastRipple < 120) return; // throttle
    lastRipple = now;
    const dot = document.createElement('div');
    dot.className = 'ripple';
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
    document.body.appendChild(dot);
    setTimeout(()=> dot.remove(), 900);
  }, { passive: true });

  /* 4) Pause world toggle */
  pauseBtn?.addEventListener('click', ()=>{
    const pressed = pauseBtn.getAttribute('aria-pressed') === 'true';
    const next = !pressed;
    pauseBtn.setAttribute('aria-pressed', String(next));
    document.documentElement.classList.toggle('paused', next);

    if (next){
      pauseBtn.textContent = 'Resume';
      // also pause audio
      if (!audio.paused) audio.pause();
    } else {
      pauseBtn.textContent = 'Pause';
    }
  });

  /* 5) Ambient audio toggle */
  // Start muted until user clicks, to avoid autoplay blockers.
  audio.volume = 0.14; // whisper level
  soundBtn?.addEventListener('click', async ()=>{
    const pressed = soundBtn.getAttribute('aria-pressed') === 'true';
    const next = !pressed;
    soundBtn.setAttribute('aria-pressed', String(next));
    if (next){
      try{
        await audio.play();
        soundBtn.textContent = 'Quiet playing';
      }catch(e){
        soundBtn.textContent = 'Click again to allow sound';
      }
    } else {
      audio.pause();
      soundBtn.textContent = 'Hear the quiet';
    }
  });

  /* 6) Footer exhale timestamp */
  function updateExhale(){
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    exhale.textContent = `This page exhaled last at ${time}`;
  }
  updateExhale();
  setInterval(updateExhale, 60 * 1000);

  /* 7) Selection tooltip wink */
  let tip;
  document.addEventListener('selectionchange', ()=>{
    const sel = document.getSelection();
    if (!sel || sel.isCollapsed) {
      tip?.remove();
      tip = null;
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!rect || !rect.width) return;
    if (!tip){
      tip = document.createElement('div');
      tip.style.position = 'fixed';
      tip.style.padding = '6px 10px';
      tip.style.font = '600 12px Inter, system-ui, sans-serif';
      tip.style.color = '#fff';
      tip.style.background = 'rgba(0,0,0,0.68)';
      tip.style.borderRadius = '10px';
      tip.style.pointerEvents = 'none';
      tip.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
      tip.textContent = 'You just resonated with the quiet';
      document.body.appendChild(tip);
    }
    tip.style.left = (rect.left + rect.width/2) + 'px';
    tip.style.top  = (rect.top - 12) + 'px';
    tip.style.transform = 'translate(-50%, -100%)';
    clearTimeout(tip._hide);
    tip._hide = setTimeout(()=>{ tip?.remove(); tip=null; }, 1400);
  });

  /* Safety: stop audio on visibility hidden */
  document.addEventListener('visibilitychange', ()=>{
    if (document.hidden && !audio.paused) audio.pause();
  });

})();
