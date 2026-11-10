(function () {
  "use strict";

  var CONFIG = {
    limit: 3,
    widgetId: "xg-kratas-recommendations",
    title: "Doporučujeme přidat k nákupu",
    subtitle: "Zaškrtněte, co chcete přidat do košíku spolu s tímto produktem."
  };

  window.carouselClassicLayout = true;
  window.carouselFullWidth = false;
  window.carouselTextAlign = "left";
  window.carouselOverlay = false;
  window.carouselArrowsOnMobile = false;
  window.productsSlider = true;
  window.productsSliderOnMobile = true;
  window.homepageRatings = false;

  function installVisibilityTitle() {
    if (window.__xgKratasVisibilityTitleInstalled) return;
    window.__xgKratasVisibilityTitleInstalled = true;

    var originalTitle = document.title;
    var awayTitle = "👀 Nezapomněli jste na nás? - Kratas.cz";
    document.addEventListener("visibilitychange", function () {
      document.title = document.hidden ? awayTitle : originalTitle;
    });
  }

  installVisibilityTitle();

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
          image.getAttribute("src") || image.getAttribute("data-src")
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

  function initFooterIco() {
    if (document.querySelector(".kratas-ico")) return;

    var phoneLinks = document.querySelectorAll('footer a[href^="tel:"]');
    var phoneLink = null;
    Array.prototype.some.call(phoneLinks, function (link) {
      var digits = ((link.getAttribute("href") || "") + " " + link.textContent).replace(
        /\D/g,
        ""
      );
      if (digits.indexOf("725346419") === -1) return false;
      phoneLink = link;
      return true;
    });
    var row = phoneLink && phoneLink.closest("li");
    if (!row) return;

    var icoRow = row.cloneNode(true);
    var icoLink = icoRow.querySelector("a");
    if (!icoLink) return;

    icoRow.classList.add("kratas-ico");
    icoLink.removeAttribute("href");
    icoLink.textContent = "IČO: 02017504";
    row.insertAdjacentElement("afterend", icoRow);
  }

  function getReviewValue(object, keys) {
    for (var index = 0; index < keys.length; index += 1) {
      if (object && object[keys[index]] != null) return object[keys[index]];
    }
    return "";
  }

  function reviewText(value) {
    if (value == null) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (typeof value === "object") {
      var nested = getReviewValue(value, [
        "formatted",
        "fullName",
        "name",
        "text",
        "value",
        "date",
        "title"
      ]);
      if (nested !== "" && nested !== value) return reviewText(nested);
    }
    return "";
  }

  function escapeReviewHtml(value) {
    var element = document.createElement("div");
    element.textContent = reviewText(value);
    return element.innerHTML;
  }

  function reviewRating(review) {
    return Number(getReviewValue(review, ["rating", "score", "stars", "value"])) || 5;
  }

  function reviewDate(value) {
    var text = reviewText(value);
    var match = text.match(/^(\d{4})-(\d\d)-(\d\d)/);
    return match ? Number(match[3]) + "." + Number(match[2]) + "." + match[1] : text;
  }

  var REVIEW_STAR =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.8l3.15 6.38 7.04 1.02-5.1 4.97 1.2 7.01L12 17.87l-6.29 3.31 1.2-7.01-5.1-4.97 7.04-1.02z"/></svg>';

  function reviewStars(count, className) {
    var html = '<span class="rStars ' + (className || "") + '">';
    for (var index = 0; index < Math.round(count); index += 1) html += REVIEW_STAR;
    return html + "</span>";
  }

  function injectReviewStyles() {
    if (document.getElementById("xg-kratas-review-styles")) return;
    var style = document.createElement("style");
    style.id = "xg-kratas-review-styles";
    style.textContent =
      "#krR{background:#f5f6f8;padding:58px 0 72px;color:#171717;font-family:inherit}" +
      "#krR *{box-sizing:border-box}" +
      "#krR .rt{text-align:center;font-size:36px;line-height:1.15;font-weight:700;margin:0 0 30px}" +
      "#krR .rg{display:grid;grid-template-columns:432px minmax(0,1fr);gap:40px;padding:0}" +
      "#krR .rs,#krR .rv{background:#fff;border-radius:19px;box-shadow:0 4px 14px #00000017}" +
      "#krR .rs{height:309px;padding:26px 20px;position:relative}" +
      "#krR .rTop{display:flex;gap:27px;align-items:flex-start}" +
      "#krR .rNum{font-size:78px;line-height:.94;font-weight:300;letter-spacing:-4px;color:#f2b719}" +
      "#krR .rStars{display:flex;gap:3px;align-items:center}" +
      "#krR .rStars svg{width:24px;height:24px;fill:#f2b719}" +
      "#krR .rBig{margin-top:2px}" +
      "#krR .rBig svg{width:28px;height:28px}" +
      "#krR .rCount{font-size:20px;margin-top:7px}" +
      "#krR .rBars{margin-top:24px}" +
      "#krR .rRow{display:grid;grid-template-columns:34px 1fr 39px;gap:9px;align-items:center;height:26px;font-size:14px}" +
      "#krR .rLab{font-weight:700;display:flex;align-items:center;gap:5px}" +
      "#krR .rOne{width:15px;height:15px;fill:#f2b719}" +
      "#krR .rTrack{height:4px;background:#eef0f3;border-radius:2px;overflow:hidden}" +
      "#krR .rFill{height:100%;background:#818494}" +
      "#krR .rX{text-align:right;font-weight:700;color:#74788d}" +
      "#krR .rAdd{position:absolute;left:50%;bottom:-25px;transform:translateX(-50%);height:50px;min-width:210px;padding:0 24px;display:flex;align-items:center;justify-content:center;gap:18px;border-radius:28px;background:#239ceb;color:#fff!important;text-decoration:none!important;font-size:14px;font-weight:500;box-shadow:0 4px 9px #0002}" +
      "#krR .rAdd svg{width:15px;height:15px;fill:#fff}" +
      "#krR .rAdd:hover,#krR .rAdd:focus{background:#67b32e!important;color:#fff!important;text-decoration:none!important}" +
      "#krR .ra{position:relative;min-width:0}" +
      "#krR .rv{height:307px;overflow:hidden}" +
      "#krR .strip{height:100%;display:flex;transition:transform .3s ease}" +
      "#krR .card{flex:0 0 50%;padding:40px 50px 34px;min-width:0}" +
      "#krR .card.one{flex-basis:100%}" +
      "#krR .name{font-size:18px;font-weight:700;text-transform:uppercase;margin-bottom:19px}" +
      "#krR .name,#krR .name:hover,#krR .name:focus{color:#171717!important;text-decoration:none!important;pointer-events:none!important}" +
      "#krR .meta{display:flex;align-items:center;gap:18px;margin-bottom:26px}" +
      "#krR .meta .rStars svg{width:18px;height:18px}" +
      "#krR .date{font-size:12px;color:#8d8f9d}" +
      "#krR .txt{font-size:14px;line-height:1.52;margin:0;color:#222;max-width:390px}" +
      "#krR .nav{position:absolute;top:50%;transform:translateY(-50%);z-index:3;width:52px;height:52px;border:0;border-radius:50%;background:#fff;color:#111;box-shadow:0 3px 11px #0002;font:300 38px/46px Arial;cursor:pointer;padding:0}" +
      "#krR .prev{left:-26px}" +
      "#krR .next{right:-26px}" +
      "#krR .nav:hover,#krR .nav:focus{background:#239ceb;color:#fff}" +
      "#krR .nav:disabled{display:none}" +
      "#krR .all{position:absolute;left:50%;bottom:-26px;transform:translateX(-50%);height:52px;min-width:220px;padding:0 24px;display:flex;align-items:center;justify-content:center;border-radius:28px;background:#fff;color:#111!important;text-decoration:none!important;font-size:14px;box-shadow:0 3px 10px #0002}" +
      "#krR .all:hover,#krR .all:focus{background:#239ceb!important;color:#fff!important;text-decoration:none!important}" +
      "@media(max-width:800px){#krR{padding:44px 0 62px}#krR .rt{font-size:30px}#krR .rg{grid-template-columns:1fr;gap:42px;padding:0 15px}#krR .rs{height:auto;min-height:300px}#krR .rv{height:auto;min-height:280px}#krR .card{flex-basis:100%;padding:32px 28px}#krR .prev{left:-8px}#krR .next{right:-8px}#krR .rNum{font-size:66px}#krR .all{white-space:nowrap!important;text-align:center!important;justify-content:center!important;padding-left:18px!important;padding-right:18px!important}}";
    document.head.appendChild(style);
  }

  function renderReviews(data) {
    var reviews = Array.isArray(data) ? data : data.ratings;
    if (!Array.isArray(reviews) || !reviews.length || document.getElementById("krR")) return;

    var sum = 0;
    var distribution = [0, 0, 0, 0, 0, 0];
    reviews.forEach(function (review) {
      var rating = reviewRating(review);
      sum += rating;
      if (rating >= 1 && rating <= 5) distribution[Math.round(rating)] += 1;
    });

    var average =
      Number(data.averageScore || data.averageRating || data.average) || sum / reviews.length;
    var total =
      Number(data.ratingsCount || data.ratingCount || data.totalRatings || data.totalCount) ||
      reviews.length;
    var bars = "";
    var cards = "";

    for (var rating = 5; rating >= 1; rating -= 1) {
      var width = (distribution[rating] / reviews.length) * 100;
      bars +=
        '<div class="rRow"><span class="rLab">' +
        rating +
        '<svg class="rOne" viewBox="0 0 24 24"><path d="M12 1.8l3.15 6.38 7.04 1.02-5.1 4.97 1.2 7.01L12 17.87l-6.29 3.31 1.2-7.01-5.1-4.97 7.04-1.02z"/></svg></span>' +
        '<div class="rTrack"><div class="rFill" style="width:' +
        width +
        '%"></div></div><span class="rX">' +
        distribution[rating] +
        "x</span></div>";
    }

    reviews.forEach(function (review) {
      var name =
        reviewText(getReviewValue(review, ["fullName", "customerName", "author", "name"])) ||
        "Zákazník";
      var date = reviewDate(getReviewValue(review, ["date", "createdAt", "created", "createdDate"]));
      var text =
        reviewText(getReviewValue(review, ["description", "comment", "message", "text", "content"])) ||
        "Hodnocení zákazníka";
      cards +=
        '<article class="card' +
        (reviews.length === 1 ? " one" : "") +
        '"><div class="name">' +
        escapeReviewHtml(name) +
        '</div><div class="meta">' +
        reviewStars(reviewRating(review)) +
        (date ? '<span class="date">' + escapeReviewHtml(date) + "</span>" : "") +
        '</div><p class="txt">' +
        escapeReviewHtml(text) +
        "</p></article>";
    });

    injectReviewStyles();
    var section = document.createElement("section");
    section.id = "krR";
    section.innerHTML =
      '<div class="container"><h2 class="rt">Recenze</h2><div class="rg"><div class="rs">' +
      '<div class="rTop"><div class="rNum">' +
      average.toFixed(1).replace(".", ",") +
      "</div><div>" +
      reviewStars(average, "rBig") +
      '<div class="rCount">' +
      total +
      ' hodnocení</div></div></div><div class="rBars">' +
      bars +
      '</div><a class="rAdd" href="/hodnoceni-obchodu/">Přidat hodnocení' +
      REVIEW_STAR +
      '</a></div><div class="ra"><div class="rv"><div class="strip">' +
      cards +
      '</div></div><button class="nav prev" aria-label="Předchozí">‹</button>' +
      '<button class="nav next" aria-label="Další">›</button>' +
      '<a class="all" href="/hodnoceni-obchodu/">Zobrazit všechna hodnocení</a></div></div></div>';

    var footer = document.querySelector("#footer");
    if (footer && footer.parentNode) footer.parentNode.insertBefore(section, footer);
    else document.body.appendChild(section);

    var strip = section.querySelector(".strip");
    var previous = section.querySelector(".prev");
    var next = section.querySelector(".next");
    var currentIndex = 0;

    function updateSlider() {
      var visible = window.innerWidth <= 800 ? 1 : 2;
      var maximum = Math.max(0, reviews.length - visible);
      currentIndex = Math.min(currentIndex, maximum);
      strip.style.transform = "translateX(-" + currentIndex * (100 / visible) + "%)";
      previous.disabled = currentIndex <= 0;
      next.disabled = currentIndex >= maximum;
    }

    previous.addEventListener("click", function () {
      currentIndex = Math.max(0, currentIndex - 1);
      updateSlider();
    });
    next.addEventListener("click", function () {
      var visible = window.innerWidth <= 800 ? 1 : 2;
      currentIndex = Math.min(Math.max(0, reviews.length - visible), currentIndex + 1);
      updateSlider();
    });
    window.addEventListener("resize", updateSlider);
    updateSlider();
  }

  function initReviews() {
    if (window.location.pathname !== "/" || document.getElementById("krR")) return;
    fetch("/cache/hodnoceni-obchodu/?jsonFormat", {
      headers: {
        "Content-Type": "application/json",
        "X-Store-Rating-Details": "true"
      }
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Reviews request failed: " + response.status);
        return response.json();
      })
      .then(renderReviews)
      .catch(function (error) {
        if (window.console && typeof window.console.warn === "function") {
          window.console.warn("KRATAS reviews", error);
        }
      });
  }

  function initRecommendations() {
    if (document.getElementById(CONFIG.widgetId)) return;
    var productForm = document.getElementById("product-detail-form");
    var insertionPoint = document.querySelector(".p-info-wrapper .add-to-cart");
    if (!productForm || !insertionPoint || !document.body.classList.contains("type-detail")) {
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

  function init() {
    initFooterIco();
    initReviews();
    initRecommendations();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
