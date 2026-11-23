/*!
 * kratas.cz – registrační nabídka + členská cena (Shoptet / Apollo)
 * Host: AlexanderBurian/xgroup. Nezávislé na projektu Okla.
 */
(function () {
  "use strict";

  if (window.__xgKratasRegisterOffer) return;
  window.__xgKratasRegisterOffer = true;

  var STORAGE_KEY = "xg-kratas-register-offer-v1";
  var EVERY = 2 * 24 * 60 * 60 * 1000;
  var scriptUrl = (document.currentScript && document.currentScript.src) || "";
  var giftUrl = "";
  try {
    giftUrl = new URL("assets/kratas-gift-register-v2.webp", scriptUrl || location.href).href;
  } catch (error) {
    giftUrl = "https://cdn.jsdelivr.net/gh/AlexanderBurian/xgroup@main/assets/kratas-gift-register-v2.webp";
  }

  function isSignedIn() {
    return !document.querySelector(
      '#navigation a[data-testid="signin"], .top-navigation-bar a[data-testid="signin"], ' +
      '.top-navigation-bar .top-nav-button-login, .user-action-login a[href*="/login"]'
    );
  }

  function isWrongPage() {
    var body = document.body;
    return /^\/(?:login|registrace|zapomenute-heslo|klient|kosik|objednavka|odhlasit|logout)(?:\/|$)/i.test(location.pathname) ||
      !!(body && /(^|\s)(?:ordering-process|in-klient|in-login|in-registrace|in-zapomenute-heslo)(\s|$)/.test(body.className));
  }

  function readLastShown() {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0;
    } catch (error) {
      var match = document.cookie.match(new RegExp("(?:^|;\\s*)" + STORAGE_KEY + "=(\\d+)"));
      return match ? parseInt(match[1], 10) || 0 : 0;
    }
  }

  function isDue() {
    return Date.now() - readLastShown() >= EVERY;
  }

  function rememberShown() {
    var value = String(Date.now());
    try { localStorage.setItem(STORAGE_KEY, value); } catch (error) {}
    try {
      document.cookie = STORAGE_KEY + "=" + value + "; Max-Age=" + (60 * 60 * 24 * 730) + "; Path=/; SameSite=Lax";
    } catch (error) {}
  }

  function cookieBarOpen() {
    return Array.prototype.some.call(
      document.querySelectorAll(".siteCookies, .js-siteCookies"),
      function (element) {
        var style = getComputedStyle(element);
        var rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" &&
          parseFloat(style.opacity || "1") > 0 && rect.width > 0 && rect.height > 0;
      }
    );
  }

  var CSS = "" +
    "html.xg-kro-open,html.xg-kro-open body{overflow:hidden!important}" +
    ".xg-kro,.xg-kro *{box-sizing:border-box}" +
    ".xg-kro{position:fixed;inset:0;z-index:2147483600;display:grid;place-items:center;padding:16px;" +
      "font-family:Roboto,\"Segoe UI\",Arial,sans-serif}" +
    ".xg-kro__dim{position:absolute;inset:0;background:rgba(23,50,10,.62);opacity:0;transition:opacity .2s ease}" +
    ".xg-kro__card{position:relative;width:100%;max-width:400px;margin-top:96px;padding:118px 28px 22px;" +
      "border-radius:16px;background:#fff;color:#17320a;text-align:center;box-shadow:0 18px 50px rgba(23,50,10,.28);" +
      "outline:0;opacity:0;transform:translateY(14px) scale(.98);" +
      "transition:opacity .2s ease,transform .25s cubic-bezier(.22,.61,.36,1)}" +
    ".xg-kro.is-in .xg-kro__dim{opacity:1}" +
    ".xg-kro.is-in .xg-kro__card{opacity:1;transform:none}" +
    ".xg-kro__gift{position:absolute;left:50%;top:-104px;width:232px;height:auto;transform:translateX(-50%);" +
      "pointer-events:none;user-select:none;-webkit-user-drag:none}" +
    ".xg-kro__close{position:absolute;top:10px;right:10px;display:grid;place-items:center;width:38px;height:38px;" +
      "margin:0;padding:0;border:0;border-radius:50%;background:transparent;color:#17320a;cursor:pointer;box-shadow:none}" +
    ".xg-kro__close:hover,.xg-kro__close:focus-visible{background:#eef7e5}" +
    ".xg-kro__close svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}" +
    ".xg-kro__title{margin:0 0 10px;font-size:27px;line-height:1.2;font-weight:800;color:#17320a;" +
      "letter-spacing:-.01em;text-transform:none}" +
    ".xg-kro__title em{font-style:normal;color:#67b015}" +
    ".xg-kro__text{margin:0 auto 22px;max-width:325px;font-size:16px;line-height:1.5;color:#52634a}" +
    ".xg-kro__text b{color:#17320a;font-weight:700}" +
    ".xg-kro__cta{display:flex;align-items:center;justify-content:center;height:52px;margin:0 0 12px;border-radius:8px;" +
      "background:#67b015;color:#fff!important;-webkit-text-fill-color:#fff;font-size:17px;font-weight:700;" +
      "text-decoration:none!important;transition:background-color .15s ease}" +
    ".xg-kro__cta:hover,.xg-kro__cta:focus-visible{background:#579812;color:#fff!important}" +
    ".xg-kro__login{display:inline-block;padding:6px 4px;font-size:14px;color:#4f8d0f!important;" +
      "text-decoration:underline!important;text-underline-offset:2px}" +
    ".xg-kmp{display:flex;align-items:center;flex-wrap:wrap;gap:4px 7px;margin:8px 0 0!important;padding:0!important;" +
      "font:400 14px/1.4 Roboto,\"Segoe UI\",Arial,sans-serif!important;color:#17320a!important}" +
    ".xg-kmp svg{flex:none;width:18px;height:18px;fill:none;stroke:#67b015;stroke-width:1.8;" +
      "stroke-linecap:round;stroke-linejoin:round}" +
    ".xg-kmp__usual{color:#728094!important}" +
    ".xg-kmp__usual s{color:#728094!important}" +
    ".xg-kmp__usual:before{content:\"·\";margin:0 6px 0 0;color:#a0a9b6}" +
    "#content .p-detail .p-final-price-wrapper.xg-kmp-priced .price-standard," +
    "#content .p-detail .p-final-price-wrapper.xg-kmp-priced .price-save{display:none!important}" +
    "@media(max-width:480px){.xg-kro__card{max-width:360px;padding:104px 20px 18px;margin-top:84px}" +
      ".xg-kro__gift{width:204px;top:-92px}.xg-kro__title{font-size:23px}.xg-kro__text{font-size:15px}}" +
    "@media(max-width:767px){.xg-kmp__usual{flex-basis:100%;padding-left:25px}.xg-kmp__usual:before{content:none}}" +
    "@media(prefers-reduced-motion:reduce){.xg-kro__dim,.xg-kro__card{transition:none}}";

  function injectStyles() {
    if (document.getElementById("xg-kratas-register-css")) return;
    var style = document.createElement("style");
    style.id = "xg-kratas-register-css";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  var popup = null;
  var lastFocus = null;
  var pushedState = false;

  function hidePopup(fromUser) {
    if (!popup) return;
    var old = popup;
    popup = null;
    old.classList.remove("is-in");
    document.documentElement.classList.remove("xg-kro-open");
    setTimeout(function () { old.remove(); }, 220);
    if (pushedState) {
      pushedState = false;
      if (fromUser && history.state && history.state.xgKratasRegisterOffer) history.back();
    }
    if (lastFocus && lastFocus.focus) {
      try { lastFocus.focus({ preventScroll: true }); } catch (error) {}
    }
  }

  function showPopup(force) {
    if (popup || isSignedIn() || isWrongPage() || (!force && !isDue())) return;
    injectStyles();
    rememberShown();
    popup = document.createElement("div");
    popup.className = "xg-kro";
    popup.innerHTML = '' +
      '<div class="xg-kro__dim"></div>' +
      '<div class="xg-kro__card" role="dialog" aria-modal="true" aria-labelledby="xg-kro-title" tabindex="-1">' +
        '<img class="xg-kro__gift" src="' + giftUrl + '" alt="" width="520" height="451" decoding="async">' +
        '<button type="button" class="xg-kro__close" aria-label="Zavřít">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
        '</button>' +
        '<h2 class="xg-kro__title" id="xg-kro-title">Máme pro vás <em>dárek</em>!</h2>' +
        '<p class="xg-kro__text">Zaregistrujte se a jako registrovaný zákazník budete mít slevu ' +
          '<b>5&nbsp;% na všechny nákupy navždy</b>.</p>' +
        '<a class="xg-kro__cta" href="/registrace/">Chci slevu 5 %</a>' +
        '<a class="xg-kro__login" href="/login/">Už mám účet – přihlásit se</a>' +
      '</div>';
    document.body.appendChild(popup);
    lastFocus = document.activeElement;
    document.documentElement.classList.add("xg-kro-open");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { if (popup) popup.classList.add("is-in"); });
    });

    var card = popup.querySelector(".xg-kro__card");
    try { card.focus({ preventScroll: true }); } catch (error) {}
    popup.querySelector(".xg-kro__close").addEventListener("click", function () { hidePopup(true); });
    popup.querySelector(".xg-kro__dim").addEventListener("click", function () { hidePopup(true); });
    popup.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        hidePopup(true);
        return;
      }
      if (event.key !== "Tab") return;
      var focusable = Array.prototype.slice.call(card.querySelectorAll("a,button"));
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    try {
      history.pushState({ xgKratasRegisterOffer: 1 }, "");
      pushedState = true;
    } catch (error) {
      pushedState = false;
    }
  }

  window.addEventListener("popstate", function () {
    if (popup) {
      pushedState = false;
      hidePopup(false);
    }
  });

  window.xgKratasRegisterOffer = {
    show: function () { showPopup(true); },
    hide: function () { hidePopup(true); },
    reset: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (error) {}
      try { document.cookie = STORAGE_KEY + "=; Max-Age=0; Path=/; SameSite=Lax"; } catch (error) {}
    }
  };

  function startPopup() {
    if (isSignedIn() || isWrongPage() || !isDue()) return;
    var waited = 0;
    (function waitForCookieChoice() {
      if (popup || !isDue() || isSignedIn()) return;
      if (cookieBarOpen()) {
        waited += 1000;
        if (waited < 10 * 60 * 1000) setTimeout(waitForCookieChoice, 1000);
        return;
      }
      setTimeout(function () { showPopup(false); }, 1200);
    })();
  }

  function text(element) {
    return element ? (element.textContent || "").replace(/\s+/g, " ").trim() : "";
  }

  function mountMemberPrice() {
    if (!isSignedIn()) return false;
    var detail = document.querySelector("#content .p-detail");
    if (!detail) return false;
    var wrapper = detail.querySelector(".p-final-price-wrapper");
    if (!wrapper) return false;
    if (wrapper.parentNode.querySelector(".xg-kmp")) return true;

    var percent = null;
    Array.prototype.some.call(
      detail.querySelectorAll(".price-save, .flag-discount, [class*='discount']"),
      function (element) {
        var match = text(element).match(/(?:[−–‐-]\s*)?(\d{1,2}(?:[.,]\d+)?)\s*%/);
        if (!match) return false;
        percent = parseFloat(match[1].replace(",", "."));
        return true;
      }
    );
    if (percent !== 5) return false;

    var usual = "";
    Array.prototype.some.call(
      detail.querySelectorAll(".p-final-price-wrapper .price-standard, .price-standard"),
      function (element) {
        var value = text(element);
        if (!/\d/.test(value)) return false;
        usual = value;
        return true;
      }
    );

    var line = document.createElement("p");
    line.className = "xg-kmp";
    line.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M12 12.2a4.4 4.4 0 1 0 0-8.8 4.4 4.4 0 0 0 0 8.8Z"/>' +
      '<path d="M3.8 20.6c.6-3.6 4-6 8.2-6 1.3 0 2.5.2 3.6.7"/>' +
      '<path d="m15.4 18.6 2.2 2.2 4-4.3"/></svg>' +
      '<span>Sleva 5 % pro vás jako registrovaného zákazníka</span>';
    if (usual) {
      var usualElement = document.createElement("span");
      usualElement.className = "xg-kmp__usual";
      usualElement.appendChild(document.createTextNode("běžně "));
      var strike = document.createElement("s");
      strike.textContent = usual;
      usualElement.appendChild(strike);
      line.appendChild(usualElement);
    }
    wrapper.after(line);
    wrapper.classList.add("xg-kmp-priced");
    return true;
  }

  function startMemberPrice() {
    injectStyles();
    var attempts = 0;
    (function retry() {
      if (mountMemberPrice() || attempts++ >= 30) return;
      setTimeout(retry, 200);
    })();
  }

  function start() {
    injectStyles();
    startPopup();
    startMemberPrice();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
