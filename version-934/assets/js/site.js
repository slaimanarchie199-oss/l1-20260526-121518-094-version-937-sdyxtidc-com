(() => {
  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  };

  const normalize = (value) => (value || '').toString().toLowerCase().trim();

  ready(() => {
    initMobileNavigation();
    initHeroSlider();
    initFilters();
    initPlayers();
  });

  function initMobileNavigation() {
    const toggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (!toggle || !mobileNav) {
      return;
    }

    toggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function initHeroSlider() {
    const hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const previousButton = hero.querySelector('[data-hero-prev]');
    const nextButton = hero.querySelector('[data-hero-next]');
    let currentIndex = 0;
    let timer = null;

    if (slides.length <= 1) {
      return;
    }

    const showSlide = (nextIndex) => {
      currentIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach((slide, index) => {
        slide.classList.toggle('is-active', index === currentIndex);
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === currentIndex);
      });
    };

    const startAutoPlay = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => showSlide(currentIndex + 1), 5000);
    };

    previousButton?.addEventListener('click', () => {
      showSlide(currentIndex - 1);
      startAutoPlay();
    });

    nextButton?.addEventListener('click', () => {
      showSlide(currentIndex + 1);
      startAutoPlay();
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(index);
        startAutoPlay();
      });
    });

    startAutoPlay();
  }

  function initFilters() {
    const lists = Array.from(document.querySelectorAll('[data-filter-list]'));

    if (!lists.length) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const queryFromUrl = params.get('q') || '';
    const autoFillInput = document.querySelector('[data-autofill-query]');

    if (autoFillInput && queryFromUrl) {
      autoFillInput.value = queryFromUrl;
    }

    const cards = Array.from(document.querySelectorAll('[data-filter-card]'));
    const input = document.querySelector('[data-filter-input]');
    const yearSelect = document.querySelector('[data-filter-year]');
    const typeSelect = document.querySelector('[data-filter-type]');
    const regionSelect = document.querySelector('[data-filter-region]');
    const sortSelect = document.querySelector('[data-sort-select]');
    const countNode = document.querySelector('[data-visible-count]');
    const emptyNode = document.querySelector('[data-empty-result]');
    const list = lists[0];
    const originalOrder = new Map(cards.map((card, index) => [card, index]));

    const applyFilters = () => {
      const query = normalize(input?.value);
      const year = normalize(yearSelect?.value);
      const type = normalize(typeSelect?.value);
      const region = normalize(regionSelect?.value);
      let visibleCount = 0;

      cards.forEach((card) => {
        const searchText = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags,
          card.textContent
        ].join(' '));
        const matchesQuery = !query || searchText.includes(query);
        const matchesYear = !year || normalize(card.dataset.year) === year;
        const matchesType = !type || normalize(card.dataset.type) === type;
        const matchesRegion = !region || normalize(card.dataset.region) === region;
        const isVisible = matchesQuery && matchesYear && matchesType && matchesRegion;

        card.hidden = !isVisible;
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(visibleCount);
      }

      if (emptyNode) {
        emptyNode.hidden = visibleCount !== 0;
      }
    };

    const applySort = () => {
      const value = sortSelect?.value || 'default';
      const sortedCards = [...cards];

      sortedCards.sort((a, b) => {
        if (value === 'year-desc') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }

        if (value === 'year-asc') {
          return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
        }

        if (value === 'score-desc') {
          return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        }

        if (value === 'title-asc') {
          return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
        }

        return (originalOrder.get(a) || 0) - (originalOrder.get(b) || 0);
      });

      sortedCards.forEach((card) => list.appendChild(card));
      applyFilters();
    };

    [input, yearSelect, typeSelect, regionSelect].forEach((control) => {
      control?.addEventListener('input', applyFilters);
      control?.addEventListener('change', applyFilters);
    });

    sortSelect?.addEventListener('change', applySort);

    applySort();
    applyFilters();
  }

  function initPlayers() {
    const videos = Array.from(document.querySelectorAll('[data-hls-player]'));

    videos.forEach((video) => {
      const source = video.getAttribute('data-src');
      const playerCard = video.closest('.player-card');
      const playTrigger = playerCard?.querySelector('[data-play-trigger]');

      if (!source) {
        return;
      }

      const attachSource = () => {
        if (video.dataset.hlsAttached === 'true') {
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, (_event, data) => {
            if (!data?.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });

          video._hlsInstance = hls;
          video.dataset.hlsAttached = 'true';
          return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.dataset.hlsAttached = 'true';
          return Promise.resolve();
        }

        return Promise.reject(new Error('当前浏览器不支持 HLS 播放'));
      };

      const playVideo = () => {
        attachSource()
          .then(() => video.play())
          .then(() => {
            playerCard?.classList.add('is-playing');
            playTrigger?.classList.add('is-hidden');
          })
          .catch((error) => {
            console.warn(error);
            playerCard?.classList.remove('is-playing');
          });
      };

      attachSource().catch(() => {
        /* Keep the overlay clickable, so a later user gesture can retry playback. */
      });

      playTrigger?.addEventListener('click', playVideo);
      video.addEventListener('play', () => playerCard?.classList.add('is-playing'));
      video.addEventListener('pause', () => playerCard?.classList.remove('is-playing'));
    });
  }
})();
