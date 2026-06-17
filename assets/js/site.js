(function () {
  function bindMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var links = document.querySelector('[data-nav-links]');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  function bindHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    function show(next) {
      index = next % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function bindFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute('data-filter-panel');
      var scope = document.querySelector(scopeSelector) || document;
      var input = panel.querySelector('[data-search-input]');
      var type = panel.querySelector('[data-type-filter]');
      var region = panel.querySelector('[data-region-filter]');
      var year = panel.querySelector('[data-year-filter]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var empty = document.querySelector(panel.getAttribute('data-empty-target') || '');
      function valueOf(node) {
        return node ? node.value.trim().toLowerCase() : '';
      }
      function apply() {
        var q = valueOf(input);
        var tv = valueOf(type);
        var rv = valueOf(region);
        var yv = valueOf(year);
        var visible = 0;
        cards.forEach(function (card) {
          var hay = (card.getAttribute('data-keywords') || '').toLowerCase();
          var ct = (card.getAttribute('data-type') || '').toLowerCase();
          var cr = (card.getAttribute('data-region') || '').toLowerCase();
          var cy = (card.getAttribute('data-year') || '').toLowerCase();
          var ok = true;
          if (q && hay.indexOf(q) === -1) {
            ok = false;
          }
          if (tv && ct !== tv) {
            ok = false;
          }
          if (rv && cr !== rv) {
            ok = false;
          }
          if (yv && cy !== yv) {
            ok = false;
          }
          card.classList.toggle('is-hidden', !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }
      [input, type, region, year].forEach(function (node) {
        if (node) {
          node.addEventListener('input', apply);
          node.addEventListener('change', apply);
        }
      });
    });
  }

  bindMenu();
  bindHero();
  bindFilters();
})();
