(function () {
  var DEFAULT_HLS_SOURCE = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function initImageFallbacks() {
    qsa("img[data-fallback]").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-hidden");
      });
    });
  }

  function initHeaderSearch() {
    qsa("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = qs("input", form);
        var query = input ? input.value.trim() : "";
        var root = form.getAttribute("data-root") || ".";
        var target = root.replace(/\/$/, "") + "/search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function initLocalFilters() {
    var panel = qs("[data-filter-panel]");
    if (!panel) {
      return;
    }

    var cards = qsa("[data-movie-card]");
    var keywordInput = qs("[data-filter-keyword]", panel);
    var typeSelect = qs("[data-filter-type]", panel);
    var genreSelect = qs("[data-filter-genre]", panel);
    var yearSelect = qs("[data-filter-year]", panel);
    var countNode = qs("[data-result-count]");

    function applyFilter() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var typeValue = normalize(typeSelect && typeSelect.value);
      var genreValue = normalize(genreSelect && genreSelect.value);
      var yearValue = normalize(yearSelect && yearSelect.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" "));
        var ok = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (typeValue && normalize(card.getAttribute("data-type")) !== typeValue) {
          ok = false;
        }
        if (genreValue && normalize(card.getAttribute("data-genre")).indexOf(genreValue) === -1) {
          ok = false;
        }
        if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
          ok = false;
        }

        card.classList.toggle("hidden-by-filter", !ok);
        if (ok) {
          visibleCount += 1;
        }
      });

      if (countNode) {
        countNode.textContent = "当前显示 " + visibleCount + " 部";
      }
    }

    [keywordInput, typeSelect, genreSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && keywordInput) {
      keywordInput.value = query;
    }
    applyFilter();
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    var track = qs("[data-hero-track]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    if (!track || dots.length === 0) {
      return;
    }
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + dots.length) % dots.length;
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function loadHls(video, source) {
    if (!source) {
      source = DEFAULT_HLS_SOURCE;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return Promise.resolve();
    }

    video.src = source;
    return Promise.resolve();
  }

  function initPlayers() {
    qsa("[data-player]").forEach(function (player) {
      var video = qs("video", player);
      var button = qs("[data-play-button]", player);
      if (!video || !button) {
        return;
      }

      button.addEventListener("click", function () {
        var source = player.getAttribute("data-hls") || DEFAULT_HLS_SOURCE;
        var alreadyLoaded = player.getAttribute("data-loaded") === "true";

        function startPlayback() {
          player.setAttribute("data-loaded", "true");
          button.classList.add("is-hidden");
          video.controls = true;
          video.play().catch(function () {
            button.classList.remove("is-hidden");
          });
        }

        if (alreadyLoaded) {
          startPlayback();
          return;
        }

        loadHls(video, source).then(startPlayback);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initImageFallbacks();
    initHeaderSearch();
    initLocalFilters();
    initHero();
    initPlayers();
  });
}());
