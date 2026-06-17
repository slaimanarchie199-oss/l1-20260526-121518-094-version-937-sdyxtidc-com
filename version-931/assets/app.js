(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var grid = document.querySelector('[data-movie-grid]');
        if (!panel || !grid) {
            return;
        }

        var search = panel.querySelector('[data-filter-search]');
        var year = panel.querySelector('[data-filter-year]');
        var region = panel.querySelector('[data-filter-region]');
        var genre = panel.querySelector('[data-filter-genre]');
        var reset = panel.querySelector('[data-filter-reset]');
        var note = document.querySelector('[data-result-note]');
        var cards = Array.prototype.slice.call(grid.children);
        var urlQuery = new URLSearchParams(window.location.search).get('q');

        if (urlQuery && search) {
            search.value = urlQuery;
        }

        function apply() {
            var keyword = normalize(search && search.value);
            var selectedYear = normalize(year && year.value);
            var selectedRegion = normalize(region && region.value);
            var selectedGenre = normalize(genre && genre.value);
            var visible = 0;

            cards.forEach(function (card) {
                var title = normalize(card.getAttribute('data-title'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardGenre = normalize(card.getAttribute('data-genre'));
                var cardTags = normalize(card.getAttribute('data-tags'));
                var text = title + ' ' + cardYear + ' ' + cardRegion + ' ' + cardGenre + ' ' + cardTags + ' ' + normalize(card.textContent);
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    matched = false;
                }
                if (selectedRegion && cardRegion !== selectedRegion) {
                    matched = false;
                }
                if (selectedGenre && cardGenre.indexOf(selectedGenre) === -1) {
                    matched = false;
                }

                card.classList.toggle('hidden-card', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (note) {
                note.textContent = '正在显示 ' + visible + ' 部影片';
            }
        }

        [search, year, region, genre].forEach(function (item) {
            if (item) {
                item.addEventListener('input', apply);
                item.addEventListener('change', apply);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (search) search.value = '';
                if (year) year.value = '';
                if (region) region.value = '';
                if (genre) genre.value = '';
                apply();
            });
        }

        apply();
    }

    function initPlayer() {
        var wrap = document.querySelector('[data-player]');
        if (!wrap) {
            return;
        }

        var video = wrap.querySelector('video');
        var source = wrap.getAttribute('data-hls');
        var center = wrap.querySelector('[data-player-play]');
        var toggle = wrap.querySelector('[data-player-toggle]');
        var mute = wrap.querySelector('[data-player-mute]');
        var fullscreen = wrap.querySelector('[data-player-fullscreen]');
        var attached = false;

        function attachSource() {
            if (attached || !video || !source) {
                return;
            }
            attached = true;

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
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
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function playOrPause() {
            attachSource();
            if (video.paused) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            } else {
                video.pause();
            }
        }

        function syncState() {
            wrap.classList.toggle('playing', !video.paused);
            if (toggle) {
                toggle.textContent = video.paused ? '播放' : '暂停';
            }
            if (mute) {
                mute.textContent = video.muted ? '取消静音' : '静音';
            }
        }

        if (center) center.addEventListener('click', playOrPause);
        if (toggle) toggle.addEventListener('click', playOrPause);
        if (video) video.addEventListener('click', playOrPause);
        if (video) video.addEventListener('play', syncState);
        if (video) video.addEventListener('pause', syncState);
        if (video) video.addEventListener('volumechange', syncState);

        if (mute) {
            mute.addEventListener('click', function () {
                video.muted = !video.muted;
                syncState();
            });
        }

        if (fullscreen) {
            fullscreen.addEventListener('click', function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (wrap.requestFullscreen) {
                    wrap.requestFullscreen();
                }
            });
        }

        syncState();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHero();
        initFilters();
        initPlayer();
    });
})();
