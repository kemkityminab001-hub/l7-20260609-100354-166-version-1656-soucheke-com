(function () {
    function initMoviePlayer(options) {
        var video = document.querySelector(".js-movie-video");
        var overlay = document.querySelector(".player-overlay");
        var trigger = document.querySelector(".js-play-trigger");
        var hlsInstance = null;
        var loaded = false;

        if (!video || !options || !options.src) {
            return;
        }

        function loadVideo() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(options.src);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (!data || !data.fatal || !hlsInstance) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = options.src;
            } else {
                video.src = options.src;
            }
        }

        function startPlay() {
            loadVideo();
            if (overlay) {
                overlay.classList.add("hide");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (trigger) {
            trigger.addEventListener("click", startPlay);
        }
        if (overlay) {
            overlay.addEventListener("click", startPlay);
        }
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("hide");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
