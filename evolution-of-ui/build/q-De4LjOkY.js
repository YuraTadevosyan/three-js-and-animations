import{T as e,L as t}from"./q-Dewzxkmc.js";const i=`(function () {
  var T = ${e}, LIVE = ${JSON.stringify(t)};
  var track = document.getElementById('track');
  var stage = document.getElementById('stage');
  if (!track || !stage) return;
  var native = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline', 'view()'));
  var subs = [], top = 0, span = 1, live = null, queued = false;
  var st = window.__eou = {
    t: 0,
    native: native,
    go: function (t, instant) {
      measure();
      window.scrollTo({ top: top + (t / T) * span, behavior: instant ? 'instant' : 'smooth' });
    },
    on: function (fn) {
      subs.push(fn);
      fn(st.t);
      return function () { var i = subs.indexOf(fn); if (i >= 0) subs.splice(i, 1); };
    }
  };
  function measure() {
    var r = track.getBoundingClientRect();
    top = r.top + window.scrollY;
    span = Math.max(1, track.offsetHeight - window.innerHeight);
  }
  function update() {
    queued = false;
    var t = Math.min(T, Math.max(0, ((window.scrollY - top) / span) * T));
    st.t = t;
    if (!native) stage.style.setProperty('--t', t.toFixed(4));
    var next = [];
    for (var k in LIVE) if (t >= LIVE[k][0] && t <= LIVE[k][1]) next.push(k);
    next = next.join(' ');
    if (next !== live) { live = next; stage.setAttribute('data-live', next); }
    for (var i = 0; i < subs.length; i++) subs[i](t);
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', function () { measure(); queue(); });
  if (window.ResizeObserver) new ResizeObserver(function () { measure(); queue(); }).observe(track);
  document.documentElement.classList.add(native ? 'sda' : 'no-sda');
  measure();
  update();
})();`;export{i as B};
