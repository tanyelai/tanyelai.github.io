/* Three small jobs: the theme toggle, the language toggle, and letting the
   marginal figures wait until they are on screen before they draw.

   Everything degrades: with no script the site is light, the notes are in
   English, and every figure renders in its finished state. The counterfactual
   switch in the masthead is a real checkbox and needs none of this. */
(function () {
  "use strict";

  var root = document.documentElement;

  function remember(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      /* private mode: the choice just won't outlive the tab */
    }
  }

  function wire(selector, attribute, values, describe) {
    var buttons = document.querySelectorAll(selector);
    if (!buttons.length) return;

    function next() {
      return root.getAttribute(attribute) === values[1] ? values[0] : values[1];
    }

    function relabel() {
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute("aria-label", describe(next()));
      }
    }

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        var value = next();
        root.setAttribute(attribute, value);
        remember(attribute.replace("data-", ""), value);
        relabel();
      });
    }

    relabel();
  }

  wire(".theme-toggle", "data-theme", ["light", "dark"], function (to) {
    return "Switch to the " + to + " theme";
  });

  wire(".lang-toggle", "data-lang", ["en", "tr"], function (to) {
    return to === "tr" ? "Yazıları Türkçe oku" : "Read the notes in English";
  });

  var figures = document.querySelectorAll(".fig");
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
