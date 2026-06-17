import { H as Hls } from './hls.js';

const setupPlayer = (player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const source = video?.dataset.src;
    let initialized = false;

    if (!video || !source) {
        return;
    }

    const attachSource = () => {
        if (initialized) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }

        initialized = true;
    };

    const play = () => {
        attachSource();
        player.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
        video.play().catch(() => {
            player.classList.remove('is-playing');
        });
    };

    if (button) {
        button.addEventListener('click', play);
    }

    video.addEventListener('click', () => {
        if (!initialized || video.paused) {
            play();
        }
    });

    video.addEventListener('play', () => {
        player.classList.add('is-playing');
    });

    video.addEventListener('pause', () => {
        if (!video.seeking && video.currentTime === 0) {
            player.classList.remove('is-playing');
        }
    });
};

document.querySelectorAll('[data-player]').forEach(setupPlayer);
