(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var features = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-feature]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      features.forEach(function (feature, featureIndex) {
        feature.classList.toggle("is-active", featureIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
        dot.setAttribute("aria-current", dotIndex === current ? "true" : "false");
      });
    }

    function play() {
      stop();
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        play();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-search-input]");
      var targetSelector = panel.getAttribute("data-filter-target");
      var grid = targetSelector ? document.querySelector(targetSelector) : panel.parentElement.querySelector("[data-card-grid]");
      var empty = targetSelector ? document.querySelector(targetSelector + "-empty") : null;
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
      var filterButtons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
      var viewButtons = Array.prototype.slice.call(panel.querySelectorAll("[data-view-value]"));
      var activeFilter = "all";

      function apply() {
        var query = normalize(input ? input.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var title = normalize(card.getAttribute("data-title"));
          var tags = normalize(card.getAttribute("data-tags"));
          var region = normalize(card.getAttribute("data-region"));
          var year = normalize(card.getAttribute("data-year"));
          var type = normalize(card.getAttribute("data-type"));
          var category = normalize(card.getAttribute("data-category"));
          var haystack = [title, tags, region, year, type, category].join(" ");
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var filter = normalize(activeFilter);
          var matchesFilter = filter === "all" || region === filter || type === filter || category === filter || tags.indexOf(filter) !== -1;
          var showCard = matchesQuery && matchesFilter;
          card.classList.toggle("is-hidden", !showCard);
          if (showCard) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.getAttribute("data-filter-value") || "all";
          filterButtons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });

      viewButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          var value = button.getAttribute("data-view-value") || "grid";
          viewButtons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          grid.classList.toggle("is-list", value === "list");
        });
      });

      apply();
    });
  }

  function createMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var playButton = document.getElementById(config.playButtonId);
    var muteButton = document.getElementById(config.muteButtonId);
    var fullscreenButton = document.getElementById(config.fullscreenButtonId);
    var message = document.getElementById(config.messageId);
    var shell = video ? video.closest(".player-shell") : null;
    var hls = null;
    var loaded = false;

    if (!video || !config.source) {
      return;
    }

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add("is-visible");
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
        hls.loadSource(config.source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            showMessage("播放暂时不可用，请稍后重试");
          }
        });
      } else {
        video.src = config.source;
      }
    }

    function updateState() {
      var playing = !video.paused && !video.ended;
      if (shell) {
        shell.classList.toggle("is-playing", playing);
      }
      if (overlay) {
        overlay.classList.toggle("is-hidden", playing);
      }
      if (playButton) {
        playButton.textContent = playing ? "暂停" : "播放";
      }
      if (muteButton) {
        muteButton.textContent = video.muted ? "取消静音" : "静音";
      }
    }

    function play() {
      load();
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {
          showMessage("点击播放器开始观看");
        });
      }
    }

    function toggle() {
      if (video.paused || video.ended) {
        play();
      } else {
        video.pause();
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    if (playButton) {
      playButton.addEventListener("click", toggle);
    }
    if (muteButton) {
      muteButton.addEventListener("click", function () {
        video.muted = !video.muted;
        updateState();
      });
    }
    if (fullscreenButton) {
      fullscreenButton.addEventListener("click", function () {
        if (!document.fullscreenElement && shell && shell.requestFullscreen) {
          shell.requestFullscreen();
        } else if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      });
    }

    video.addEventListener("click", toggle);
    video.addEventListener("play", updateState);
    video.addEventListener("pause", updateState);
    video.addEventListener("ended", updateState);
    updateState();
  }

  window.createMoviePlayer = createMoviePlayer;

  ready(function () {
    setupMobileNav();
    setupHero();
    setupFilters();
  });
})();
