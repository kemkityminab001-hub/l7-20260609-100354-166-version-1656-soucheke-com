(function () {
    "use strict";

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initMobileMenu() {
        var button = document.querySelector(".js-menu-toggle");
        var nav = document.querySelector(".js-mobile-nav");

        if (!button || !nav) {
            return;
        }

        button.addEventListener("click", function () {
            var isOpen = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!isOpen));
            nav.hidden = isOpen;
        });
    }

    function initImageFallbacks() {
        document.querySelectorAll(".poster-frame img").forEach(function (image) {
            image.addEventListener("error", function () {
                var frame = image.closest(".poster-frame");

                if (frame) {
                    frame.classList.add("is-missing");
                }
            }, { once: true });
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector(".js-hero-slider");

        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var currentIndex = 0;
        var timer = null;

        function activate(index) {
            currentIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === currentIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === currentIndex);
            });
        }

        function start() {
            if (timer || slides.length < 2) {
                return;
            }

            timer = window.setInterval(function () {
                activate(currentIndex + 1);
            }, 4800);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                stop();
                activate(index);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        activate(0);
        start();
    }

    function applyFilters(panel) {
        var grid = document.querySelector(".js-card-grid");
        var input = panel.querySelector(".js-card-filter");
        var query = normalize(input ? input.value : "");
        var activeButtons = Array.prototype.slice.call(panel.querySelectorAll(".js-filter-button.is-active"));
        var filters = activeButtons.map(function (button) {
            return {
                field: button.getAttribute("data-filter-field"),
                value: normalize(button.getAttribute("data-filter-value"))
            };
        }).filter(function (filter) {
            return filter.field && filter.value;
        });
        var visibleCount = 0;

        if (!grid) {
            return;
        }

        grid.querySelectorAll(".movie-card").forEach(function (card) {
            var text = normalize(card.getAttribute("data-search"));
            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesFilters = filters.every(function (filter) {
                return normalize(card.getAttribute("data-" + filter.field)) === filter.value;
            });
            var shouldShow = matchesQuery && matchesFilters;

            card.classList.toggle("is-hidden", !shouldShow);

            if (shouldShow) {
                visibleCount += 1;
            }
        });

        panel.querySelectorAll(".js-result-count").forEach(function (target) {
            target.textContent = String(visibleCount);
        });
    }

    function initFilters() {
        document.querySelectorAll(".js-filter-panel").forEach(function (panel) {
            var input = panel.querySelector(".js-card-filter");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";

            if (input && query) {
                input.value = query;
            }

            if (input) {
                input.addEventListener("input", function () {
                    applyFilters(panel);
                });
            }

            panel.querySelectorAll(".js-filter-button").forEach(function (button) {
                button.addEventListener("click", function () {
                    var group = button.closest("[data-filter-group]");

                    if (group) {
                        group.querySelectorAll(".js-filter-button").forEach(function (otherButton) {
                            otherButton.classList.remove("is-active");
                            otherButton.setAttribute("aria-pressed", "false");
                        });
                    }

                    button.classList.add("is-active");
                    button.setAttribute("aria-pressed", "true");
                    applyFilters(panel);
                });
            });

            applyFilters(panel);
        });
    }

    function loadHlsLibrary(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        var existingScript = document.querySelector("script[data-hls-loader]");

        if (existingScript) {
            existingScript.addEventListener("load", callback, { once: true });
            return;
        }

        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
        script.defer = true;
        script.setAttribute("data-hls-loader", "true");
        script.addEventListener("load", callback, { once: true });
        document.head.appendChild(script);
    }

    function prepareVideo(video, done) {
        var source = video.getAttribute("data-hls-src") || "";

        if (!source) {
            return;
        }

        if (video.getAttribute("data-ready") === "true") {
            done();
            return;
        }

        function markReady() {
            video.setAttribute("data-ready", "true");
            done();
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            markReady();
            return;
        }

        loadHlsLibrary(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(source);
                hls.attachMedia(video);

                window.__movieHlsInstances = window.__movieHlsInstances || [];
                window.__movieHlsInstances.push(hls);
                markReady();
            } else {
                video.src = source;
                markReady();
            }
        });
    }

    function initPlayers() {
        document.querySelectorAll(".js-play-video").forEach(function (button) {
            var shell = button.closest(".video-shell");
            var video = shell ? shell.querySelector(".js-hls-video") : null;

            if (!video) {
                return;
            }

            button.addEventListener("click", function () {
                button.disabled = true;
                prepareVideo(video, function () {
                    var playPromise = video.play();

                    button.classList.add("is-hidden");

                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {
                            button.disabled = false;
                            button.classList.remove("is-hidden");
                        });
                    }
                });
            });

            video.addEventListener("play", function () {
                button.classList.add("is-hidden");
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initImageFallbacks();
        initHeroSlider();
        initFilters();
        initPlayers();
    });
})();
