(function () {
    var header = document.querySelector('[data-site-header]');
    var navToggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 18) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (navToggle && header && nav) {
        navToggle.addEventListener('click', function () {
            header.classList.toggle('nav-open');
        });

        nav.addEventListener('click', function (event) {
            if (event.target.tagName === 'A') {
                header.classList.remove('nav-open');
            }
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var heroIndex = 0;
    var heroTimer = null;

    function setHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
            slide.classList.toggle('is-active', itemIndex === heroIndex);
        });
        dots.forEach(function (dot, itemIndex) {
            dot.classList.toggle('is-active', itemIndex === heroIndex);
        });
    }

    function restartHero() {
        if (!slides.length) {
            return;
        }
        if (heroTimer) {
            window.clearInterval(heroTimer);
        }
        heroTimer = window.setInterval(function () {
            setHero(heroIndex + 1);
        }, 5000);
    }

    if (slides.length) {
        setHero(0);
        restartHero();
    }

    if (prev) {
        prev.addEventListener('click', function () {
            setHero(heroIndex - 1);
            restartHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            setHero(heroIndex + 1);
            restartHero();
        });
    }

    dots.forEach(function (dot, itemIndex) {
        dot.addEventListener('click', function () {
            setHero(itemIndex);
            restartHero();
        });
    });

    var filterInput = document.querySelector('[data-filter-input]');
    var regionSelect = document.querySelector('[data-region-filter]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var query = normalize(filterInput && filterInput.value);
        var region = normalize(regionSelect && regionSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var visibleCount = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-tags')
            ].join(' '));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var matchedQuery = !query || haystack.indexOf(query) !== -1;
            var matchedRegion = !region || cardRegion.indexOf(region) !== -1;
            var matchedYear = !year || cardYear === year;
            var visible = matchedQuery && matchedRegion && matchedYear;

            card.style.display = visible ? '' : 'none';
            if (visible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visibleCount === 0);
        }
    }

    [filterInput, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
            control.addEventListener('input', filterCards);
            control.addEventListener('change', filterCards);
        }
    });

    filterCards();
})();

window.initMoviePlayer = function (source) {
    var video = document.querySelector('[data-movie-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var playButton = document.querySelector('[data-play-button]');
    var attached = false;
    var hls = null;

    if (!video || !source) {
        return;
    }

    function attach() {
        if (attached) {
            return;
        }
        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function startPlayback() {
        attach();
        if (overlay) {
            overlay.hidden = true;
        }
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function () {
                video.controls = true;
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    if (playButton) {
        playButton.addEventListener('click', function (event) {
            event.stopPropagation();
            startPlayback();
        });
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
};
