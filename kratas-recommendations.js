(function () {
  "use strict";

  var CONFIG = {
    categoryUrl: "/prislusenstvi/",
    limit: 3,
    widgetId: "xg-kratas-recommendations",
    title: "Doporučujeme přidat k nákupu",
    subtitle: "Zaškrtněte, co chcete přidat do košíku spolu s tímto produktem."
  };

  if (document.getElementById(CONFIG.widgetId)) return;

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
      var addButton = card.querySelector(
        ".add-to-cart-button, [data-testid='buttonAddToCart']"
      );

      if (
        !id ||
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
    checkbox.checked = true;
    checkbox.value = product.id;
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
        "box-sizing:border-box;width:100%;margin:24px 0;padding:22px 22px 12px;" +
        "border:1px solid var(--colors-foregrounds-borders-secondary,#dadada);" +
        "border-radius:var(--apollo-zaoblenie,0);background:var(--colors-surface-primary,#fff);" +
        "color:var(--colors-foregrounds-content-primary,#1f1f1f);font-family:inherit" +
      "}" +
      "#" + CONFIG.widgetId + " *,#" + CONFIG.widgetId + " *:before,#" + CONFIG.widgetId + " *:after{box-sizing:border-box}" +
      "#" + CONFIG.widgetId + " .xg-rec__title{margin:0 0 3px;font:700 20px/1.25 inherit;color:inherit}" +
      "#" + CONFIG.widgetId + " .xg-rec__subtitle{margin:0 0 14px;color:var(--colors-foregrounds-content-secondary,#4d4d4d);font:400 14px/1.45 inherit}" +
      "#" + CONFIG.widgetId + " .xg-rec__list{display:block}" +
      "#" + CONFIG.widgetId + " .xg-rec__item{display:grid;grid-template-columns:26px 72px minmax(0,1fr) 24px max-content;align-items:center;gap:12px;min-height:88px;padding:8px 0}" +
      "#" + CONFIG.widgetId + " .xg-rec__check-label{position:relative;display:block;width:24px;height:24px;margin:0;cursor:pointer}" +
      "#" + CONFIG.widgetId + " .xg-rec__checkbox{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}" +
      "#" + CONFIG.widgetId + " .xg-rec__check-mark{display:block;width:24px;height:24px;border:2px solid var(--colors-foregrounds-borders-primary,#919191);border-radius:6px;background:#fff;transition:background .15s,border-color .15s,box-shadow .15s}" +
      "#" + CONFIG.widgetId + " .xg-rec__checkbox:checked+.xg-rec__check-mark{border-color:var(--color-primary,#2093d9);background:var(--color-primary,#2093d9)}" +
      "#" + CONFIG.widgetId + " .xg-rec__checkbox:checked+.xg-rec__check-mark:after{content:'';display:block;width:10px;height:6px;margin:6px 0 0 5px;border-left:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(-45deg)}" +
      "#" + CONFIG.widgetId + " .xg-rec__checkbox:focus-visible+.xg-rec__check-mark{outline:3px solid var(--colors-focus-primary,#09367e);outline-offset:2px}" +
      "#" + CONFIG.widgetId + " .xg-rec__image-link{display:flex;width:72px;height:72px;align-items:center;justify-content:center;border:1px solid var(--colors-foregrounds-borders-secondary,#dadada);background:#fff;overflow:hidden}" +
      "#" + CONFIG.widgetId + " .xg-rec__image{display:block;width:100%;height:100%;object-fit:contain}" +
      "#" + CONFIG.widgetId + " .xg-rec__content{min-width:0}" +
      "#" + CONFIG.widgetId + " .xg-rec__name{display:block;color:inherit;font:700 15px/1.3 inherit;text-decoration:none}" +
      "#" + CONFIG.widgetId + " .xg-rec__name:hover{color:var(--color-primary-hover,#2ebd46)}" +
      "#" + CONFIG.widgetId + " .xg-rec__description{display:-webkit-box;margin-top:3px;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;color:var(--colors-foregrounds-content-tertiary,#767676);font:400 13px/1.35 inherit}" +
      "#" + CONFIG.widgetId + " .xg-rec__info{display:flex;width:20px;height:20px;align-items:center;justify-content:center;border:1px solid var(--colors-foregrounds-borders-primary,#919191);border-radius:50%;color:var(--colors-foregrounds-content-tertiary,#767676);font:700 12px/1 inherit;text-decoration:none}" +
      "#" + CONFIG.widgetId + " .xg-rec__info:hover{border-color:var(--color-primary,#2093d9);color:var(--color-primary,#2093d9)}" +
      "#" + CONFIG.widgetId + " .xg-rec__price{padding-left:4px;color:inherit;font:700 16px/1.25 inherit;white-space:nowrap;text-align:right}" +
      "@media(max-width:767px){" +
        "#" + CONFIG.widgetId + "{margin:18px 0;padding:18px 14px 10px}" +
        "#" + CONFIG.widgetId + " .xg-rec__title{font-size:18px}" +
        "#" + CONFIG.widgetId + " .xg-rec__item{grid-template-columns:24px 56px minmax(0,1fr) 20px;gap:9px;min-height:78px}" +
        "#" + CONFIG.widgetId + " .xg-rec__image-link{width:56px;height:56px}" +
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
    var pendingIds = [];
    var extraInFlight = false;

    productForm.addEventListener(
      "submit",
      function () {
        pendingIds = Array.prototype.map.call(
          widget.querySelectorAll(".xg-rec__checkbox:checked"),
          function (checkbox) {
            return checkbox.value;
          }
        );
        extraInFlight = false;
      },
      true
    );

    document.addEventListener("ShoptetCartAddCartItem", function () {
      if (!pendingIds.length) {
        extraInFlight = false;
        return;
      }

      if (extraInFlight) extraInFlight = false;
      if (extraInFlight || !pendingIds.length) return;

      var productId = pendingIds.shift();
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
            { productId: Number(productId), amount: 1 },
            true
          );
        } catch (error) {
          pendingIds = [];
          extraInFlight = false;
          if (window.console && typeof window.console.error === "function") {
            window.console.error("[xgroup] Recommendation could not be added.", error);
          }
        }
      }, 0);
    });
  }

  function init() {
    var productForm = document.getElementById("product-detail-form");
    var insertionPoint = document.querySelector(".p-info-wrapper .add-to-cart");
    if (!productForm || !insertionPoint || !document.body.classList.contains("type-detail")) {
      return;
    }

    fetch(CONFIG.categoryUrl, { credentials: "same-origin" })
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
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
