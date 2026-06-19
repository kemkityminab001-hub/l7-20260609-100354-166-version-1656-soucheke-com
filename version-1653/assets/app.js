document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initHeroCarousel();
  initMovieFilters();
  initQueryParams();
  initHlsPlayer();
});

function initMobileMenu() {
  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-main-nav]");

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", function () {
    nav.classList.toggle("is-open");
  });
}

function initHeroCarousel() {
  var carousel = document.querySelector("[data-hero-carousel]");

  if (!carousel) {
    return;
  }

  var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
  var prev = carousel.querySelector("[data-hero-prev]");
  var next = carousel.querySelector("[data-hero-next]");
  var current = 0;
  var timer = null;

  function show(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (prev) {
    prev.addEventListener("click", function () {
      show(current - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(current + 1);
      start();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var index = Number(dot.getAttribute("data-hero-dot"));
      show(index);
      start();
    });
  });

  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  show(0);
  start();
}

function initMovieFilters() {
  var panel = document.querySelector("[data-filter-panel]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

  if (!panel || !cards.length) {
    return;
  }

  var keywordInput = panel.querySelector("[data-filter-keyword]");
  var yearSelect = panel.querySelector("[data-filter-year]");
  var regionSelect = panel.querySelector("[data-filter-region]");
  var categorySelect = panel.querySelector("[data-filter-category]");
  var result = panel.querySelector("[data-filter-result]");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function matchesRegion(cardRegion, selectedRegion) {
    if (!selectedRegion) {
      return true;
    }

    return cardRegion.indexOf(selectedRegion) !== -1 || selectedRegion.indexOf(cardRegion) !== -1;
  }

  function applyFilters() {
    var keyword = normalize(keywordInput && keywordInput.value);
    var year = normalize(yearSelect && yearSelect.value);
    var region = normalize(regionSelect && regionSelect.value);
    var category = normalize(categorySelect && categorySelect.value);
    var visible = 0;

    cards.forEach(function (card) {
      var searchText = normalize(card.getAttribute("data-search"));
      var cardYear = normalize(card.getAttribute("data-year"));
      var cardRegion = normalize(card.getAttribute("data-region"));
      var cardCategory = normalize(card.getAttribute("data-category"));
      var keywordMatch = !keyword || searchText.indexOf(keyword) !== -1;
      var yearMatch = !year || cardYear === year;
      var regionMatch = matchesRegion(cardRegion, region);
      var categoryMatch = !category || cardCategory === category;
      var isVisible = keywordMatch && yearMatch && regionMatch && categoryMatch;

      card.classList.toggle("is-hidden", !isVisible);

      if (isVisible) {
        visible += 1;
      }
    });

    if (result) {
      result.textContent = "当前显示 " + visible + " 部内容";
    }
  }

  [keywordInput, yearSelect, regionSelect, categorySelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });

  applyFilters();
}

function initQueryParams() {
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q");
  var year = params.get("year");
  var keywordInput = document.querySelector("[data-filter-keyword]");
  var yearSelect = document.querySelector("[data-filter-year]");

  if (query && keywordInput) {
    keywordInput.value = query;
    keywordInput.dispatchEvent(new Event("input", { bubbles: true }));
  }

  if (year && yearSelect) {
    yearSelect.value = year;
    yearSelect.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function initHlsPlayer() {
  var video = document.querySelector("[data-hls-player]");
  var trigger = document.querySelector("[data-play-trigger]");

  if (!video || !trigger) {
    return;
  }

  var source = video.getAttribute("data-source");
  var hlsInstance = null;

  function loadAndPlay() {
    if (!source) {
      return;
    }

    trigger.classList.add("is-hidden");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.src) {
        video.src = source;
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      }

      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = source;
    video.play().catch(function () {});
  }

  trigger.addEventListener("click", loadAndPlay);
  video.addEventListener("play", function () {
    trigger.classList.add("is-hidden");
  });
}
