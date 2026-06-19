
(function () {
  window.initMoviePlayer = function (source) {
    const video = document.querySelector('[data-player-video]');
    const cover = document.querySelector('[data-player-cover]');
    const playButton = document.querySelector('[data-player-button]');
    if (!video || !source) {
      return;
    }

    let started = false;
    let hlsInstance = null;

    const load = function () {
      if (started) {
        return Promise.resolve();
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return Promise.resolve();
      }
      video.src = source;
      return Promise.resolve();
    };

    const begin = function () {
      load().then(function () {
        if (cover) {
          cover.classList.add('hidden');
        }
        const promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      });
    };

    if (cover) {
      cover.addEventListener('click', begin);
    }
    if (playButton) {
      playButton.addEventListener('click', begin);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      } else {
        video.pause();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
