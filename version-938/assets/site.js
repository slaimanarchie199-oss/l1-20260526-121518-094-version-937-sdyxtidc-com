(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
    initSearchForms();
  });

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    if (!slides.length) return;
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    start();
  }

  function initSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-nav-search]'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input) return;
        var query = input.value.trim();
        if (!query) return;
        event.preventDefault();
        window.location.href = 'videos.html?q=' + encodeURIComponent(query);
      });
    });
  }

  function initFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
    roots.forEach(function (root) {
      var search = root.querySelector('[data-filter-search]');
      var year = root.querySelector('[data-filter-year]');
      var type = root.querySelector('[data-filter-type]');
      var category = root.querySelector('[data-filter-category]');
      var empty = root.querySelector('[data-empty-result]');
      var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && search) {
        search.value = q;
      }

      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : '';
      }

      function haystack(card) {
        return [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' ').toLowerCase();
      }

      function apply() {
        var text = valueOf(search);
        var wantedYear = valueOf(year);
        var wantedType = valueOf(type);
        var wantedCategory = valueOf(category);
        var shown = 0;
        cards.forEach(function (card) {
          var ok = true;
          if (text && haystack(card).indexOf(text) === -1) ok = false;
          if (wantedYear && String(card.getAttribute('data-year')).toLowerCase() !== wantedYear) ok = false;
          if (wantedType && String(card.getAttribute('data-type')).toLowerCase() !== wantedType) ok = false;
          if (wantedCategory && String(card.getAttribute('data-category')).toLowerCase() !== wantedCategory) ok = false;
          card.classList.toggle('is-hidden', !ok);
          if (ok) shown += 1;
        });
        if (empty) {
          empty.classList.toggle('show', shown === 0);
        }
      }

      [search, year, type, category].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.watch-player'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play]');
      if (!video || !button) return;
      var src = video.getAttribute('data-stream');
      var mounted = false;
      var instance = null;

      function mount() {
        if (mounted || !src) return;
        if (window.Hls && window.Hls.isSupported()) {
          instance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          instance.loadSource(src);
          instance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        }
        mounted = true;
      }

      function play(event) {
        if (event) event.preventDefault();
        mount();
        player.classList.add('is-active');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      button.addEventListener('click', play);
      player.addEventListener('click', function (event) {
        if (event.target === player || event.target === button || event.target.closest('[data-play]')) {
          play(event);
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-active');
      });
      window.addEventListener('beforeunload', function () {
        if (instance) instance.destroy();
      });
    });
  }
})();
