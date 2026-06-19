(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) return;
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", open);
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-slider]");
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) return;
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var grid = scope.querySelector("[data-movie-grid]");
      var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]")) : [];
      var empty = scope.querySelector("[data-empty-state]");
      var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-chip]"));
      var chipValue = "";

      function apply() {
        var query = normalize(input ? input.value : "");
        var chip = normalize(chipValue);
        var shown = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchChip = !chip || text.indexOf(chip) !== -1;
          var visible = matchQuery && matchChip;
          card.hidden = !visible;
          if (visible) shown += 1;
        });
        if (empty) empty.hidden = shown !== 0;
      }

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (input.hasAttribute("data-query-sync") && q) {
          input.value = q;
        }
        input.addEventListener("input", apply);
      }

      chips.forEach(function (chipButton) {
        chipButton.addEventListener("click", function () {
          chipValue = chipButton.getAttribute("data-filter-chip") || "";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chipButton);
          });
          apply();
        });
      });

      apply();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var source = player.getAttribute("data-play-src");
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var status = player.querySelector("[data-player-status]");
      var hls = null;
      var attached = false;

      if (!source || !video || !button) return;

      function setStatus(text) {
        if (status) status.textContent = text || "";
      }

      function playVideo() {
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {
            setStatus("点击视频区域继续播放");
          });
        }
      }

      function attach() {
        if (attached) {
          playVideo();
          return;
        }
        attached = true;
        setStatus("正在加载影片");

        if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("");
            playVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) return;
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus("正在重新连接");
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus("正在恢复播放");
              hls.recoverMediaError();
            } else {
              setStatus("播放暂时不可用，请稍后再试");
              hls.destroy();
            }
          });
        } else {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            setStatus("");
          }, { once: true });
          playVideo();
        }
      }

      button.addEventListener("click", attach);
      player.addEventListener("click", function (event) {
        if (event.target === video || event.target === player) {
          attach();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
        setStatus("");
      });
      video.addEventListener("pause", function () {
        if (!video.ended && attached) {
          player.classList.remove("is-playing");
        }
      });
      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
      });
      window.addEventListener("pagehide", function () {
        if (hls) hls.destroy();
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
