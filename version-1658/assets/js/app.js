(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll(".hero-slide", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupCardFilters() {
    selectAll("[data-card-filter]").forEach(function (input) {
      var container = document.querySelector("[data-card-list]");
      if (!container) {
        return;
      }
      var cards = selectAll(".movie-card-link", container);
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
          card.classList.toggle("is-filtered-out", query && text.indexOf(query) === -1);
        });
      });
    });
  }

  function buildSearchCard(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 2).join(" / ") : movie.genre;
    return [
      '<a class="movie-card-link" href="' + escapeHtml(movie.page) + '">',
      '<article class="movie-card is-compact">',
      '<div class="movie-poster">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<h2>' + escapeHtml(movie.title) + '</h2>',
      '<p class="movie-meta-line">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
      '<p class="movie-genre">' + escapeHtml(tags) + '</p>',
      '</div>',
      '</article>',
      '</a>'
    ].join("");
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !summary || !window.movieSearchData) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }

    if (!query) {
      return;
    }

    var keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matches = window.movieSearchData.filter(function (movie) {
      var source = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" ").toLowerCase();
      return keywords.every(function (word) {
        return source.indexOf(word) !== -1;
      });
    });

    summary.textContent = '“' + query + '”相关结果：' + matches.length + ' 部';
    results.innerHTML = matches.slice(0, 240).map(buildSearchCard).join("");
  }

  function setupBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    function sync() {
      button.classList.toggle("is-visible", window.scrollY > 360);
    }
    window.addEventListener("scroll", sync, { passive: true });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    sync();
  }

  function initMoviePlayer(sourceUrl) {
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("moviePlayButton");
    if (!video || !button || !sourceUrl) {
      return;
    }
    var loaded = false;
    var hlsInstance = null;

    function load() {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
      loaded = true;
    }

    function play() {
      load();
      button.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupCardFilters();
    setupSearchPage();
    setupBackTop();
  });
})();
