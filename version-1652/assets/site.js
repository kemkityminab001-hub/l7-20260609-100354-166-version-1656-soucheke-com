(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-button]");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var next = document.querySelector("[data-hero-next]");
    var prev = document.querySelector("[data-hero-prev]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var target = Number(dot.getAttribute("data-hero-dot") || "0");
        show(target);
        restart();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        move(1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        restart();
      });
    }

    restart();
  }

  function setupGlobalSearch() {
    var panel = document.querySelector("[data-search-panel]");
    var input = document.querySelector("[data-global-search]");
    var results = document.querySelector("[data-search-results]");
    var openButtons = Array.prototype.slice.call(document.querySelectorAll("[data-open-search]"));
    var closeButtons = Array.prototype.slice.call(document.querySelectorAll("[data-close-search]"));
    var index = window.SEARCH_INDEX || [];

    if (!panel || !input || !results) {
      return;
    }

    function itemText(item) {
      return [
        item.title,
        item.year,
        item.region,
        item.type,
        item.category,
        item.tags
      ].join(" ").toLowerCase();
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      var list = query ? index.filter(function (item) {
        return itemText(item).indexOf(query) !== -1;
      }).slice(0, 30) : index.slice(0, 10);

      if (!list.length) {
        results.innerHTML = '<p class="search-empty">没有找到匹配影片</p>';
        return;
      }

      results.innerHTML = list.map(function (item) {
        return '<a class="search-result-item" href="' + item.url + '">' +
          '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">' +
          '<span><strong>' + escapeHtml(item.title) + '</strong>' +
          '<span>' + escapeHtml(String(item.year)) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</span></span>' +
          '</a>';
      }).join("");
    }

    function openPanel() {
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      document.body.classList.add("search-open");
      document.body.classList.remove("menu-open");
      input.focus();
      render();
    }

    function closePanel() {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      document.body.classList.remove("search-open");
    }

    openButtons.forEach(function (button) {
      button.addEventListener("click", openPanel);
    });

    closeButtons.forEach(function (button) {
      button.addEventListener("click", closePanel);
    });

    input.addEventListener("input", render);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closePanel();
      }
    });
  }

  function setupInlineSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-inline-search]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var panelInput = document.querySelector("[data-global-search]");
        var input = form.querySelector("input");
        var openButton = document.querySelector("[data-open-search]");
        if (panelInput && input) {
          panelInput.value = input.value;
        }
        if (openButton) {
          openButton.click();
        }
      });
    });
  }

  function setupPageFilter() {
    var input = document.querySelector("[data-page-filter]");
    var scope = document.querySelector("[data-filter-scope]");
    if (!input || !scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-card]"));
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        card.classList.toggle("is-filtered", query && text.indexOf(query) === -1);
      });
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.initMoviePlayer = function (sourceUrl) {
    var video = document.getElementById("movie-player");
    var startButton = document.querySelector("[data-player-start]");
    var started = false;
    var hls = null;

    if (!video || !startButton || !sourceUrl) {
      return;
    }

    function attachAndPlay() {
      if (!started) {
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
              return;
            }
            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
              return;
            }
            hls.destroy();
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else {
          video.src = sourceUrl;
        }
      }
      startButton.classList.add("is-hidden");
      video.play().catch(function () {});
    }

    startButton.addEventListener("click", attachAndPlay);
    video.addEventListener("click", function () {
      if (!started) {
        attachAndPlay();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupGlobalSearch();
    setupInlineSearch();
    setupPageFilter();
  });
})();
