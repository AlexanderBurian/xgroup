/*!
 * kratas.cz – Recommendations cart popup (Apollo / Shoptet)
 * Po přidání zboží do košíku zobrazí "Zboží přidáno do košíku" panel
 * s cross-sell nabídkou: nahoře vždy 2 vaporizéry na sušinu (MARS + URANUS),
 * pod nimi náhodně podobné produkty. 1:1 styl Apollo, PC i mobil.
 *
 * Nasazení: <script src="https://cdn.jsdelivr.net/gh/AlexanderBurian/xgroup@<commit>/kratas-recommendations.js" defer></script>
 */
(function () {
  "use strict";

  if (window.__xgKratasReco) return;
  window.__xgKratasReco = true;

  /* Zachováno z předchozí verze: konfigurace Apollo hero/slideru.
     (Bez těchto globálů se rozbije hero banner na homepage.) */
  window.carouselClassicLayout = true;
  window.carouselFullWidth = false;
  window.carouselTextAlign = "left";
  window.carouselOverlay = false;
  window.carouselArrowsOnMobile = false;
  window.productsSlider = true;
  window.productsSliderOnMobile = true;
  window.homepageRatings = false;

  /* Zachováno z předchozí verze: lákavý titulek karty při odchodu na jiný tab */
  (function () {
    if (window.__xgKratasVisibilityTitle) return;
    window.__xgKratasVisibilityTitle = true;
    var orig = document.title;
    var away = "👀 Nezapomněli jste na nás? - Kratas.cz";
    document.addEventListener("visibilitychange", function () {
      document.title = document.hidden ? away : orig;
    });
  })();

  /* Promo pruh úplně nahoře: sleva NAVSE10 + odpočet do neděle 24:00
     (Europe/Prague). Po vypršení se sám přepne na další neděli. */
  (function () {
    if (window.__xgKratasPromo) return;
    window.__xgKratasPromo = true;

    /* Zapnutí/vypnutí zeleného promo pruhu (akce NAVSE10). false = pruh se
       nezobrazí; zvýraznění a přesun VELKOOBCHODU v menu běží dál. */
    var PROMO_ON = false;

    var TZ = "Europe/Prague";
    var css = ''
      /* zelená = barva loga KRATAS (#67b015) */
      + '#xg-promo{background:#67b015;color:#fff;font-family:Roboto,"Segoe UI",Arial,sans-serif;'
      /* vždy jeden řádek: nowrap + JS fit() zmenší písmo, když se nevejde (rozměry jsou v em) */
      + 'font-size:16px;line-height:1.2;font-weight:700;text-align:center;padding:12px 14px;min-height:52px;'
      + 'display:flex;flex-wrap:nowrap;white-space:nowrap;align-items:center;justify-content:center;column-gap:1.25em;'
      + 'width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;text-shadow:0 0 2px rgba(0,0,0,.3);position:relative;z-index:1}'
      /* mobil: pruh je jen úplně nahoře na stránce (při scrollu odjede), fixní
         hlavička Apolla je pod ním posunutá o jeho ještě viditelnou část (--xg-off) */
      + '#xg-promo.xg-abs{position:absolute;top:0;left:0;right:0;z-index:8;margin:0}'
      + 'html.xg-mobile .top-navigation-bar,html.xg-mobile #header,html.xg-mobile #navigation{margin-top:var(--xg-off,0px)!important}'
      /* tlačítko MENU je při otevřeném menu fixed top:0 -> posunout pod pruh */
      + 'body.navigation-window-visible .toggle-window[data-target="navigation"]{margin-top:var(--xg-off,0px)}'
      /* přihlášení / košík na mobilu: fixed top:50px pod lištou -> taky posunout */
      + '.user-action .popup-widget{margin-top:var(--xg-off,0px)}'
      + '#xg-promo *{box-sizing:border-box}'
      + '#xg-promo .xg-pm{flex:0 0 auto}'
      + '#xg-promo .xg-pm strong{font-weight:800;letter-spacing:.04em}'
      /* odpočet: "KONČÍ ZA" + bílé štítky s tmavě zelenými čísly */
      /* štítky mají pevnou výšku a obsah centrovaný flexem -> stejné místo nahoře i dole */
      + '#xg-promo .xg-pc{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;gap:.375em}'
      + '#xg-promo .xg-pl{font-weight:800;letter-spacing:.03em;margin-right:.125em}'
      + '#xg-promo .xg-pc i{font-style:normal;display:inline-flex;align-items:center;justify-content:center;'
      + 'height:1.75em;min-width:2.5em;padding:0 .5em;line-height:1;background:#fff;color:#2f5a00;text-shadow:none;'
      + 'font-weight:800;font-variant-numeric:tabular-nums;border-radius:.375em;box-shadow:0 0 3px rgba(0,0,0,.16)}'
      + '#xg-promo .xg-pc i small{font-size:.78em;font-weight:700;margin-left:1px}'
      /* optické centrování: box textu = od vršku verzálek po účaří (bez prázdného místa
         nad/pod písmem), flex pak centruje samotná písmena a číslice */
      + '@supports (text-box:trim-both cap alphabetic){'
      + '#xg-promo .xg-pm,#xg-promo .xg-pl,#xg-promo .xg-pc i>span{text-box:trim-both cap alphabetic}}'
      + '@media(max-width:767px){#xg-promo{font-size:14px;padding:10px 8px;min-height:46px;column-gap:.6em}'
      + '#xg-promo .xg-pm strong,#xg-promo .xg-pl{letter-spacing:0}'
      + '#xg-promo .xg-pc{gap:.3em}#xg-promo .xg-pc i{min-width:0;padding:0 .4em;border-radius:.3em}}'
      /* VELKOOBCHOD v menu: plný zelený štítek (barva loga), bílý text */
      + '#navigation a[href$="/velkoobchod/"]>b{display:inline-block;background:#67b015;color:#fff;'
      + 'border-radius:8px;padding:10px 14px;line-height:1;font-weight:800;letter-spacing:.02em;text-shadow:none}'
      + '#navigation a[href$="/velkoobchod/"]:hover>b,#navigation a[href$="/velkoobchod/"]:focus>b{background:#5b9c12;color:#fff}'
      + '@supports (text-box:trim-both cap alphabetic){#navigation a[href$="/velkoobchod/"]>b{text-box:trim-both cap alphabetic;padding:11px 15px}}'
      /* PC: odkaz bez svislého paddingu -> štítek se vycentruje v 60px řádku menu */
      + 'html:not(.xg-mobile) #navigation .navigation-in>ul>li>a[href$="/velkoobchod/"]{padding-top:0;padding-bottom:0;padding-right:8px}'
      + 'html.xg-mobile #navigation .navigation-in>ul>li>a[href$="/velkoobchod/"]{padding-top:12px;padding-bottom:12px}';

    // aktuální "nástěnný" čas v Praze -> {y,mo,d,wd,h,mi,s}
    var fmt = null;
    try {
      fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: TZ, hourCycle: "h23", weekday: "short",
        year: "numeric", month: "numeric", day: "numeric",
        hour: "numeric", minute: "numeric", second: "numeric"
      });
    } catch (e) { fmt = null; }
    var WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    function wall(t) {
      var d = new Date(t);
      if (!fmt) {
        return { y: d.getFullYear(), mo: d.getMonth() + 1, d: d.getDate(), wd: d.getDay(),
                 h: d.getHours(), mi: d.getMinutes(), s: d.getSeconds() };
      }
      var p = {};
      fmt.formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
      return { y: +p.year, mo: +p.month, d: +p.day, wd: WD[p.weekday],
               h: +p.hour % 24, mi: +p.minute, s: +p.second };
    }
    // posun Prahy vůči UTC v čase t (ms)
    function offset(t) {
      var w = wall(t);
      return Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi, w.s) - Math.floor(t / 1000) * 1000;
    }
    // okamžik nejbližší neděle 24:00 (= pondělí 00:00) pražského času
    function nextDeadline(now) {
      var w = wall(now);
      var add = (7 - w.wd) % 7 + 1;                    // dní do pondělí 00:00
      var guess = Date.UTC(w.y, w.mo - 1, w.d + add, 0, 0, 0);
      return guess - offset(guess - offset(guess));    // 2. průchod kvůli letnímu času
    }

    var bar, cd, deadline = 0;
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var now = Date.now();
      if (!deadline || now >= deadline) deadline = nextDeadline(now);
      var s = Math.max(0, Math.floor((deadline - now) / 1000));
      var d = Math.floor(s / 86400); s -= d * 86400;
      var h = Math.floor(s / 3600); s -= h * 3600;
      var m = Math.floor(s / 60); s -= m * 60;
      function chip(v, u) { return '<i><span>' + v + '<small>' + u + '</small></span></i>'; }
      cd.innerHTML = '<span class="xg-pl">KONČÍ ZA</span>'
        + chip(d, "d") + chip(pad(h), "h") + chip(pad(m), "m") + chip(pad(s), "s");
    }

    /* Vše vždy na jednom řádku: když se obsah nevejde, zmenšuj písmo po 0,5 px
       (všechny rozměry uvnitř jsou v em, takže se zmenší úměrně). */
    function fit() {
      bar.style.removeProperty("font-size");
      var cs = getComputedStyle(bar);
      var avail = bar.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
      if (avail <= 0) return;                                   // skrytá karta apod.
      var pm = bar.querySelector(".xg-pm");
      var fs = parseFloat(cs.fontSize) || 16;
      function need() {
        return pm.getBoundingClientRect().width + cd.getBoundingClientRect().width
          + (parseFloat(getComputedStyle(bar).columnGap) || 0);
      }
      while (fs > 9 && need() > avail) {
        fs -= 0.5;
        bar.style.setProperty("font-size", fs + "px", "important");
      }
    }

    /* VELKOOBCHOD: na mobilu první položka menu, na PC zhruba uprostřed
       (za 3. kategorií). Přesouvá se jen při změně; na PC pak Shoptet
       přepočítá, co se schová do "VÍCE". */
    function placeWholesale(mobile) {
      var ul = document.querySelector("#navigation .navigation-in > ul.menu-level-1");
      if (!ul) return;
      var items = [].slice.call(ul.children), li = null;
      items.forEach(function (l) {
        var a = l.firstElementChild;
        if (a && a.tagName === "A" && /\/velkoobchod\/?$/.test(a.getAttribute("href") || "")) li = l;
      });
      if (!li) return;
      var others = items.filter(function (l) { return l !== li; });
      var target = mobile ? others[0] : (others[3] || null);
      if (li.nextElementSibling === target && (target || li === ul.lastElementChild)) return;
      ul.insertBefore(li, target);
      if (!mobile) {
        try { if (window.shoptet && shoptet.menu && shoptet.menu.splitMenu) shoptet.menu.splitMenu(); } catch (e) {}
      }
    }

    /* Na mobilu má Apollo horní lištu (.top-navigation-bar, top 0) i hlavičku
       (#header, #navigation, top 50px) position:fixed a obsah odsazený padding-top.
       Pruh má být JEN NAHOŘE na stránce: je absolutně na jejím začátku, obsah se
       odsadí o jeho výšku a fixní hlavička se posune (margin-top: --xg-off) jen
       o tu část pruhu, která je ještě vidět -> při scrollu pruh odjede a hlavička
       plynule dojede k hornímu okraji. Na PC je pruh v toku stránky nad
       .overall-wrapper. */
    var FIXED_SEL = [".top-navigation-bar", "#header", "#navigation"];
    var lastKey = "";
    var promoH = 0, lastOff = -1;
    function each(fn) {
      FIXED_SEL.forEach(function (sel) {
        [].slice.call(document.querySelectorAll(sel)).forEach(fn);
      });
    }
    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      var off = promoH ? Math.max(0, Math.min(promoH, promoH - y)) : 0;
      if (off !== lastOff) {
        lastOff = off;
        document.documentElement.style.setProperty("--xg-off", off + "px");
      }
    }
    function home() {                                           // místo pruhu na PC
      var anchor = document.querySelector(".overall-wrapper");
      if (anchor && anchor.parentNode) {
        if (bar.nextElementSibling !== anchor) anchor.parentNode.insertBefore(bar, anchor);
      } else if (bar.parentNode !== document.body) {
        document.body.insertBefore(bar, document.body.firstChild);
      }
    }
    function layout() {
      var ow = document.querySelector(".overall-wrapper");
      if (ow) ow.style.removeProperty("padding-top");
      home();
      var fixedMode = false;
      each(function (el) { if (getComputedStyle(el).position === "fixed") fixedMode = true; });
      bar.classList.toggle("xg-abs", fixedMode);
      document.documentElement.classList.toggle("xg-mobile", fixedMode);
      placeWholesale(fixedMode);
      fit();
      var hgt = bar.offsetHeight;
      if (fixedMode && ow) {
        ow.style.setProperty("padding-top",
          ((parseFloat(getComputedStyle(ow).paddingTop) || 0) + hgt) + "px", "important");
      }
      promoH = fixedMode ? hgt : 0;
      lastOff = -1;
      onScroll();
      lastKey = fixedMode ? "fixed:" + hgt : "static";
    }
    var raf = 0;
    function relayout() {
      if (raf) return;
      var run = function () { raf = 0; layout(); };
      raf = window.requestAnimationFrame ? window.requestAnimationFrame(run) : setTimeout(run, 16);
    }

    function mount() {
      if (document.getElementById("xg-promo")) return;
      var st = document.createElement("style");
      st.id = "xg-promo-css";
      st.textContent = css;
      document.head.appendChild(st);

      if (!PROMO_ON) {                       // pruh vypnutý -> jen menu (VELKOOBCHOD)
        var mraf = 0;
        var menuOnly = function () {
          mraf = 0;
          var mobile = false;
          each(function (el) { if (getComputedStyle(el).position === "fixed") mobile = true; });
          document.documentElement.classList.toggle("xg-mobile", mobile);
          placeWholesale(mobile);
        };
        var again = function () {
          if (mraf) return;
          mraf = window.requestAnimationFrame ? window.requestAnimationFrame(menuOnly) : setTimeout(menuOnly, 16);
        };
        menuOnly();
        window.addEventListener("resize", again);
        window.addEventListener("orientationchange", again);
        window.addEventListener("load", again);
        return;
      }

      bar = document.createElement("div");
      bar.id = "xg-promo";
      bar.setAttribute("role", "region");
      bar.setAttribute("aria-label", "Akce: sleva 10 % na vše");
      bar.innerHTML = '<span class="xg-pm">SLEVA 10% NA VŠE : <strong>NAVSE10</strong></span>'
        + '<span class="xg-pc" aria-live="off"></span>';
      cd = bar.querySelector(".xg-pc");

      var anchor = document.querySelector(".overall-wrapper") || document.body.firstChild;
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(bar, anchor);
      else document.body.insertBefore(bar, document.body.firstChild);

      tick();
      setInterval(tick, 1000);

      layout();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", relayout);
      window.addEventListener("orientationchange", relayout);
      window.addEventListener("load", relayout);                 // dočtené fonty
      if (window.ResizeObserver) {
        new ResizeObserver(function () {
          if (lastKey !== "static" && lastKey !== "fixed:" + bar.offsetHeight) relayout();
        }).observe(bar);
      }
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(relayout);                    // přeměřit po načtení Roboto
      }
    }

    if (document.body) mount();
    else document.addEventListener("DOMContentLoaded", mount);
  })();

  /* ------------------------------------------------------------------ *
   *  Detail produktu: "Doporučujeme přidat k nákupu" (obnoveno z e36a334)
   *  3 koupitelné produkty z aktuální kategorie, zaškrtnuté se přidají do
   *  košíku spolu s hlavním produktem přes nativní Shoptet API.
   * ------------------------------------------------------------------ */
  (function () {
    if (window.__xgKratasDetailRecs) return;
    window.__xgKratasDetailRecs = true;

    var CONFIG = {
      limit: 3,
      widgetId: "xg-kratas-recommendations",
      title: "Doporučujeme přidat k nákupu",
      subtitle: "Zaškrtněte, co chcete přidat do košíku spolu s tímto produktem."
    };

    function cleanText(value) {
      return (value || "").replace(/\s+/g, " ").trim();
    }

    function absoluteUrl(value) {
      try {
        return new URL(value, window.location.origin).href;
      } catch (error) {
        return value || "";
      }
    }

    function getCurrentProductId() {
      var meta = document.querySelector(
        '#product-detail-form meta[itemprop="productID"], .p-detail meta[itemprop="productID"]'
      );
      return meta ? cleanText(meta.getAttribute("content")) : "";
    }

    function getCurrentCategoryUrl() {
      var links = document.querySelectorAll(
        ".breadcrumbs a[href], .breadcrumb a[href], [data-testid='breadcrumbs'] a[href]"
      );
      for (var index = links.length - 1; index >= 0; index -= 1) {
        var href = links[index].getAttribute("href");
        if (!href) continue;
        var url = absoluteUrl(href);
        try {
          if (new URL(url).pathname !== "/") return url;
        } catch (error) {
          continue;
        }
      }
      return "";
    }

    function parseProducts(html) {
      var parsed = new DOMParser().parseFromString(html, "text/html");
      var currentProductId = getCurrentProductId();
      var cards = parsed.querySelectorAll(
        "#products.products-page .product .p[data-micro-product-id]"
      );
      var products = [];
      var usedIds = Object.create(null);

      Array.prototype.forEach.call(cards, function (card) {
        if (products.length >= CONFIG.limit) return;

        var id = cleanText(card.getAttribute("data-micro-product-id"));
        var link = card.querySelector("a.name[data-micro='url'], a.name");
        var name = card.querySelector("[data-micro='name'], [data-testid='productCardName']");
        var image = card.querySelector("a.image img, img");
        var price = card.querySelector(".price-final, [data-testid='productCardPrice']");
        var description = card.querySelector(".p-desc");
        var code = cleanText(
          (card.querySelector("[data-micro='sku']") || {}).textContent
        );
        var addButton = card.querySelector(
          ".add-to-cart-button, [data-testid='buttonAddToCart']"
        );

        if (
          !id ||
          !code ||
          id === currentProductId ||
          usedIds[id] ||
          !link ||
          !name ||
          !image ||
          !price ||
          !addButton
        ) {
          return;
        }

        usedIds[id] = true;
        products.push({
          id: id,
          code: code,
          url: absoluteUrl(link.getAttribute("href")),
          name: cleanText(name.textContent),
          image: absoluteUrl(
            image.getAttribute("data-src") ||
              image.getAttribute("data-lazy-src") ||
              image.getAttribute("src")
          ),
          price: cleanText(price.textContent),
          description: cleanText(description && description.textContent)
        });
      });

      return products;
    }

    function createElement(tagName, className, text) {
      var element = document.createElement(tagName);
      if (className) element.className = className;
      if (typeof text === "string") element.textContent = text;
      return element;
    }

    function createProductRow(product, index) {
      var row = createElement("div", "xg-rec__item");
      row.setAttribute("data-product-id", product.id);

      var checkboxId = CONFIG.widgetId + "-item-" + index;
      var checkbox = createElement("input", "xg-rec__checkbox");
      checkbox.type = "checkbox";
      checkbox.id = checkboxId;
      checkbox.checked = false;
      checkbox.value = product.id;
      checkbox.setAttribute("data-product-code", product.code);
      checkbox.setAttribute("aria-label", "Přidat: " + product.name);

      var checkLabel = createElement("label", "xg-rec__check-label");
      checkLabel.htmlFor = checkboxId;
      checkLabel.appendChild(checkbox);
      var checkMark = createElement("span", "xg-rec__check-mark");
      checkMark.setAttribute("aria-hidden", "true");
      checkLabel.appendChild(checkMark);

      var imageLink = createElement("a", "xg-rec__image-link");
      imageLink.href = product.url;
      imageLink.setAttribute("aria-label", product.name);
      var image = createElement("img", "xg-rec__image");
      image.src = product.image;
      image.alt = "";
      image.loading = "lazy";
      image.width = 72;
      image.height = 72;
      imageLink.appendChild(image);

      var content = createElement("div", "xg-rec__content");
      var nameLink = createElement("a", "xg-rec__name", product.name);
      nameLink.href = product.url;
      content.appendChild(nameLink);
      if (product.description) {
        content.appendChild(createElement("div", "xg-rec__description", product.description));
      }

      var infoLink = createElement("a", "xg-rec__info", "i");
      infoLink.href = product.url;
      infoLink.setAttribute("aria-label", "Detail produktu: " + product.name);
      infoLink.title = "Detail produktu";

      var price = createElement("div", "xg-rec__price", product.price);

      row.appendChild(checkLabel);
      row.appendChild(imageLink);
      row.appendChild(content);
      row.appendChild(infoLink);
      row.appendChild(price);
      return row;
    }

    function injectStyles() {
      if (document.getElementById(CONFIG.widgetId + "-styles")) return;

      var style = document.createElement("style");
      style.id = CONFIG.widgetId + "-styles";
      style.textContent =
        "#" + CONFIG.widgetId + "{" +
          "box-sizing:border-box;width:100%;margin:24px 0;padding:24px 24px 14px;" +
          "border:1px solid #dbe3ee;border-radius:18px;background:#f5f6f8;" +
          "color:var(--colors-foregrounds-content-primary,#1f1f1f);font-family:inherit" +
        "}" +
        "#" + CONFIG.widgetId + " *,#" + CONFIG.widgetId + " *:before,#" + CONFIG.widgetId + " *:after{box-sizing:border-box}" +
        "#" + CONFIG.widgetId + " .xg-rec__title{margin:0 0 3px;font:700 20px/1.25 inherit;color:inherit}" +
        "#" + CONFIG.widgetId + " .xg-rec__subtitle{margin:0 0 14px;color:var(--colors-foregrounds-content-secondary,#4d4d4d);font:400 14px/1.45 inherit}" +
        "#" + CONFIG.widgetId + " .xg-rec__list{display:block}" +
        "#" + CONFIG.widgetId + " .xg-rec__item{display:grid;grid-template-columns:26px 78px minmax(0,1fr) 22px max-content;align-items:center;gap:13px;min-height:96px;padding:9px 0}" +
        "#" + CONFIG.widgetId + " .xg-rec__check-label{position:relative;display:block;width:24px;height:24px;margin:0;cursor:pointer}" +
        "#" + CONFIG.widgetId + " .xg-rec__checkbox{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}" +
        "#" + CONFIG.widgetId + " .xg-rec__check-mark{display:block;width:24px;height:24px;border:2px solid #c4d2e4;border-radius:7px;background:#fff;transition:background .15s,border-color .15s,box-shadow .15s}" +
        "#" + CONFIG.widgetId + " .xg-rec__checkbox:checked+.xg-rec__check-mark{border-color:#55cc00;background:#55cc00}" +
        "#" + CONFIG.widgetId + " .xg-rec__checkbox:checked+.xg-rec__check-mark:after{content:'';display:block;width:10px;height:6px;margin:6px 0 0 5px;border-left:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(-45deg)}" +
        "#" + CONFIG.widgetId + " .xg-rec__checkbox:focus-visible+.xg-rec__check-mark{outline:3px solid var(--colors-focus-primary,#09367e);outline-offset:2px}" +
        "#" + CONFIG.widgetId + " .xg-rec__image-link{display:flex;width:78px;height:78px;align-items:center;justify-content:center;border:1px solid #dbe3ee;border-radius:12px;background:#fff;overflow:hidden}" +
        "#" + CONFIG.widgetId + " .xg-rec__image{display:block;width:100%;height:100%;object-fit:contain}" +
        "#" + CONFIG.widgetId + " .xg-rec__content{min-width:0}" +
        "#" + CONFIG.widgetId + " .xg-rec__name{display:block;color:inherit;font:700 15px/1.3 inherit;text-decoration:none}" +
        "#" + CONFIG.widgetId + " .xg-rec__name:hover{color:var(--color-primary-hover,#2ebd46)}" +
        "#" + CONFIG.widgetId + " .xg-rec__description{display:-webkit-box;margin-top:3px;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;color:var(--colors-foregrounds-content-tertiary,#767676);font:400 13px/1.35 inherit}" +
        "#" + CONFIG.widgetId + " .xg-rec__info,#" + CONFIG.widgetId + " .xg-rec__info:hover,#" + CONFIG.widgetId + " .xg-rec__info:focus{display:flex;width:18px;height:18px;align-items:center;justify-content:center;border:1px solid #9aabc0;border-radius:50%;background:transparent;color:#8193aa;font:700 11px/1 inherit;text-decoration:none;box-shadow:none;outline:none}" +
        "#" + CONFIG.widgetId + " .xg-rec__price{padding-left:4px;color:inherit;font:700 16px/1.25 inherit;white-space:nowrap;text-align:right}" +
        "@media(max-width:767px){" +
          "#" + CONFIG.widgetId + "{margin:18px 0;padding:19px 14px 11px;border-radius:16px}" +
          "#" + CONFIG.widgetId + " .xg-rec__title{font-size:18px}" +
          "#" + CONFIG.widgetId + " .xg-rec__item{grid-template-columns:24px 66px minmax(0,1fr) 18px;gap:10px;min-height:86px}" +
          "#" + CONFIG.widgetId + " .xg-rec__image-link{width:66px;height:66px;border-radius:10px}" +
          "#" + CONFIG.widgetId + " .xg-rec__price{grid-column:3/5;padding:0;text-align:left;font-size:15px}" +
          "#" + CONFIG.widgetId + " .xg-rec__description{-webkit-line-clamp:1}" +
        "}";
      document.head.appendChild(style);
    }

    function buildWidget(products) {
      var widget = createElement("section", "xg-rec");
      widget.id = CONFIG.widgetId;
      widget.setAttribute("aria-labelledby", CONFIG.widgetId + "-title");

      var title = createElement("h2", "xg-rec__title", CONFIG.title);
      title.id = CONFIG.widgetId + "-title";
      widget.appendChild(title);
      widget.appendChild(createElement("p", "xg-rec__subtitle", CONFIG.subtitle));

      var list = createElement("div", "xg-rec__list");
      products.forEach(function (product, index) {
        list.appendChild(createProductRow(product, index));
      });
      widget.appendChild(list);
      return widget;
    }

    function installCartIntegration(widget, productForm) {
      var pendingProducts = [];
      var extraInFlight = false;

      productForm.addEventListener(
        "submit",
        function () {
          pendingProducts = Array.prototype.map.call(
            widget.querySelectorAll(".xg-rec__checkbox:checked"),
            function (checkbox) {
              return {
                id: checkbox.value,
                code: checkbox.getAttribute("data-product-code") || ""
              };
            }
          );
          extraInFlight = false;
        },
        true
      );

      document.addEventListener("ShoptetCartAddCartItem", function () {
        if (!pendingProducts.length) {
          extraInFlight = false;
          return;
        }

        if (extraInFlight) extraInFlight = false;
        if (extraInFlight || !pendingProducts.length) return;

        var product = pendingProducts.shift();
        extraInFlight = true;

        window.setTimeout(function () {
          try {
            if (
              !window.shoptet ||
              !window.shoptet.cartShared ||
              typeof window.shoptet.cartShared.addToCart !== "function"
            ) {
              throw new Error("Shoptet cart API is not available.");
            }
            window.shoptet.cartShared.addToCart(
              { productCode: product.code, amount: 1 },
              true
            );
          } catch (error) {
            pendingProducts = [];
            extraInFlight = false;
            if (window.console && typeof window.console.error === "function") {
              window.console.error("[xgroup] Recommendation could not be added.", error);
            }
          }
        }, 0);
      });
    }

    function initRecommendations() {
      if (document.getElementById(CONFIG.widgetId)) return;
      var productForm = document.getElementById("product-detail-form");
      var insertionPoint = document.querySelector(".p-info-wrapper .add-to-cart");
      if (!productForm || !insertionPoint || !document.body.classList.contains("type-detail")) {
        return;
      }
      // produkty z VELKOOBCHODU widget nemají (hlavní kategorie nebo drobečková navigace)
      if (document.body.classList.contains("in-velkoobchod") ||
          document.querySelector(".breadcrumbs a[href$='/velkoobchod/'], [data-testid='breadcrumbs'] a[href$='/velkoobchod/']")) {
        return;
      }

      var categoryUrl = getCurrentCategoryUrl();
      if (!categoryUrl) return;

      fetch(categoryUrl, { credentials: "same-origin" })
        .then(function (response) {
          if (!response.ok) throw new Error("Category request failed: " + response.status);
          return response.text();
        })
        .then(function (html) {
          var products = parseProducts(html);
          if (!products.length || document.getElementById(CONFIG.widgetId)) return;

          injectStyles();
          var widget = buildWidget(products);
          insertionPoint.parentNode.insertBefore(widget, insertionPoint);
          installCartIntegration(widget, productForm);
        })
        .catch(function (error) {
          if (window.console && typeof window.console.error === "function") {
            window.console.error("[xgroup] Recommendations could not be loaded.", error);
          }
        });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initRecommendations, { once: true });
    } else {
      initRecommendations();
    }
  })();

  /* ------------------------------------------------------------------ *
   *  DATA – produkty (id, priceId potřebné pro přidání do košíku)
   * ------------------------------------------------------------------ */
  var CDN = "https://cdn.myshoptet.com/usr/www.kratas.cz/user/shop/";
  function thumb(p) { return CDN + p; }

  // Nahoře vždy tyto dva – vaporizéry na sušinu
  var FIXED = [
    { id: "271", priceId: "715", name: "Vaporizér na sušinu MARS 3v1", price: 1990, url: "/vaporizer-na-susinu-mars/", img: thumb("related/271_vaporizer-na-susinu-mars---hlavni-produktova-fotografie.png?ff=1&x=100&y=100&q=85&ts=6afb5d80&sg=8dda0505") },
    { id: "268", priceId: "712", name: "Vaporizér na sušinu URANUS – OLED", price: 1490, url: "/vaporizer-na-susinu-uranus/", img: thumb("related/268_vaporizer-na-susinu-uranus---hlavni-produktova-fotografie.png?ff=1&x=100&y=100&q=85&ts=6afb5d80&sg=8dda0505") }
  ];

  // Dole náhodně z tohoto poolu (podobné produkty)
  var POOL = [
    { id: "265", priceId: "709", name: "Vaporizer BR07", price: 379, url: "/vaporizer-br07/", img: thumb("related/265_vaporizer-br07---hlavni-produktova-fotografie.png?ff=1&x=100&y=100&q=85&ts=6afb5d80&sg=8dda0505") },
    { id: "262", priceId: "706", name: "Vaporizer OR100", price: 349, url: "/vaporizer-or100/", img: thumb("related/262_vaporizer-or100---hlavni-produktova-fotografie.png?ff=1&x=100&y=100&q=85&ts=6afb5d80&sg=8dda0505") },
    { id: "259", priceId: "703", name: "Vaporizer BK02", price: 299, url: "/vaporizer-bk02/", img: thumb("related/259_vaporizer-bk02---hlavni-produktova-fotografie.png?ff=1&x=100&y=100&q=85&ts=6afb5d80&sg=8dda0505") },
    { id: "256", priceId: "700", name: "Vaporizer BX02", price: 399, url: "/vaporizer-bx02/", img: thumb("related/256_vaporizer-bx02---hlavni-produktova-fotografie.png?ff=1&x=100&y=100&q=85&ts=6afb5d80&sg=8dda0505") },
    { id: "171", priceId: "456", name: "Smart Vape Pen baterie 510", price: 249, url: "/smart-vape-pen-baterie-510/", img: thumb("related/171_wn00024-01.png?ff=1&x=100&y=100&q=85&ts=6afb5d82&sg=8dda0505") },
    { id: "277", priceId: "721", name: "Smart Vape Pen baterie + Cartridge 510", price: 299, url: "/smart-vape-pen-baterie-510-2/", img: thumb("related/277_baterkapluscart.png?ff=1&x=100&y=100&q=85&ts=6afb5d82&sg=8dda0505") },
    { id: "274", priceId: "718", name: "Prázdná keramická cartridge 1 ml 10 ks", price: 329, url: "/prazdna-keramicka-cartridge-1-ml-10-ks/", img: thumb("related/274_10ks.png?ff=1&x=100&y=100&q=85&ts=6afb5d81&sg=8dda0505") },
    { id: "210", priceId: "675", name: "Prázdná keramická cartridge 1 ml 100 ks", price: 2999, url: "/prazdna-keramicka-cartridge-1ml-100ks/", img: thumb("detail/210-1_274-0b1224ba-67be-4f43-9493-2baf9a29e513.png?ff=1&x=100&y=100&q=85&ts=6afb5d81&sg=89595c3b") },
    { id: "123", priceId: "318", name: "5-MeO-DMT Cartridge + baterie 510 – Balíček", price: 1699, url: "/5-meo-dmt-cartridge-baterka-balicek/", img: thumb("related/123_5meoset.png?ff=1&x=100&y=100&q=85&ts=6afb5d82&sg=8dda0505") }
  ];

  var RECOS_BELOW = 6;         // kolik náhodných pod fixními
  var CART_URL = "/kosik/";

  /* ------------------------------------------------------------------ *
   *  Helpers
   * ------------------------------------------------------------------ */
  function fmt(n) {
    try { return new Intl.NumberFormat("cs-CZ").format(Math.round(n)) + " Kč"; }
    catch (e) { return Math.round(n) + " Kč"; }
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function csrfToken() {
    try { return window.shoptet && window.shoptet.csrf && window.shoptet.csrf.token; }
    catch (e) { return null; }
  }
  function refreshNativeCart() {
    try { if (window.shoptet && window.shoptet.cart && window.shoptet.cart.getCartContent) window.shoptet.cart.getCartContent(); } catch (e) {}
  }

  // Přidání do košíku (ověřeno: fetch POST + __csrf__)
  function addToCart(productId, priceId, amount) {
    var body = new URLSearchParams();
    body.set("productId", productId);
    body.set("priceId", priceId);
    body.set("amount", String(amount || 1));
    body.set("language", (document.documentElement.getAttribute("lang") || "cs"));
    var t = csrfToken(); if (t) body.set("__csrf__", t);
    return fetch("/action/Cart/addCartItem/", {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Requested-With": "XMLHttpRequest" },
      body: body.toString()
    }).then(function (r) { return r.json().catch(function () { return { code: r.status }; }); });
  }

  // Změna množství položky v košíku
  function setAmount(itemId, priceId, amount) {
    var body = new URLSearchParams();
    body.set("itemId", itemId);
    body.set("priceId", priceId);
    body.set("amount", String(amount));
    var t = csrfToken(); if (t) body.set("__csrf__", t);
    return fetch("/action/Cart/setCartItemAmount/", {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Requested-With": "XMLHttpRequest" },
      body: body.toString()
    }).then(function (r) { return r.json().catch(function () { return { code: r.status }; }); });
  }

  // Načtení obsahu košíku -> pole položek
  function getCart() {
    return fetch("/action/Cart/GetCartContent/", {
      credentials: "same-origin", headers: { "X-Requested-With": "XMLHttpRequest" }
    }).then(function (r) { return r.json(); }).then(function (j) {
      var html = (j && j.payload && j.payload.content) || "";
      var doc = new DOMParser().parseFromString(html, "text/html");
      return [].slice.call(doc.querySelectorAll('tr[data-micro="cartItem"]')).map(function (tr) {
        var nameEl = tr.querySelector(".main-link, [data-testid='cartProductName']");
        var imgEl = tr.querySelector("img[data-src], img");
        var amtEl = tr.querySelector("input.amount[name='amount'], input[name='amount']");
        var unitEl = tr.querySelector("[data-testid='cartItemPrice'], .p-price .price-final, .price-final");
        var idEl = tr.querySelector("input[name='itemId']");
        var pidEl = tr.querySelector("input[name='priceId']");
        return {
          sku: tr.getAttribute("data-micro-sku"),
          name: nameEl ? nameEl.textContent.trim().replace(/\s+/g, " ") : "",
          url: nameEl ? nameEl.getAttribute("href") : "",
          img: imgEl ? (imgEl.getAttribute("data-src") || imgEl.getAttribute("src")) : "",
          amount: amtEl ? parseInt(amtEl.value, 10) || 1 : 1,
          unit: unitEl ? parsePrice(unitEl.textContent) : null,
          itemId: idEl ? idEl.value : null,
          priceId: pidEl ? pidEl.value : null
        };
      });
    }).catch(function () { return []; });
  }
  function parsePrice(txt) {
    if (!txt) return null;
    var m = String(txt).replace(/\s| /g, "").match(/([\d.,]+)/);
    if (!m) return null;
    return parseFloat(m[1].replace(/\./g, "").replace(",", ".")) || null;
  }

  /* ------------------------------------------------------------------ *
   *  Styly (1:1 Apollo kratas.cz: Roboto, modrá #2093D9, pill tlačítka)
   * ------------------------------------------------------------------ */
  var CSS = ''
    + '#xg-reco,#xg-reco *{box-sizing:border-box}'
    + '#xg-reco{position:fixed;inset:0;z-index:2147483000;font-family:Roboto,"Segoe UI",Arial,sans-serif;'
    + 'opacity:0;visibility:hidden}'
    + '#xg-reco.xg-open{opacity:1;visibility:visible}'     /* instantně, bez animace */
    + '#xg-reco .xg-ov{position:absolute;inset:0;background:rgba(18,20,30,.10);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px)}'
    + '#xg-reco .xg-panel{position:absolute;top:0;right:0;height:100%;width:760px;max-width:100%;background:#fff;'
    + 'display:flex;flex-direction:column;box-shadow:-10px 0 34px rgba(0,0,0,.14)}'
    + '#xg-reco .xg-head{display:flex;align-items:center;gap:10px;padding:16px 18px;border-bottom:1px solid #ededf0;flex:0 0 auto}'
    + '#xg-reco .xg-check{width:26px;height:26px;border-radius:50%;background:#3c9a2e;display:flex;align-items:center;justify-content:center;flex:0 0 auto}'
    + '#xg-reco .xg-check svg{width:15px;height:15px;fill:none;stroke:#fff;stroke-width:3}'
    + '#xg-reco .xg-title{font-size:18px;font-weight:700;color:#14141a}'
    + '#xg-reco .xg-x{margin-left:auto;background:none;border:0;cursor:pointer;color:#9a9aa6;font-size:22px;line-height:1;padding:4px;width:32px;height:32px;border-radius:50%}'
    + '#xg-reco .xg-x:hover{background:#f2f2f4;color:#333}'
    + '#xg-reco .xg-body{flex:1 1 auto;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px 18px}'
    + '#xg-reco .xg-added{display:flex;align-items:center;gap:12px;padding:4px 0 16px;border-bottom:1px solid #ededf0}'
    + '#xg-reco .xg-added img{width:66px;height:66px;object-fit:contain;flex:0 0 auto}'
    + '#xg-reco .xg-added .xg-an{flex:1 1 auto;min-width:0}'
    + '#xg-reco .xg-added .xg-an b{display:block;font-size:14px;font-weight:600;color:#1a1a1f;line-height:1.3;margin-bottom:8px}'
    + '#xg-reco .xg-step{display:inline-flex;align-items:center;border:1px solid #d9d9df;border-radius:6px;overflow:hidden;height:32px}'
    + '#xg-reco .xg-step button{width:32px;height:30px;border:0;background:#f4f6f9;color:#2093D9;font-size:17px;cursor:pointer;line-height:1}'
    + '#xg-reco .xg-step button:hover{background:#e7eef6}'
    + '#xg-reco .xg-step button:disabled{opacity:.45;cursor:default}'
    + '#xg-reco .xg-step .xg-q{min-width:46px;text-align:center;font-size:14px;color:#1a1a1f}'
    + '#xg-reco .xg-added .xg-ap{font-size:18px;font-weight:700;color:#0f0f0f;white-space:nowrap;flex:0 0 auto}'
    + '#xg-reco .xg-sec{font-size:16px;font-weight:700;color:#14141a;margin:18px 0 12px}'
    + '#xg-reco .xg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}'
    + '#xg-reco .xg-card{border:1px solid #e7e7ec;border-radius:12px;padding:16px 13px;display:flex;flex-direction:column;align-items:center;text-align:center;background:#fff;box-shadow:none}'
    + '#xg-reco .xg-card:hover{box-shadow:none}'
    + '#xg-reco .xg-card .xg-imgw{height:190px;display:flex;align-items:center;justify-content:center;margin-bottom:12px}'
    + '#xg-reco .xg-card img{max-width:100%;max-height:190px;object-fit:contain}'
    + '#xg-reco .xg-stars{color:#f5a623;font-size:13px;letter-spacing:1px;line-height:1;margin-bottom:7px}'
    + '#xg-reco .xg-card .xg-cn{font-size:13.5px;font-weight:600;color:#26262c;line-height:1.35;min-height:37px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:8px}'
    + '#xg-reco .xg-card .xg-cp{font-size:17px;font-weight:700;color:#0f0f0f;margin-bottom:12px}'
    /* tlačítko = nativní Apollo třída .btn.btn-conversion (jejich modrá + zelený hover
       #2ebd46), ale zpět na normální/menší velikost jako dřív (bez velkého min-height a stínu) */
    + '#xg-reco .xg-buy{margin-top:auto;min-height:0;height:44px;padding:0 16px;line-height:1;'
    + 'justify-content:center;gap:8px;font-size:14px;box-shadow:none}'
    + '#xg-reco .xg-buy:hover{box-shadow:none}'
    + '#xg-reco .xg-buy svg{width:16px;height:16px;fill:currentColor}'
    + '#xg-reco .xg-buy.xg-done{background:var(--color-secondary-hover,#2ebd46);border-color:var(--color-secondary-hover,#2ebd46);color:#fff}'
    + '#xg-reco .xg-buy.xg-done svg{fill:#fff}'
    + '#xg-reco .xg-foot{flex:0 0 auto;display:flex;gap:12px;padding:14px 18px;border-top:1px solid #ededf0;background:#fff}'
    + '#xg-reco .xg-foot a{flex:1 1 0;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:46px;border-radius:40px;font-size:14px;font-weight:700;text-decoration:none;cursor:pointer}'
    + '#xg-reco .xg-cont{background:#fff;border:1px solid #d9dbe2;color:#2b2b33}'
    + '#xg-reco .xg-cont:hover{border-color:#b9bcc6}'
    + '#xg-reco .xg-tocart{background:#2093D9;border:1px solid #2093D9;color:#fff}'
    + '#xg-reco .xg-tocart:hover{background:#1b83c4}'
    + '@media(max-width:767px){'
    + '#xg-reco .xg-panel{width:100%}'
    + '#xg-reco .xg-grid{grid-template-columns:repeat(2,1fr)}'
    + '#xg-reco .xg-title{font-size:16px}'
    + '#xg-reco .xg-foot a{font-size:13px;height:44px}'
    + '}';

  /* ------------------------------------------------------------------ *
   *  UI
   * ------------------------------------------------------------------ */
  var root, bodyEl, addedEl, gridEl, current = null;

  function cartIcon() {
    return '<svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7.17 14h9.66c.75 0 1.41-.41 1.75-1.03l3.24-5.88a1 1 0 0 0-.87-1.48H6.21l-.94-2H2v2h2l3.6 7.59-1.35 2.44C5.52 16.37 6.48 18 7.83 18H19v-2H7.17l.83-1.5z"/></svg>';
  }

  function build() {
    var style = document.createElement("style");
    style.id = "xg-reco-css";
    style.textContent = CSS;
    document.head.appendChild(style);

    root = document.createElement("div");
    root.id = "xg-reco";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", "Zboží přidáno do košíku");
    root.innerHTML = ''
      + '<div class="xg-ov" data-close></div>'
      + '<div class="xg-panel">'
      +   '<div class="xg-head">'
      +     '<span class="xg-check"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></span>'
      +     '<span class="xg-title">Zboží přidáno do košíku</span>'
      +     '<button class="xg-x" data-close aria-label="Zavřít">&times;</button>'
      +   '</div>'
      +   '<div class="xg-body">'
      +     '<div class="xg-added"></div>'
      +     '<div class="xg-sec">Nejčastěji zakoupeno společně</div>'
      +     '<div class="xg-grid"></div>'
      +   '</div>'
      +   '<div class="xg-foot">'
      +     '<a class="xg-cont" data-close>&#8249;&nbsp;Pokračovat v nákupu</a>'
      +     '<a class="xg-tocart" href="' + CART_URL + '">Pokračovat do košíku&nbsp;&#8250;</a>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(root);

    addedEl = root.querySelector(".xg-added");
    gridEl = root.querySelector(".xg-grid");

    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) { e.preventDefault(); close(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("xg-open")) close();
    });
  }

  function renderAdded(item) {
    current = item;
    var qty = item.amount || 1;
    var unit = item.unit || 0;
    var dis = item.itemId ? '' : ' disabled';   // +/- až po potvrzení košíkem
    addedEl.innerHTML = ''
      + '<img src="' + esc(item.img) + '" alt="">'
      + '<div class="xg-an">'
      +   '<b>' + esc(item.name) + '</b>'
      +   '<div class="xg-step">'
      +     '<button type="button" data-dec aria-label="Méně"' + dis + '>&minus;</button>'
      +     '<span class="xg-q"><span class="xg-qn">' + qty + '</span> ks</span>'
      +     '<button type="button" data-inc aria-label="Více"' + dis + '>+</button>'
      +   '</div>'
      + '</div>'
      + '<div class="xg-ap">' + fmt(unit * qty) + '</div>';

    var qn = addedEl.querySelector(".xg-qn");
    var ap = addedEl.querySelector(".xg-ap");
    function sync(q) {
      qn.textContent = q;
      ap.textContent = fmt(unit * q);
    }
    addedEl.querySelector("[data-inc]").addEventListener("click", function () {
      if (!item.itemId) return;
      var q = (parseInt(qn.textContent, 10) || 1) + 1;
      sync(q); internalCartOp(); setAmount(item.itemId, item.priceId, q).then(function () { refreshNativeCart(); });
    });
    addedEl.querySelector("[data-dec]").addEventListener("click", function () {
      if (!item.itemId) return;
      var q = (parseInt(qn.textContent, 10) || 1) - 1;
      if (q < 1) q = 1;
      sync(q); internalCartOp(); setAmount(item.itemId, item.priceId, q).then(function () { refreshNativeCart(); });
    });
  }

  function recommendations(addedPriceId) {
    // právě přidaný produkt nikdy nenabízíme znovu; počet držíme konstantní
    var fixed = FIXED.filter(function (f) { return f.priceId !== addedPriceId; });
    var pool = POOL.filter(function (p) {
      return p.priceId !== addedPriceId && !FIXED.some(function (f) { return f.priceId === p.priceId; });
    });
    var need = (FIXED.length - fixed.length) + RECOS_BELOW;
    return fixed.concat(shuffle(pool).slice(0, need));
  }

  function renderGrid(addedPriceId) {
    var recos = recommendations(addedPriceId);
    gridEl.innerHTML = recos.map(function (p) {
      return ''
        + '<div class="xg-card">'
        +   '<a class="xg-imgw" href="' + esc(p.url) + '"><img src="' + esc(p.img) + '" alt="" loading="lazy"></a>'
        +   '<div class="xg-stars">★★★★★</div>'
        +   '<a class="xg-cn" href="' + esc(p.url) + '" style="text-decoration:none">' + esc(p.name) + '</a>'
        +   '<div class="xg-cp">' + fmt(p.price) + '</div>'
        +   '<button type="button" class="btn btn-conversion xg-buy" data-id="' + esc(p.id) + '" data-pid="' + esc(p.priceId) + '">'
        +     '<span>Do košíku</span>' + cartIcon()
        +   '</button>'
        + '</div>';
    }).join("");

    [].slice.call(gridEl.querySelectorAll(".xg-buy")).forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.disabled) return;
        btn.disabled = true;
        internalCartOp();
        addToCart(btn.getAttribute("data-id"), btn.getAttribute("data-pid"), 1).then(function (res) {
          refreshNativeCart();
          if (res && res.code === 200) {
            btn.classList.add("xg-done");
            btn.querySelector("span").textContent = "Přidáno";
          }
          setTimeout(function () {
            btn.classList.remove("xg-done");
            btn.querySelector("span").textContent = "Do košíku";
            btn.disabled = false;
          }, 1600);
        }).catch(function () { btn.disabled = false; });
      });
    });
  }

  function open(item) {
    if (!root) build();
    renderAdded(item);
    renderGrid(item.priceId);
    root.querySelector(".xg-body").scrollTop = 0;
    root.classList.add("xg-open");   // instantně
    try { document.documentElement.style.overflow = "hidden"; } catch (e) {}
  }
  function close() {
    if (!root) return;
    root.classList.remove("xg-open");
    try { document.documentElement.style.overflow = ""; } catch (e) {}
  }

  /* ------------------------------------------------------------------ *
   *  Trigger – detekce přidání přes diff košíku na ShoptetCartUpdated
   * ------------------------------------------------------------------ */
  var baseline = {};          // priceId -> amount
  var suppressUntil = 0;      // ignoruj vlastní operace
  function internalCartOp() { suppressUntil = Date.now() + 2500; }

  function snapshot(items) {
    var m = {};
    items.forEach(function (it) { if (it.priceId) m[it.priceId] = it.amount; });
    return m;
  }
  function isOpen() { return !!(root && root.classList.contains("xg-open")); }

  /* Okamžité otevření: popup se otevře už při odeslání formuláře "Do košíku"
     z údajů na stránce (název, obrázek, cena). Po potvrzení Shoptetem se jen
     doplní počet kusů v košíku a ožije +/-. Když přidání selže, popup zavřeme. */
  var pending = null;         // { priceId, item, at }
  var failTimer = 0;
  function pick(scope, sels) {
    for (var i = 0; i < sels.length; i++) {
      var el = scope.querySelector(sels[i]);
      if (el) return el;
    }
    return null;
  }
  function productFromForm(form) {
    var priceId = (form.querySelector("input[name='priceId']") || {}).value;
    if (!priceId) return null;
    var detail = form.id === "product-detail-form";
    var scope = detail ? document : (form.closest(".product, .p") || form);
    var nameEl = detail ? pick(document, [".p-detail-inner-header h1", "h1"])
                        : pick(scope, ["[data-testid='productCardName']", "a.name", ".name"]);
    var imgEl = detail ? pick(document, [".p-image img", ".p-main-image img", ".p-image-wrapper img"])
                       : pick(scope, ["a.image img", "img"]);
    var priceEl = pick(detail ? (form.closest(".p-detail, .p-info-wrapper") || document) : scope,
                       [".price-final-holder", ".price-final", "[data-testid='productCardPrice']"]);
    var amountEl = form.querySelector("input[name='amount']");
    return {
      priceId: String(priceId),
      itemId: null,
      name: nameEl ? nameEl.textContent.trim().replace(/\s+/g, " ") : "",
      img: imgEl ? (imgEl.getAttribute("data-src") || imgEl.getAttribute("src") || "") : "",
      unit: priceEl ? parsePrice(priceEl.textContent) : null,
      amount: amountEl ? (parseInt(amountEl.value, 10) || 1) : 1
    };
  }
  function onAddSubmit(e) {
    var form = e.target;
    if (!form || form.tagName !== "FORM" || !/addCartItem/i.test(form.getAttribute("action") || "")) return;
    // nevybraná varianta -> Shoptet nic nepřidá, popup neotvírat
    var selects = form.querySelectorAll("select");
    for (var i = 0; i < selects.length; i++) if (!selects[i].value) return;
    var item = productFromForm(form);
    if (!item || !item.name) return;
    pending = { priceId: item.priceId, item: item, at: Date.now() };
    open(item);
    clearTimeout(failTimer);
    failTimer = setTimeout(function () {                      // nepotvrzeno -> zavřít
      if (pending && pending.priceId === item.priceId) { pending = null; close(); }
    }, 6000);
  }

  /* Nativní zelená bublina Shoptetu "Produkt byl přidán do košíku" – nahrazuje ji
     náš popup. Chybové hlášky (např. nedostatek zboží) necháváme a popup zavřeme. */
  var MSG_CSS = '.messages .msg-success:has(a[href*="/kosik"]){display:none!important}';
  function sweepMessages() {
    [].slice.call(document.querySelectorAll(".messages .msg")).forEach(function (m) {
      if (m.classList.contains("msg-success") && m.querySelector('a[href*="/kosik"]')) {
        m.style.setProperty("display", "none", "important");
      } else if (m.classList.contains("msg-error") && pending) {
        pending = null; clearTimeout(failTimer); close();
      }
    });
  }
  function watchMessages() {
    var st = document.createElement("style");
    st.id = "xg-msg-css";
    st.textContent = MSG_CSS;
    try { document.head.appendChild(st); } catch (e) {}
    if (!window.MutationObserver) return;
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) {
        var t = ms[i].target;
        if (t && t.nodeType === 1 && (t.classList.contains("messages") || (t.closest && t.closest(".messages")) ||
            [].some.call(ms[i].addedNodes, function (n) { return n.nodeType === 1 && (n.classList.contains("messages") || n.classList.contains("msg")); }))) {
          sweepMessages(); return;
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  function onCartUpdated() {
    getCart().then(function (items) {
      var now = snapshot(items);
      if (Date.now() < suppressUntil) { baseline = now; return; }   // vlastní akce
      // potvrzení okamžitě otevřeného popupu -> doplnit itemId a množství z košíku
      if (pending && Date.now() - pending.at < 15000) {
        for (var j = 0; j < items.length; j++) {
          if (items[j].priceId === pending.priceId) {
            var p = pending.item, c = items[j];
            pending = null; clearTimeout(failTimer);
            baseline = now;
            if (isOpen() && current && current.priceId === p.priceId) {
              renderAdded({ priceId: c.priceId, itemId: c.itemId, amount: c.amount,
                            unit: c.unit || p.unit, name: p.name || c.name, img: p.img || c.img });
            }
            return;
          }
        }
      }
      // najdi přidaný / navýšený produkt (přidání odjinud než z formuláře)
      var addedItem = null;
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var prev = baseline[it.priceId] || 0;
        if (it.amount > prev) { addedItem = it; break; }
      }
      baseline = now;
      if (addedItem && !isOpen()) open(addedItem);   // otevřený popup nepřekreslovat
    });
  }

  function start() {
    if (!root) build();          // DOM + styly popupu předem -> první otevření bez prodlevy
    getCart().then(function (items) { baseline = snapshot(items); });
    document.addEventListener("submit", onAddSubmit, true);
    document.addEventListener("ShoptetCartAddCartItem", function () { clearTimeout(failTimer); sweepMessages(); });
    document.addEventListener("ShoptetCartUpdated", onCartUpdated);
    watchMessages();
  }

  if (window.shoptet) start();
  else document.addEventListener("DOMContentLoaded", function () { if (window.shoptet) start(); });
})();
