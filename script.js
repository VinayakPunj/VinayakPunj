(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pinMQ = window.matchMedia ? matchMedia('(min-width:900px) and (min-height:700px) and (prefers-reduced-motion:no-preference)') : { matches:false };
  if (pinMQ.matches) document.querySelectorAll('#experience .step').forEach(function(s){ s.classList.remove('rv'); });

  /* ---------- durations, kept current from today's date ---------- */
  (function(){
    var now = new Date();
    function months(start, end){
      var s = start.split('-'), e = end ? end.split('-') : [now.getFullYear(), now.getMonth() + 1];
      return (+e[0] - +s[0]) * 12 + (+e[1] - +s[1]) + 1;   /* inclusive, LinkedIn-style */
    }
    function fmt(m){
      var y = Math.floor(m / 12), r = m % 12, out = [];
      if (y) out.push(y + (y === 1 ? ' yr' : ' yrs'));
      if (r) out.push(r + (r === 1 ? ' mo' : ' mos'));
      return out.join(' ') || '1 mo';
    }
    var sum = 0;
    document.querySelectorAll('.dur').forEach(function(el){
      var m = months(el.getAttribute('data-start'), el.getAttribute('data-end'));
      sum += m;
      var d = fmt(m);
      el.textContent = d.toUpperCase();
      var step = el.closest('.step');
      if (step) step.setAttribute('data-cap', step.getAttribute('data-cap') + ' · ' + d);
    });
    var first = document.querySelector('#experience .step');
    var cap = document.getElementById('stepCap');
    if (first && cap) cap.textContent = first.getAttribute('data-cap');
    /* total across all roles, internships included: whole years, "+" for any remainder */
    var yrs = Math.floor(sum / 12), plus = sum % 12 ? '+' : '';
    var total = yrs < 1 ? fmt(sum) : yrs + plus + (yrs === 1 && !plus ? ' year' : ' years');
    document.querySelectorAll('.dur-total').forEach(function(el){ el.textContent = total; });
  })();

  /* ---------- split section headings into words ---------- */
  document.querySelectorAll('.head h2').forEach(function(h){
    var text = h.textContent.trim();
    h.setAttribute('aria-label', text);
    h.innerHTML = text.split(/\s+/).map(function(w, i){
      var safe = w.replace(/&/g,'&amp;').replace(/</g,'&lt;');
      return '<span class="w" aria-hidden="true"><span style="transition-delay:' + (120 + i * 70) + 'ms">' + safe + '</span></span>';
    }).join(' ');
  });

  /* ---------- count-up numbers ---------- */
  function countUp(root){
    root.querySelectorAll('[data-count]').forEach(function(el){
      if (el._done) return; el._done = true;
      var end = +el.getAttribute('data-count'), pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
      var t0 = performance.now(), dur = 1400;
      (function step(now){
        var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = pre + Math.round(end * e) + suf;
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    });
  }

  /* ---------- scroll reveal, staggered among siblings ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  function showAll(){ items.forEach(function(el){ el.classList.add('in'); }); }
  if (reduce || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) {
          var el = e.target;
          el.classList.add('in'); io.unobserve(el);
          countUp(el);
          setTimeout(function(){ el.style.transitionDelay = ''; }, 1400);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    items.forEach(function(el){
      var sibs = Array.prototype.filter.call(el.parentNode.children, function(c){ return c.classList.contains('rv'); });
      var k = sibs.indexOf(el);
      if (k > 0) el.style.transitionDelay = (Math.min(k, 5) * 90) + 'ms';
      io.observe(el);
    });
  }

  /* ---------- sticky nav hairline ---------- */
  var nav = document.getElementById('nav');
  var onScroll = function(){ nav.classList.toggle('stuck', window.scrollY > 12); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive:true });

  /* ---------- project accordions ---------- */
  document.querySelectorAll('.case').forEach(function(card){
    var btn = card.querySelector('.case-top');
    btn.addEventListener('click', function(){
      var open = card.getAttribute('data-open') === '1';
      card.setAttribute('data-open', open ? '0' : '1');
      btn.setAttribute('aria-expanded', String(!open));
    });
  });

  /* ---------- skills ticker ---------- */
  var tech = ['Python','SQL','MongoDB','Power BI','Excel','GPT-4','LangChain','Azure','AWS','Docker','FastAPI','PyTorch','Data dashboards','Process mapping','Financial analysis'];
  var track = document.getElementById('track');
  if (track) {
    var html = tech.map(function(t){ return '<span class="chip">' + t + '</span>'; }).join('');
    track.innerHTML = html + html;
  }

  /* ---------- copy buttons ---------- */
  document.querySelectorAll('.copy').forEach(function(btn){
    btn.addEventListener('click', function(){
      var el = document.getElementById(btn.getAttribute('data-target'));
      if (!el) return;
      var done = function(){ btn.textContent = 'Copied'; btn.classList.add('ok'); setTimeout(function(){ btn.textContent = 'Copy'; btn.classList.remove('ok'); }, 1800); };
      var select = function(){
        try {
          var r = document.createRange(); r.selectNodeContents(el);
          var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
          btn.textContent = 'Selected';
          setTimeout(function(){ btn.textContent = 'Copy'; }, 2000);
        } catch(err){}
      };
      try { navigator.clipboard.writeText(el.textContent.trim()).then(done, select); } catch(e){ select(); }
    });
  });

  /* ---------- theme toggle ---------- */
  var tbtn = document.getElementById('theme');
  if (tbtn) {
    tbtn.addEventListener('click', function(){
      var cur = document.documentElement.getAttribute('data-theme');
      var dark = cur ? cur === 'dark' : !matchMedia('(prefers-color-scheme: light)').matches;
      document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
    });
  }

  /* ---------- scroll engine ---------- */
  (function(){
    function clamp(v, a, b){ return v < a ? a : v > b ? b : v; }
    var bar = document.querySelector('.progress i');
    var heroEl = document.querySelector('.hero'), heroIn = document.querySelector('.hero-in');
    var bgEl = document.getElementById('bg');
    var mx = window.innerWidth * 0.7, my = window.innerHeight * 0.3, tx = mx, ty = my;
    window.addEventListener('pointermove', function(e){ tx = e.clientX; ty = e.clientY; }, { passive:true });
    var band = document.querySelector('.band');
    var rows = Array.prototype.slice.call(document.querySelectorAll('.band-row'));
    var rowX = rows.map(function(){ return null; });
    var pinWrap = document.getElementById('experience');
    var pSteps = Array.prototype.slice.call(pinWrap.querySelectorAll('.step'));
    var railFill = document.getElementById('railFill'), stepNum = document.getElementById('stepNum'), stepCap = document.getElementById('stepCap'), curStep = -1;
    var navLinks = Array.prototype.map.call(document.querySelectorAll('.nav-links a'), function(a){
      return { a:a, s:document.querySelector(a.getAttribute('href')) };
    });
    var tickerEl = document.querySelector('.ticker'), hoverTick = false;
    if (tickerEl){
      tickerEl.addEventListener('mouseenter', function(){ hoverTick = true; });
      tickerEl.addEventListener('mouseleave', function(){ hoverTick = false; });
    }
    var tickX = 0, lastY = window.scrollY, vel = 0;

    function frame(){
      var y = window.scrollY, vh = window.innerHeight;
      var max = document.documentElement.scrollHeight - vh;
      if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0).toFixed(4) + ')';

      if (!reduce){
        /* blueprint grid: scroll parallax + eased cursor spotlight */
        if (bgEl){
          mx += (tx - mx) * 0.12; my += (ty - my) * 0.12;
          bgEl.style.setProperty('--gy', (-(y * 0.35) % 128).toFixed(1) + 'px');
          bgEl.style.setProperty('--mx', mx.toFixed(1) + 'px');
          bgEl.style.setProperty('--my', my.toFixed(1) + 'px');
        }

        /* hero parallax + fade */
        var hh = heroEl.offsetHeight;
        if (y < hh + 80){
          var hp = clamp(y / hh, 0, 1);
          heroIn.style.transform = 'translate3d(0,' + (y * 0.3).toFixed(1) + 'px,0)';
          heroIn.style.opacity = Math.max(0, 1 - hp * 1.05).toFixed(3);
        }

        /* type band: rows move opposite ways with scroll */
        if (band){
          var br = band.getBoundingClientRect();
          if (br.bottom > -200 && br.top < vh + 200){
            var bp = clamp((vh - br.top) / (vh + br.height), 0, 1);
            rows.forEach(function(row, i){
              var span = Math.max(0, row.scrollWidth - band.clientWidth);
              var target = -span / 2 + (i % 2 ? 1 : -1) * (bp - 0.5) * span * 0.6;
              rowX[i] = rowX[i] === null ? target : rowX[i] + (target - rowX[i]) * 0.1;
              row.style.transform = 'translate3d(' + rowX[i].toFixed(1) + 'px,0,0)';
            });
          }
        }

        /* pinned experience: scroll position picks the active role */
        if (pinMQ.matches){
          var pr = pinWrap.getBoundingClientRect(), total = pinWrap.offsetHeight - vh;
          var p = total > 0 ? clamp(-pr.top / total, 0, 1) : 0;
          if (railFill) railFill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
          var idx = Math.min(pSteps.length - 1, Math.floor(p * pSteps.length));
          if (idx !== curStep){
            curStep = idx;
            pSteps.forEach(function(s, i){ s.classList.toggle('on', i === idx); s.classList.toggle('past', i < idx); });
            if (stepNum){
              stepNum.textContent = '0' + (idx + 1);
              stepNum.classList.remove('flip'); void stepNum.offsetWidth; stepNum.classList.add('flip');
            }
            if (stepCap) stepCap.textContent = pSteps[idx].getAttribute('data-cap') || '';
          }
        }

        /* ticker drifts, speeds up with scroll, reverses when scrolling up */
        vel += ((y - lastY) - vel) * 0.12; lastY = y;
        if (track && !hoverTick){
          tickX -= 0.4 + clamp(vel, -40, 40) * 0.35;
          var half = track.scrollWidth / 2;
          if (half > 0){ while (tickX <= -half) tickX += half; while (tickX > 0) tickX -= half; }
          track.style.transform = 'translate3d(' + tickX.toFixed(1) + 'px,0,0)';
        }
      }

      /* active nav link */
      var mid = vh * 0.35, act = null;
      navLinks.forEach(function(l){
        if (!l.s) return;
        var r = l.s.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) act = l.a;
      });
      navLinks.forEach(function(l){ l.a.classList.toggle('on', l.a === act); });

      if (!reduce) requestAnimationFrame(frame);
    }

    if (reduce){
      frame();
      window.addEventListener('scroll', function(){ requestAnimationFrame(frame); }, { passive:true });
    } else {
      requestAnimationFrame(frame);
    }
  })();

})();
