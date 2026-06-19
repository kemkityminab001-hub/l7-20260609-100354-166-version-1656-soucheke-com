(function () {
    function mount(videoId, buttonId, streamUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var attached = false;
        var hls = null;

        if (!video || !button || !streamUrl) {
            return;
        }

        function hideButton() {
            button.classList.add("is-hidden");
        }

        function showButton() {
            if (video.paused && video.currentTime <= 0.01) {
                button.classList.remove("is-hidden");
            }
        }

        function attachStream() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function startPlayback(event) {
            if (event) {
                event.preventDefault();
            }
            attachStream();
            hideButton();
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", startPlayback);
        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                startPlayback();
            }
        });
        video.addEventListener("play", hideButton);
        video.addEventListener("ended", function () {
            button.classList.remove("is-hidden");
        });
        video.addEventListener("pause", showButton);
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    window.HDPlayer = {
        mount: mount
    };
})();
