(function () {
  var video = document.getElementById('movie-video');
  var config = document.getElementById('player-config');
  var button = document.querySelector('[data-play-button]');

  if (!video || !config || !button) {
    return;
  }

  var streamUrl = '';
  try {
    streamUrl = JSON.parse(config.textContent).url || '';
  } catch (error) {
    streamUrl = '';
  }

  var prepared = false;
  var preparing = null;
  var wantedPlay = false;

  function setNative() {
    if (!video.getAttribute('src')) {
      video.setAttribute('src', streamUrl);
    }
  }

  function prepare() {
    if (prepared) {
      return Promise.resolve();
    }
    if (preparing) {
      return preparing;
    }
    if (!streamUrl) {
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      setNative();
      prepared = true;
      return Promise.resolve();
    }

    preparing = import('./hls-vendor-dru42stk.js').then(function (module) {
      var Hls = module.H;
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        setNative();
      }
      prepared = true;
    }).catch(function () {
      setNative();
      prepared = true;
    });

    return preparing;
  }

  function attemptPlay() {
    if (!streamUrl) {
      return;
    }
    wantedPlay = true;
    button.classList.add('is-hidden');
    prepare().then(function () {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    });
  }

  button.addEventListener('click', attemptPlay);
  video.addEventListener('click', function () {
    if (video.paused) {
      attemptPlay();
    }
  });
  video.addEventListener('canplay', function () {
    if (wantedPlay && video.paused) {
      video.play().catch(function () {});
    }
  });

  prepare();
}());
