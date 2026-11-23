const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const source = fs.readFileSync(path.join(__dirname, "..", "kratas-register-offer.js"), "utf8");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function page(body, pathname = "/") {
  return new JSDOM(`<!doctype html><html><head></head><body>${body}</body></html>`, {
    url: `https://www.kratas.cz${pathname}`,
    runScripts: "dangerously",
    pretendToBeVisual: true
  });
}

(async () => {
  const guest = page('<nav id="navigation"><a data-testid="signin" href="/login/">Přihlášení</a></nav>');
  guest.window.eval(source);
  await wait(1400);
  const popup = guest.window.document.querySelector(".xg-kro");
  assert.ok(popup, "guest sees the offer");
  assert.equal(popup.querySelector(".xg-kro__cta").getAttribute("href"), "/registrace/");
  assert.equal(popup.querySelector(".xg-kro__login").getAttribute("href"), "/login/");
  assert.ok(Number(guest.window.localStorage.getItem("xg-kratas-register-offer-v1")) > 0);
  guest.window.close();

  const returning = page('<nav id="navigation"><a data-testid="signin" href="/login/">Přihlášení</a></nav>');
  returning.window.localStorage.setItem("xg-kratas-register-offer-v1", String(Date.now()));
  returning.window.eval(source);
  await wait(1400);
  assert.equal(returning.window.document.querySelector(".xg-kro"), null, "two-day gate suppresses repeat view");
  returning.window.close();

  const member = page(`
    <div id="content"><div class="p-detail">
      <div class="p-final-price-wrapper"><strong class="price-final">750 Kč</strong><span class="price-standard">789 Kč</span><span class="price-save">−5 %</span></div>
    </div></div>
  `, "/produkt/");
  member.window.eval(source);
  await wait(100);
  assert.equal(member.window.document.querySelector(".xg-kro"), null, "signed-in customer never sees offer");
  assert.match(member.window.document.querySelector(".xg-kmp").textContent, /Sleva 5 %/);
  assert.match(member.window.document.querySelector(".xg-kmp").textContent, /běžně 789 Kč/);
  member.window.close();

  const guestProduct = page(`
    <nav id="navigation"><a data-testid="signin" href="/login/">Přihlášení</a></nav>
    <div id="content"><div class="p-detail">
      <div class="p-final-price-wrapper"><strong class="price-final">750 Kč</strong><span class="price-standard">789 Kč</span><span class="price-save">−5 %</span></div>
    </div></div>
  `, "/produkt/");
  guestProduct.window.eval(source);
  await wait(100);
  assert.equal(guestProduct.window.document.querySelector(".xg-kmp"), null, "guest never sees member-price explanation");
  guestProduct.window.close();

  console.log("register-offer tests passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
