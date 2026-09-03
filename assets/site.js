/* Four small jobs: the theme toggle, the language toggle, letting the
   marginal figures wait until they are on screen before they draw, and marking
   which section the side nav is currently pointing at.

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

  /* Side nav: mark the section the reader is currently in.

     The section ids sit on the <h2> headings themselves, not on wrapper
     elements, so an IntersectionObserver is the wrong tool: a heading is a
     few pixels tall and crosses any observation band almost instantly, which
     leaves the band empty most of the time and the mark stuck on whichever
     heading crossed last. Loading straight at a #fragment made it stick on an
     arbitrary one.

     So the active section is computed instead: the last heading whose top has
     passed a reading line a third of the way down the viewport. That is
     correct at any scroll position, including the first paint at a fragment.

     The section list is read out of the markup's own data-target attributes,
     so adding or removing a section is a change to one file, not two. With no
     script at all the dots are still working anchor links with readable
     labels; they just never say where you are. */
  var navLinks = document.querySelectorAll(".side-nav a[data-target]");
  if (navLinks.length) {
    var headings = [];
    for (var n = 0; n < navLinks.length; n++) {
      var section = document.getElementById(navLinks[n].getAttribute("data-target"));
      if (section) headings.push(section);
    }

    function mark(id) {
      for (var k = 0; k < navLinks.length; k++) {
        var on = navLinks[k].getAttribute("data-target") === id;
        navLinks[k].classList.toggle("is-active", on);
        if (on) navLinks[k].setAttribute("aria-current", "true");
        else navLinks[k].removeAttribute("aria-current");
      }
    }

    function locate() {
      if (!headings.length) return;
      var line = window.innerHeight * 0.34;
      var current = headings[0];
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].getBoundingClientRect().top <= line) current = headings[i];
      }
      mark(current.id);
    }

    /* Computed synchronously on the event rather than deferred to a frame.
       locate() is seven rect reads and no writes, which is cheaper than the
       bookkeeping needed to defer it, and requestAnimationFrame does not tick
       reliably for a page that is not being painted: a background tab, or an
       offscreen frame, would leave the mark frozen wherever it last landed. */
    window.addEventListener("scroll", locate, { passive: true });
    window.addEventListener("resize", locate);
    window.addEventListener("hashchange", locate);
    window.addEventListener("load", locate);
    locate();
  }

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
