// Bend Night Sky Alliance — shared site behavior

document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  // Starfield canvas (hero only)
  var canvas = document.getElementById('starfield');
  if (!canvas) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d');
  var stars = [];
  var starsByBrightness = [];
  var w, h;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    var count = Math.floor((w * h) / 4500);
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.9,
        r: Math.random() * 1.6 + 0.3,
        base: Math.random() * 0.85 + 0.05,
        speed: Math.random() * 0.005 + 0.0015,
        offset: Math.random() * Math.PI * 2
      });
    }
    starsByBrightness = stars.slice().sort(function (a, b) { return b.base - a.base; });
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    var visibility = (typeof window.BNSA_STAR_VISIBILITY === 'number') ? window.BNSA_STAR_VISIBILITY : 1;
    var fraction = (typeof window.BNSA_STAR_MAX_FRACTION === 'number') ? window.BNSA_STAR_MAX_FRACTION : 1;
    var maxCount = fraction >= 1 ? Infinity : Math.max(1, Math.round(stars.length * fraction));
    var list = (maxCount < stars.length) ? starsByBrightness.slice(0, maxCount) : stars;
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      var twinkle = reduceMotion ? 0 : Math.sin(t * s.speed + s.offset) * 0.16;
      var alpha = Math.max(0, Math.min(1, (s.base + twinkle) * visibility));
      ctx.beginPath();
      ctx.fillStyle = 'rgba(241,233,216,' + alpha.toFixed(3) + ')';
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
  if (reduceMotion) {
    draw(0);
    // Reduced-motion users don't get a running animation loop, so give
    // Bortle interactions a way to force a single redraw when visibility changes.
    window.BNSA_REDRAW_STARS = function () { draw(0); };
  }
});
