/* Four small jobs: the theme toggle, the language toggle, the research map's
   hover preview, and the publication filters.

   Everything degrades: with no script the site is light, the notes are in
   English, every map dot is still a link to its paper, and the publication
   list shows everything. */
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

  /* The map's areas are drawn here from the rendered boxes. Each area is a
     soft field around its own topics, the topics it shares and its own
     papers; every other area's topics and papers push it back. The outline
     is where that field crosses a level, so it bulges around each cluster,
     reaches the shared topics, and bends away from anything not its own: no
     topic or paper of another area shapes it or falls inside it. */
  function drawRegions(canvas) {
    var svg = canvas.querySelector("svg");
    var vb = svg.viewBox.baseVal, W = vb.width, H = vb.height;
    var c = canvas.getBoundingClientRect(), k = W / c.width;
    var ns = "http://www.w3.org/2000/svg";
    var old = svg.querySelectorAll(".ls-region");
    for (var o = 0; o < old.length; o++) svg.removeChild(old[o]);

    function rect(el) {
      var r = el.getBoundingClientRect();
      return [(r.left - c.left) * k, (r.top - c.top) * k, (r.right - c.left) * k, (r.bottom - c.top) * k];
    }
    var items = [];
    var tops = canvas.querySelectorAll(".ls-topic"), paps = canvas.querySelectorAll(".ls-paper");
    for (var t = 0; t < tops.length; t++) {
      var shared = tops[t].getAttribute("data-regions");
      items.push({ b: rect(tops[t]), areas: shared ? shared.split(" ") : [tops[t].getAttribute("data-home")], home: tops[t].getAttribute("data-home") });
    }
    for (var q = 0; q < paps.length; q++) items.push({ b: rect(paps[q]), areas: [paps[q].getAttribute("data-area")] });

    var G = 4, nx = Math.ceil(W / G) + 1, ny = Math.ceil(H / G) + 1;
    var SIG = 44, SIGF = 14, PUSH = 1.4, T = 0.55;
    function dist(b, x, y) {
      var dx = Math.max(b[0] - x, 0, x - b[2]), dy = Math.max(b[1] - y, 0, y - b[3]);
      return Math.sqrt(dx * dx + dy * dy);
    }
    function area(l) { var a = 0; for (var i = 0; i < l.length; i++) { var p = l[i], r = l[(i + 1) % l.length]; a += p[0] * r[1] - r[0] * p[1]; } return a / 2; }

    var areaEls = canvas.querySelectorAll(".ls-area");
    for (var ai = areaEls.length - 1; ai >= 0; ai--) {
      var rid = areaEls[ai].getAttribute("data-region");
      var mine = [], other = [], lo = 1e9, hi = -1e9;
      for (var i = 0; i < items.length; i++) {
        if (items[i].areas.indexOf(rid) >= 0) {
          mine.push(items[i].b);
          if (items[i].home === rid) { lo = Math.min(lo, items[i].b[0]); hi = Math.max(hi, items[i].b[2]); }
        } else other.push(items[i].b);
      }
      var f = new Float32Array(nx * ny);
      for (var gy = 0; gy < ny; gy++) for (var gx = 0; gx < nx; gx++) {
        var x = gx * G, y = gy * G, v = 0, d;
        if (gx > 0 && gy > 0 && gx < nx - 1 && gy < ny - 1) {
          for (var m = 0; m < mine.length; m++) { d = dist(mine[m], x, y) / SIG; if (d < 3) v += Math.exp(-d * d); }
          for (var n = 0; n < other.length; n++) { d = dist(other[n], x, y) / SIGF; if (d < 3) v -= PUSH * Math.exp(-d * d); }
        } else v = -1;
        f[gy * nx + gx] = v;
      }
      /* outer lines only: a hole would be a gap in the area, not a shape */
      var loops = contour(f, nx, ny, G, T).filter(function (l) { return l.length > 10; });
      var outer = loops.length ? loops.reduce(function (s, l) { return Math.abs(area(l)) > Math.abs(area(s)) ? l : s; }) : null;
      var sign = outer ? Math.sign(area(outer)) : 1, d2 = "", pts = [];
      for (var l = 0; l < loops.length; l++) {
        if (Math.sign(area(loops[l])) !== sign) continue;
        var p = smooth(loops[l]);
        pts = pts.concat(p);
        d2 += "M" + p[0][0].toFixed(1) + " " + p[0][1].toFixed(1);
        for (var e = 1; e < p.length; e++) d2 += "L" + p[e][0].toFixed(1) + " " + p[e][1].toFixed(1);
        d2 += "Z";
      }
      var path = document.createElementNS(ns, "path");
      path.setAttribute("class", "ls-region ls-region--" + rid);
      path.setAttribute("d", d2);
      svg.insertBefore(path, svg.firstChild);

      /* the area's name sits just outside its outline: above the middle of
         its own topics, or, for a small area (data-anchor="right"), beside it */
      var el = areaEls[ai], anchor = el.getAttribute("data-anchor"), nxp, nyp;
      if (anchor === "right") {
        var maxX = -1e9, cyy = 0;
        for (var j = 0; j < pts.length; j++) if (pts[j][0] > maxX) { maxX = pts[j][0]; cyy = pts[j][1]; }
        nxp = maxX + 10; nyp = cyy;
      } else {
        var mid = (lo + hi) / 2, edge = 1e9;
        for (var j2 = 0; j2 < pts.length; j2++) if (Math.abs(pts[j2][0] - mid) <= 40) edge = Math.min(edge, pts[j2][1]);
        nxp = mid; nyp = Math.max(edge - 12, 8);
      }
      el.style.left = (nxp / W * 100) + "%";
      el.style.top = (nyp / H * 100) + "%";
      el.classList.toggle("ls-area--start", anchor === "right");
      el.classList.add("is-placed");
    }
  }

  /* Marching squares: the closed lines where the field f crosses level T. */
  function contour(f, nx, ny, G, T) {
    function val(x, y) { return f[y * nx + x]; }
    function cut(x0, y0, x1, y1) {
      var a = val(x0, y0), b = val(x1, y1), s = (T - a) / (b - a);
      return [(x0 + (x1 - x0) * s) * G, (y0 + (y1 - y0) * s) * G];
    }
    var next = {}, at = {};
    function key(x0, y0, x1, y1) { return x0 + "," + y0 + "," + x1 + "," + y1; }
    function seg(e1, e2) { next[e1.k] = e2.k; at[e1.k] = e1.p; at[e2.k] = e2.p; }
    for (var y = 0; y < ny - 1; y++) for (var x = 0; x < nx - 1; x++) {
      var tl = val(x, y) > T, tr = val(x + 1, y) > T, br = val(x + 1, y + 1) > T, bl = val(x, y + 1) > T;
      var idx = (tl ? 8 : 0) | (tr ? 4 : 0) | (br ? 2 : 0) | (bl ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      var top = { k: key(x, y, x + 1, y), p: cut(x, y, x + 1, y) }, right = { k: key(x + 1, y, x + 1, y + 1), p: cut(x + 1, y, x + 1, y + 1) },
          bottom = { k: key(x, y + 1, x + 1, y + 1), p: cut(x, y + 1, x + 1, y + 1) }, left = { k: key(x, y, x, y + 1), p: cut(x, y, x, y + 1) };
      switch (idx) {
        case 1: seg(left, bottom); break;       case 2: seg(bottom, right); break;
        case 3: seg(left, right); break;        case 4: seg(right, top); break;
        case 5: seg(left, top); seg(right, bottom); break;
        case 6: seg(bottom, top); break;        case 7: seg(left, top); break;
        case 8: seg(top, left); break;          case 9: seg(top, bottom); break;
        case 10: seg(top, right); seg(bottom, left); break;
        case 11: seg(top, right); break;        case 12: seg(right, left); break;
        case 13: seg(right, bottom); break;     case 14: seg(bottom, left); break;
      }
    }
    var loops = [], seen = {};
    for (var s in next) {
      if (seen[s]) continue;
      var loop = [], cur = s;
      while (cur && !seen[cur]) { seen[cur] = 1; loop.push(at[cur]); cur = next[cur]; }
      loops.push(loop);
    }
    return loops;
  }

  /* Chaikin's corner cutting: a soft line through the contour. */
  function smooth(p) {
    for (var r = 0; r < 3; r++) {
      var q = [];
      for (var i = 0; i < p.length; i++) {
        var a = p[i], b = p[(i + 1) % p.length];
        q.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
      }
      p = q;
    }
    return p;
  }

  /* The map's lines are drawn here from each paper's position to the topics
     in its data-topics, so adding a paper is one element in research.html
     and nothing else. */
  function drawEdges(canvas) {
    var svg = canvas.querySelector("svg");
    var box = svg.viewBox.baseVal;
    var byId = {};
    var all = canvas.querySelectorAll(".ls-node");
    for (var i = 0; i < all.length; i++) byId[all[i].getAttribute("data-id")] = all[i];

    function at(el) {
      return [parseFloat(el.style.left) / 100 * box.width, parseFloat(el.style.top) / 100 * box.height];
    }

    /* each line bows a little, the way data-bends says: chosen at build
       time so that no line passes under a topic it does not join */
    function line(a, b, bend, attrs, cls) {
      var p = at(a), q = at(b);
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", cls);
      var dx = q[0] - p[0], dy = q[1] - p[1];
      var cx = (p[0] + q[0]) / 2 - dy * bend, cy = (p[1] + q[1]) / 2 + dx * bend;
      path.setAttribute("d", "M" + p[0] + " " + p[1] + " Q" + cx + " " + cy + " " + q[0] + " " + q[1]);
      for (var k in attrs) path.setAttribute(k, attrs[k]);
      svg.appendChild(path);
    }

    for (var j = 0; j < all.length; j++) {
      var n = all[j];
      var topics = (n.getAttribute("data-topics") || "").split(" ");
      var bends = (n.getAttribute("data-bends") || "").split(" ");
      for (var t = 0; t < topics.length; t++) {
        var bend = parseFloat(bends[t]);
        if (byId[topics[t]]) line(n, byId[topics[t]], isNaN(bend) ? 0.1 : bend, { "data-p": n.getAttribute("data-id"), "data-t": topics[t] }, "ls-edge");
      }
    }
  }

  /* Research map. Pointing at a paper lights its lines and topics and
     shows a preview card beside it; pointing at a topic lights its papers.
     Focus does the same as hover, so the map works from the keyboard. */
  var canvas = document.querySelector(".ls-canvas");
  if (canvas) {
    var nodes = canvas.querySelectorAll(".ls-node");
    drawRegions(canvas);
    drawEdges(canvas);
    var resizing;
    window.addEventListener("resize", function () {
      clearTimeout(resizing);
      resizing = setTimeout(function () { drawRegions(canvas); }, 150);
    });
    var edges = canvas.querySelectorAll(".ls-edge");
    var card = canvas.querySelector(".ls-card");
    var cardTitle = card.querySelector(".ls-card-title");
    var cardMeta = card.querySelector(".ls-card-meta");

    function each(list, fn) {
      for (var i = 0; i < list.length; i++) fn(list[i]);
    }

    function clear() {
      canvas.classList.remove("is-focused");
      each(nodes, function (n) { n.classList.remove("is-lit"); });
      each(edges, function (e) { e.classList.remove("is-lit"); });
      card.classList.remove("is-shown");
    }

    function showCard(paper) {
      cardTitle.textContent = paper.getAttribute("data-title");
      cardMeta.textContent = paper.getAttribute("data-meta");
      var x = paper.offsetLeft, y = paper.offsetTop;
      var w = card.offsetWidth, h = card.offsetHeight;
      var left = x + 18, top = y + 16;
      if (left + w > canvas.clientWidth) left = x - w - 18;
      if (top + h > canvas.clientHeight) top = y - h - 16;
      card.style.left = Math.max(0, left) + "px";
      card.style.top = Math.max(0, top) + "px";
      card.classList.add("is-shown");
    }

    function lightPaper(paper) {
      var id = paper.getAttribute("data-id");
      var topics = (paper.getAttribute("data-topics") || "").split(" ");
      canvas.classList.add("is-focused");
      each(nodes, function (n) {
        n.classList.toggle("is-lit", n === paper || topics.indexOf(n.getAttribute("data-id")) >= 0);
      });
      each(edges, function (e) { e.classList.toggle("is-lit", e.getAttribute("data-p") === id); });
      showCard(paper);
    }

    function lightTopic(topic) {
      var id = topic.getAttribute("data-id");
      canvas.classList.add("is-focused");
      each(nodes, function (n) {
        var ts = (n.getAttribute("data-topics") || "").split(" ");
        n.classList.toggle("is-lit", n === topic || ts.indexOf(id) >= 0);
      });
      each(edges, function (e) {
        var ts = (e.getAttribute("data-t") || "").split(" ");
        e.classList.toggle("is-lit", ts.indexOf(id) >= 0);
      });
    }

    each(nodes, function (n) {
      var isPaper = n.classList.contains("ls-paper");
      var on = function () { (isPaper ? lightPaper : lightTopic)(n); };
      n.addEventListener("mouseenter", on);
      n.addEventListener("mouseleave", clear);
      if (isPaper) {
        n.addEventListener("focus", on);
        n.addEventListener("blur", clear);
      }
    });
  }

  /* Publication filters: show one kind of paper, and hide the years left
     with nothing in them. */
  var filters = document.querySelectorAll(".filter");
  if (filters.length) {
    var pubs = document.querySelectorAll(".pub");
    var years = document.querySelectorAll(".year");

    function show(type) {
      for (var i = 0; i < filters.length; i++) {
        filters[i].setAttribute("aria-pressed", filters[i].getAttribute("data-type") === type ? "true" : "false");
      }
      for (var j = 0; j < pubs.length; j++) {
        pubs[j].hidden = type !== "all" && pubs[j].getAttribute("data-type") !== type;
      }
      for (var k = 0; k < years.length; k++) {
        var list = document.querySelector('.pubs[data-year="' + years[k].getAttribute("data-year") + '"]');
        years[k].hidden = !list.querySelector(".pub:not([hidden])");
      }
    }

    for (var f = 0; f < filters.length; f++) {
      filters[f].addEventListener("click", function () { show(this.getAttribute("data-type")); });
    }
  }
})();
