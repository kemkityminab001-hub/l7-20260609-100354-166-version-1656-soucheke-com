(function () {
  var body = document.body;
  var mobileToggle = document.querySelector("[data-mobile-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var modal = document.querySelector("[data-search-modal]");
  var input = document.querySelector("[data-search-input]");
  var results = document.querySelector("[data-search-results]");
  var openers = document.querySelectorAll("[data-search-open]");
  var closer = document.querySelector("[data-search-close]");

  function openSearch() {
    if (!modal) {
      return;
    }
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    body.style.overflow = "hidden";
    setTimeout(function () {
      if (input) {
        input.focus();
      }
    }, 30);
  }

  function closeSearch() {
    if (!modal) {
      return;
    }
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    body.style.overflow = "";
  }

  openers.forEach(function (button) {
    button.addEventListener("click", openSearch);
  });

  if (closer) {
    closer.addEventListener("click", closeSearch);
  }

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeSearch();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeSearch();
    }
  });

  function resultTemplate(item) {
    return "<a class=\"search-result-item\" href=\"" + item.url + "\">" +
      "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\">" +
      "<span><strong>" + escapeHtml(item.title) + "</strong><span>" + item.year + " · " + escapeHtml(item.region) + " · " + escapeHtml(item.type) + " · " + escapeHtml(item.genre) + "</span></span>" +
      "</a>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function runSearch(value) {
    if (!results) {
      return;
    }
    var query = String(value || "").trim().toLowerCase();
    var index = window.SITE_SEARCH || [];
    if (!query) {
      results.innerHTML = "<div class=\"search-empty\">输入片名、类型、地区或年份进行搜索</div>";
      return;
    }
    var matched = index.filter(function (item) {
      return [item.title, item.year, item.region, item.type, item.genre].join(" ").toLowerCase().indexOf(query) !== -1;
    }).slice(0, 30);
    results.innerHTML = matched.length ? matched.map(resultTemplate).join("") : "<div class=\"search-empty\">没有找到匹配影片</div>";
  }

  if (input) {
    input.addEventListener("input", function () {
      runSearch(input.value);
    });
    runSearch("");
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        play();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });

    show(0);
    play();
  }

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var textInput = panel.querySelector("[data-page-filter]");
    var grid = document.querySelector("[data-card-grid]");
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll("[data-card]")) : [];
    var activeYear = "";
    var activeGenre = "";

    function applyFilters() {
      var query = textInput ? textInput.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var hay = [card.dataset.title, card.dataset.year, card.dataset.region, card.dataset.type, card.dataset.genre].join(" ").toLowerCase();
        var yearOk = !activeYear || card.dataset.year === activeYear;
        var genreOk = !activeGenre || String(card.dataset.genre || "").indexOf(activeGenre) !== -1;
        var textOk = !query || hay.indexOf(query) !== -1;
        card.classList.toggle("is-filter-hidden", !(yearOk && genreOk && textOk));
      });
    }

    if (textInput) {
      textInput.addEventListener("input", applyFilters);
    }

    panel.querySelectorAll("[data-filter-year]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeYear = button.dataset.filterYear;
        activeGenre = "";
        panel.querySelectorAll(".filter-row button").forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        applyFilters();
      });
    });

    panel.querySelectorAll("[data-filter-genre]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeGenre = button.dataset.filterGenre;
        activeYear = "";
        panel.querySelectorAll(".filter-row button").forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        applyFilters();
      });
    });

    panel.querySelectorAll("[data-filter-all]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeYear = "";
        activeGenre = "";
        panel.querySelectorAll(".filter-row button").forEach(function (item) {
          item.classList.remove("is-active");
        });
        applyFilters();
      });
    });
  });

  window.SiteMovie = {
    initPlayer: function (source) {
      var video = document.getElementById("movieVideo");
      var overlay = document.getElementById("playerOverlay");
      var start = document.getElementById("playerStart");
      var detailButton = document.getElementById("detailPlayButton");
      var loaded = false;
      var hlsInstance = null;

      function load() {
        if (!video || loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        if (!video) {
          return;
        }
        load();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
        overlay.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            play();
          }
        });
      }

      if (start) {
        start.addEventListener("click", function (event) {
          event.stopPropagation();
          play();
        });
      }

      if (detailButton) {
        detailButton.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("play", function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  };
})();
