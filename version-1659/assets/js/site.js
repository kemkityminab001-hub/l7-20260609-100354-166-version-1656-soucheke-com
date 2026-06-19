(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuToggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (menuToggle && mobileNav) {
            menuToggle.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var current = 0;

        function activateSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                activateSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                activateSlide(current + 1);
            }, 5000);
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".js-search-input"));
        var typeFilter = document.querySelector(".js-type-filter");
        var regionFilter = document.querySelector(".js-region-filter");
        var yearFilter = document.querySelector(".js-year-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".js-movie-card"));
        var countNode = document.querySelector(".js-result-count");

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilters() {
            if (!cards.length) {
                return;
            }

            var query = normalize(searchInputs.map(function (input) {
                return input.value;
            }).join(" "));
            var typeValue = typeFilter ? normalize(typeFilter.value) : "";
            var regionValue = regionFilter ? normalize(regionFilter.value) : "";
            var yearValue = yearFilter ? normalize(yearFilter.value) : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var type = normalize(card.getAttribute("data-type"));
                var region = normalize(card.getAttribute("data-region"));
                var year = normalize(card.getAttribute("data-year"));
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }
                if (typeValue && type.indexOf(typeValue) === -1) {
                    matched = false;
                }
                if (regionValue && region.indexOf(regionValue) === -1) {
                    matched = false;
                }
                if (yearValue && year !== yearValue) {
                    matched = false;
                }

                card.classList.toggle("hidden-card", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = "已显示 " + visible + " 部影片";
            }
        }

        searchInputs.forEach(function (input) {
            input.addEventListener("input", applyFilters);
        });
        [typeFilter, regionFilter, yearFilter].forEach(function (select) {
            if (select) {
                select.addEventListener("change", applyFilters);
            }
        });
        applyFilters();
    });
})();
