(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (slides.length === 0) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-slide') || 0);
        show(index);
        start();
      });
    });

    var hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }
    start();
  }

  function initSearch() {
    var input = document.getElementById('movieSearch');
    var cards = Array.prototype.slice.call(document.querySelectorAll('#allMovies .movie-card'));
    if (!input || cards.length === 0) {
      return;
    }
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.innerText.toLowerCase();
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var year = card.getAttribute('data-year') || '';
        var matched = !keyword || text.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1 || year.indexOf(keyword) !== -1;
        card.classList.toggle('hidden-by-search', !matched);
      });
    });
  }

  function hideBrokenImages() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img'));
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
      }, { once: true });
    });
  }

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector('script[data-hls-loader="true"]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function attachVideo(video, url, frame) {
    if (!url || video.getAttribute('data-ready') === 'true') {
      return;
    }
    video.setAttribute('data-ready', 'true');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play().catch(function () {});
      return;
    }

    loadHlsLibrary(function () {
      if (!window.Hls || !window.Hls.isSupported()) {
        video.src = url;
        video.play().catch(function () {});
        return;
      }
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          frame.classList.remove('playing');
        }
      });
    });
  }

  function initVideo() {
    var frames = Array.prototype.slice.call(document.querySelectorAll('.video-frame'));
    frames.forEach(function (frame) {
      var video = frame.querySelector('.movie-video');
      var button = frame.querySelector('.play-button');
      if (!video) {
        return;
      }
      var url = video.getAttribute('data-video') || '';
      var play = function () {
        frame.classList.add('playing');
        attachVideo(video, url, frame);
        if (video.src) {
          video.play().catch(function () {});
        }
      };
      frame.addEventListener('click', function (event) {
        if (event.target === video && video.src) {
          return;
        }
        play();
      });
      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          play();
        });
      }
      video.addEventListener('play', function () {
        frame.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          frame.classList.remove('playing');
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    hideBrokenImages();
    initVideo();
  });
})();
