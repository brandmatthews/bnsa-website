// Bend Night Sky Alliance — interactive Bortle scale preview
document.addEventListener('DOMContentLoaded', function () {
  var segs = document.querySelectorAll('.bortle-seg');
  var caption = document.getElementById('bortleCaption');
  if (!segs.length) return;

  var DEFAULT_BORTLE = 5;

  var descriptions = {
    1: 'Pristine dark sky site — the Milky Way casts visible shadows during a new moon.',
    2: 'Truly dark site — faint airglow may be visible near the horizon.',
    3: 'Rural sky — a faint light dome and a hint of the Milky Way remain.',
    4: 'Rural/suburban sky — the Milky Way is only visible overhead.',
    5: 'Suburban transition — roughly where Bend sits today.',
    6: 'Bright suburban sky — much of the sky has a glow.',
    7: 'Suburban/urban transition — the whole sky has a light hue.',
    8: 'City sky — the sky glows white or orange with few stars visible.',
    9: 'Inner-city sky — only the Moon, planets, and the brightest stars remain visible.'
  };

  // Hand-tuned per level. glowFraction/darkFraction/mw drive the sky-color overlays;
  // starVis dims stars smoothly, starMaxFraction thins the actual star COUNT —
  // both together give a gradual, realistic falloff rather than a late cliff.
  var LEVELS = {
    1: { glow: 0,    dark: 0.42, starVis: 1.7,  starMaxFraction: 1,    mw: 0.40 },
    2: { glow: 0,    dark: 0.30, starVis: 1.5,  starMaxFraction: 1,    mw: 0.24 },
    3: { glow: 0.09, dark: 0.15, starVis: 1.25, starMaxFraction: 0.85, mw: 0.09 },
    4: { glow: 0.22, dark: 0,    starVis: 1.05, starMaxFraction: 0.65, mw: 0    },
    5: { glow: 0.34, dark: 0,    starVis: 0.90, starMaxFraction: 0.48, mw: 0    },
    6: { glow: 0.47, dark: 0,    starVis: 0.72, starMaxFraction: 0.32, mw: 0    },
    7: { glow: 0.60, dark: 0,    starVis: 0.55, starMaxFraction: 0.18, mw: 0    },
    8: { glow: 0.74, dark: 0,    starVis: 0.42, starMaxFraction: 0.09, mw: 0    },
    9: { glow: 0.90, dark: 0,    starVis: 0.35, starMaxFraction: 0.02, mw: 0    }
  };

  function applyBortle(b) {
    segs.forEach(function (seg) {
      var v = parseInt(seg.getAttribute('data-bortle'), 10);
      seg.classList.toggle('active', v <= b);
      seg.classList.toggle('selected', v === b);
    });

    var L = LEVELS[b];
    document.documentElement.style.setProperty('--glow-opacity', L.glow);
    document.documentElement.style.setProperty('--dark-opacity', L.dark);
    document.documentElement.style.setProperty('--mw-opacity', L.mw);
    window.BNSA_STAR_VISIBILITY = L.starVis;
    window.BNSA_STAR_MAX_FRACTION = L.starMaxFraction;
    if (typeof window.BNSA_REDRAW_STARS === 'function') window.BNSA_REDRAW_STARS();

    if (caption) caption.textContent = descriptions[b] || '';
  }

  segs.forEach(function (seg) {
    seg.addEventListener('click', function () {
      applyBortle(parseInt(seg.getAttribute('data-bortle'), 10));
    });
    seg.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        applyBortle(parseInt(seg.getAttribute('data-bortle'), 10));
      }
    });
  });

  // Paint the real default state on load — Bend's actual glow, not a neutral zero
  applyBortle(DEFAULT_BORTLE);
});
