(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      if (!query) {
        event.preventDefault();
        window.location.href = 'search.html';
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var filterForm = document.querySelector('[data-filter-form]');
  var list = document.querySelector('[data-card-list]');
  if (filterForm && list) {
    var keywordInput = filterForm.querySelector('[data-filter-keyword]');
    var yearSelect = filterForm.querySelector('[data-filter-year]');
    var typeSelect = filterForm.querySelector('[data-filter-type]');
    var categorySelect = filterForm.querySelector('[data-filter-category]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var preset = params.get('q') || '';

    if (keywordInput && preset) {
      keywordInput.value = preset;
    }

    function textOf(card) {
      return [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-category') || ''
      ].join(' ').toLowerCase();
    }

    function apply() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matched = true;
        if (keyword && textOf(card).indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && (card.getAttribute('data-year') || '').indexOf(year) === -1) {
          matched = false;
        }
        if (type && (card.getAttribute('data-type') || '').indexOf(type) === -1) {
          matched = false;
        }
        if (category && (card.getAttribute('data-category') || '') !== category) {
          matched = false;
        }
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [keywordInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }
}());
