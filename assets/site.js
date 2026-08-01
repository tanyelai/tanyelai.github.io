/* Two small jobs: the theme toggle, and letting marginal figures animate when
   they are actually on screen. Everything works without this file — the theme
   follows the system and the figures render in their finished state. */
(function () {
  "use strict";

  var root = document.documentElement;
  var system = window.matchMedia("(prefers-color-scheme: dark)");
  var buttons = document.querySelectorAll(".theme-toggle");

  function current() {
    return root.getAttribute("data-theme") || (system.matches ? "dark" : "light");
  }

  function relabel() {
    var next = current() === "dark" ? "light" : "dark";
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-label", "Switch to the " + next + " theme");
    }
  }

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        /* private mode: the choice just won't outlive the tab */
      }
      relabel();
    });
  }

  // The system can change under us (sunset, or the OS schedule).
  if (system.addEventListener) {
    system.addEventListener("change", relabel);
  } else if (system.addListener) {
    system.addListener(relabel);
  }

  relabel();

  var figures = document.querySelectorAll(".patch");
  if (figures.length && "IntersectionObserver" in window) {
    var seen = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          seen.unobserve(entry.target);
        });
      },
      { threshold: 0.45 }
    );
    for (var j = 0; j < figures.length; j++) seen.observe(figures[j]);
  }
})();
