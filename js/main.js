// Голямата Панделка — скрол хореография
// Всичко е функция на позицията на скрола, затова ефектите
// се движат напред при скрол надолу и назад при скрол нагоре.
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Навигацията става плътна след началото
  var nav = document.getElementById("nav");
  function onScrollNav() {
    nav.classList.toggle("is-solid", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  // Мобилното меню
  var burger = document.getElementById("burger");
  var mobmenu = document.getElementById("mobmenu");
  if (burger && mobmenu) {
    burger.addEventListener("click", function () {
      var open = !mobmenu.classList.contains("open");
      mobmenu.classList.toggle("open", open);
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open);
    });
    mobmenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobmenu.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  // При отваряне с котва в адреса (напр. от Галерията към Контакти):
  // мигновен скок на място още преди първото изчертаване,
  // без визуално пътуване през сайта.
  if (location.hash) {
    var hashTarget = document.querySelector(location.hash);
    if (hashTarget) {
      hashTarget.scrollIntoView({ behavior: "instant" });
      hashTarget.querySelectorAll(".reveal").forEach(function (r) { r.classList.add("in"); });
    }
  }

  // Котви: близките скролват плавно, далечните скачат директно,
  // за да не се превърта целият сайт с всичките анимации.
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      var far = Math.abs(target.getBoundingClientRect().top) > window.innerHeight * 2.5;
      target.scrollIntoView({ behavior: far ? "instant" : "smooth" });
      // при мигновен скок секцията да се покаже веднага, без да чака появяването
      if (far) {
        target.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
      }
      history.pushState(null, "", a.getAttribute("href"));
    });
  });

  // При зареждане с котва в адреса: намести се пак, след като
  // снимките са заредени и са изместили страницата.
  window.addEventListener("load", function () {
    if (location.hash) {
      var el = document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({ behavior: "instant" });
        el.querySelectorAll(".reveal").forEach(function (r) { r.classList.add("in"); });
      }
    }
  });

  // Цветовете-панделки: натискане показва името и уголемява
  document.querySelectorAll(".dot").forEach(function (d) {
    d.addEventListener("click", function () {
      var was = d.classList.contains("active");
      d.parentElement.querySelectorAll(".dot.active").forEach(function (o) { o.classList.remove("active"); });
      if (!was) d.classList.add("active");
    });
  });

  // Лентата с изпълнени поръчки: безкраен кръгов скрол.
  // Снимките са утроени, стои се в средното копие, а при
  // доближаване на ръба скролът се премества с една обиколка,
  // което е невидимо, защото съдържанието е еднакво.
  var gscroll = document.getElementById("gscroll");
  if (gscroll) {
    var originals = Array.prototype.slice.call(gscroll.children);
    for (var copy = 0; copy < 2; copy++) {
      originals.forEach(function (k) { gscroll.appendChild(k.cloneNode(true)); });
    }
    // Опаковането става само в покой, никога по време на движение,
    // иначе се бие с летящата анимация на скрола и блокира.
    var setW = 0;
    var wrapTimer = null;
    function gwrapNow() {
      if (setW <= 0) return;
      var sl = gscroll.scrollLeft;
      if (sl < setW * 0.5) gscroll.scrollLeft = sl + setW;
      else if (sl > setW * 1.5) gscroll.scrollLeft = sl - setW;
    }
    function gwrapSoon() {
      clearTimeout(wrapTimer);
      wrapTimer = setTimeout(gwrapNow, 120);
    }
    function gcenter() {
      setW = gscroll.scrollWidth / 3;
      gwrapNow();
      if (setW > 0 && gscroll.scrollLeft < 4) gscroll.scrollLeft = setW;
    }
    gcenter();
    requestAnimationFrame(gcenter);
    window.addEventListener("load", gcenter);
    window.addEventListener("resize", gcenter);
    gscroll.addEventListener("scroll", gwrapSoon, { passive: true });
    if ("onscrollend" in gscroll) gscroll.addEventListener("scrollend", gwrapNow);
    gscroll.addEventListener("touchstart", gwrapNow, { passive: true });

    var gprev = document.getElementById("gprev");
    var gnext = document.getElementById("gnext");
    if (gprev) gprev.addEventListener("click", function () {
      gwrapNow();
      gscroll.scrollBy({ left: -gscroll.clientWidth * 0.8, behavior: "smooth" });
    });
    if (gnext) gnext.addEventListener("click", function () {
      gwrapNow();
      gscroll.scrollBy({ left: gscroll.clientWidth * 0.8, behavior: "smooth" });
    });
  }

  // Появяване на елементите: класът се маха, когато излязат от екрана,
  // така анимацията се повтаря и при скрол нагоре.
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        e.target.classList.toggle("in", e.isIntersecting);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  if (reduced) return;

  var hero = document.querySelector(".hero");
  var heroBg = document.querySelector(".hero__bg");
  var heroWord = document.querySelector(".hero__word");
  var heroMotto = document.querySelector(".hero__motto");
  var heroFgWrap = document.querySelector(".hero__fgwrap");
  var heroFg = document.querySelector(".hero__fg");
  var heroHint = document.querySelector(".hero__scrollhint");
  var flybow = document.getElementById("flybow");
  var flybowSpin = flybow ? flybow.querySelector(".flybow__spin") : null;
  var fillword = document.getElementById("fillword");
  var fillword2 = document.getElementById("fillword2");
  var fillhead = document.getElementById("fillhead");
  var storyfill = document.getElementById("storyfill");
  var flightzone = document.getElementById("flightzone");

  // Лентите в летателната зона се изрисуват с напредването на скрола
  var ribbons = [];
  document.querySelectorAll(".ribbonpath").forEach(function (p) {
    var len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
    ribbons.push({ el: p, len: len });
  });
  var parallaxEls = document.querySelectorAll(".parallax");

  // Къде е панделката върху изрязаната кола (дялове от рамката на колата)
  var BOW = { cx: 0.5123, cy: 0.4797, w: 0.6012 };
  var BOW_NATURAL_W = 300, BOW_NATURAL_H = 300 * 680 / 710;

  // Позиция на мишката, изглажда се плавно към целта
  var mx = 0, my = 0, tx = 0, ty = 0;
  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("mousemove", function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;   // -1 .. 1
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function smooth(v) { v = clamp01(v); return v * v * (3 - 2 * v); }
  function mix(a, b, t) { return a + (b - a) * t; }

  // Заглавието на историята се разбива на букви за вълната
  var storyLetters = [];
  if (storyfill) {
    storyfill.querySelectorAll("span").forEach(function (line) {
      var text = line.textContent;
      line.textContent = "";
      for (var i = 0; i < text.length; i++) {
        if (text[i] === " ") {
          line.appendChild(document.createTextNode(" "));
        } else {
          var l = document.createElement("i");
          l.className = "ltr";
          l.textContent = text[i];
          line.appendChild(l);
          storyLetters.push(l);
        }
      }
    });
  }

  function frame() {
    var y = window.scrollY;
    var vh = window.innerHeight;
    var vw = window.innerWidth;

    mx += (tx - mx) * 0.06;
    my += (ty - my) * 0.06;

    if (hero) {
      // Прогрес на сцената: 0 в началото, 1 когато колата се е отдалечила
      var total = hero.offsetHeight - vh;
      var p = clamp01(total > 0 ? y / total : 1);

      if (y < hero.offsetHeight + vh) {
        // Фон: лек отдалечаващ зуум, обратен на мишката
        heroBg.style.transform =
          "translate3d(" + (mx * -8) + "px," + (my * -6) + "px,0) scale(" + (1.04 - p * 0.04) + ")";

        // Брандов надпис: издига се леко и се движи срещу мишката
        // (на телефон почти не мърда, за да не влиза под менюто)
        heroWord.style.transform =
          "translate3d(" + (mx * -14) + "px," + (my * -10 - p * vh * (vw < 700 ? 0.008 : 0.04)) + "px,0)";

        // Колата: отдалечава се в първата половина на сцената,
        // втората половина е задържане, за да се прочете мотото.
        // На телефон, където няма място встрани, колата избледнява
        // до призрачен фон, за да са четими текстовете върху нея.
        var pc = clamp01(p / 0.5);
        var o = clamp01((p - 0.28) / 0.18);
        var mob = vw < 700;
        heroFgWrap.style.transform =
          "translateY(" + (pc * (mob ? 13 : 9)) + "%) scale(" + (0.97 - pc * (mob ? 0.64 : 0.57)) + ")";
        heroFg.style.transform = "translate3d(" + (mx * 10) + "px," + (my * 7) + "px,0)";
        heroFg.style.filter = "brightness(" + (1 - pc * 0.4) + ")";
        heroFg.style.opacity = mob ? (1 - o * 0.74).toFixed(3) : "1";
        heroMotto.style.opacity = o;
        heroMotto.style.transform = "translate3d(0," + ((1 - o) * 28) + "px,0)";
        heroMotto.style.pointerEvents = o > 0.5 ? "auto" : "none";

        heroHint.style.opacity = clamp01(1 - p * 2.5);
      }

      // Летящата панделка: стои на капака почти до края на сцената,
      // после пътува смалена и полупрозрачна по средната линия
      // и се материализира при удара в буквите.
      if (flybow && fillword) {
        var fgRect = heroFgWrap.getBoundingClientRect();

        // Котва А: върху капака на колата (следва мишката като колата)
        var wA = fgRect.width * BOW.w;
        var xA = fgRect.left + fgRect.width * BOW.cx + mx * 10;
        var yA = fgRect.top + fgRect.height * BOW.cy + my * 7;

        // Летящата панделка наближава ли вече буквите
        var rA = fillword.getBoundingClientRect();
        var arrive = clamp01((vh * 0.9 - rA.top) / (vh * 0.4));

        // Котва Б: малка, слиза право надолу по средата, през коридора
        // между двете колони на мотото и през процепа в лентата.
        var wB = Math.min(140, vw * 0.2);
        var xB = vw / 2 + mx * 6;
        var yB = vh * 0.62 + my * 4;

        // Отлепя се чак в задържането, когато мотото вече се вижда
        var t = smooth((p - 0.75) / 0.25);
        var bw = mix(wA, wB, t);
        var bx = mix(xA, xB, t);
        var by = mix(yA, yB, t);

        // Цветната верига: червеното влиза в "Голямата" и в "Панделка",
        // после "Панделка" прелива към бяло, от нея излита бяла панделка,
        // която се влива в "Подаръкът е колата. Моментът е панделката.",
        // а червеното продължава чак до заглавието на моделите.
        var r1 = fillword.getBoundingClientRect();
        var fill1 = clamp01((vh * 0.62 - r1.top + 50) / (r1.height * 1.6));
        var r2 = null, fill2 = 0, fill3 = 0, fillS = 0;
        if (fillword2) {
          r2 = fillword2.getBoundingClientRect();
          fill2 = clamp01((vh * 0.62 - r2.top + 50) / (r2.height * 1.6));
        }
        if (fillhead) {
          var r3 = fillhead.getBoundingClientRect();
          fill3 = clamp01((vh * 0.72 - r3.top + 40) / (r3.height * 2.2));
        }
        var rS = null;
        if (storyfill) {
          rS = storyfill.getBoundingClientRect();
          fillS = clamp01((vh * 0.62 - rS.top + 40) / (rS.height * 1.2));
        }
        fillword.style.setProperty("--b", (fill1 * 100).toFixed(1) + "%");
        if (fillword2) {
          fillword2.style.setProperty("--b", (fill2 * 100).toFixed(1) + "%");
        }
        if (fillhead) {
          fillhead.style.setProperty("--b", (fill3 * 100).toFixed(1) + "%");
        }
        // Буквите изплуват една по една с вълната
        var n = storyLetters.length;
        for (var li = 0; li < n; li++) {
          var lp = smooth(clamp01(fillS * (n + 6) - li));
          var e = storyLetters[li];
          e.style.opacity = (0.12 + 0.88 * lp).toFixed(3);
          e.style.transform = "translateY(" + ((1 - lp) * 30).toFixed(1) + "%)";
          e.style.filter = lp >= 1 ? "none" : "blur(" + ((1 - lp) * 5).toFixed(2) + "px)";
        }

        // Сблъсъкът: панделката се всмуква в буквите
        var absorb = smooth(fill1 / 0.3);
        by = mix(by, r1.top + r1.height / 2, absorb);
        bx = mix(bx, vw / 2, absorb);
        bw = bw * (1 - 0.55 * absorb);

        // По време на транзита е призрачна, при удара се материализира
        var ghost = 1 - 0.45 * t * (1 - arrive);

        // 3D спирала на място: въртенето е вързано за изминатия път
        // по страницата, от точката на отлепяне до точката на удара,
        // затова е непрекъснато по цялото трасе. Едно пълно завъртане.
        var yDet = (hero.offsetHeight - vh) * 0.75;
        var yImp = (r1.top + y) - vh * 0.62;
        var journey = clamp01(yImp > yDet ? (y - yDet) / (yImp - yDet) : 1);
        var ry = journey * 360;
        var s = bw / BOW_NATURAL_W;
        flybow.style.visibility = "visible";
        flybow.style.opacity = (ghost * (1 - absorb)).toFixed(3);
        flybow.style.setProperty("--side", (Math.sin(Math.PI * journey) * 0.85).toFixed(2));
        flybow.style.transform =
          "translate3d(" + (bx - BOW_NATURAL_W / 2) + "px," + (by - BOW_NATURAL_H / 2) + "px,0) scale(" + s + ")";
        flybowSpin.style.transform = "rotateY(" + ry.toFixed(1) + "deg)";
      }
    }

    // Лентите се развиват надолу със скрола и се навиват обратно нагоре
    if (flightzone && ribbons.length) {
      var fzRect = flightzone.getBoundingClientRect();
      var drawP = clamp01((vh * 0.9 - fzRect.top) / (fzRect.height + vh * 0.45));
      ribbons.forEach(function (r) {
        r.el.style.strokeDashoffset = r.len * (1 - drawP);
      });
    }

    // Паралакс елементи (снимки и текстове), също вързани за скрола
    parallaxEls.forEach(function (el) {
      var child = el.firstElementChild;
      if (!child) return;
      var rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      var speed = parseFloat(el.dataset.speed || "0.1");
      var offset = (rect.top + rect.height / 2 - vh / 2) * speed;
      child.style.transform = "translateY(" + (-offset) + "px)";
    });

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  // Лайтбокс за страницата Галерия
  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    document.querySelectorAll(".gallery__grid figure img").forEach(function (img) {
      img.parentElement.addEventListener("click", function () {
        lbImg.src = img.src;
        lightbox.classList.add("open");
      });
    });
    lightbox.addEventListener("click", function () { lightbox.classList.remove("open"); });
  }
})();
