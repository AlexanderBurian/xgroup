# xgroup

Frontend doplňky pro Shoptet.

## Kratas.cz – doporučené produkty

Do pole **Vzhled a obsah → Editor → HTML kód → Zápatí** vložte obsah souboru
`shoptet-footer-loader.html`.

Loader používá konkrétní commitovou URL, aby prohlížeč nemohl držet starší
verzi skriptu z dlouhodobé cache CDN.

Jediný loader zajišťuje také nastavení homepage carouselu, návratový titulek
neaktivní karty, popup „Zboží přidáno do košíku“ (otevře se hned po kliknutí,
nativní zelenou bublinu Shoptetu skryje) a zvýraznění kategorie VELKOOBCHOD v menu.
(Homepage recenze a IČO v zápatí byly odebrány v 04a5e69.)

Loader načítá také registrační nabídku pro nepřihlášené návštěvníky. Zobrazí se
nejvýše jednou za dva dny, neotvírá se v košíku, objednávce ani zákaznickém účtu
a počká na zavření cookie lišty. Přihlášenému zákazníkovi na detailu produktu
vysvětlí nativní 5% cenu pouze tehdy, když ji Shoptet u daného produktu skutečně
vrátí.

Na všech stránkách také přidá horní zelený promo pruh „SLEVA 10% NA VŠE : NAVSE10“
s odpočtem do nejbližší neděle 24:00 (Europe/Prague); po vypršení se sám přepne
na další neděli. Text a kód se mění v bloku `__xgKratasPromo`.
Pruh se zapíná/vypíná proměnnou `PROMO_ON` v tomto bloku (aktuálně vypnuto).

Produktový widget se vykreslí jen na detailu produktu. Načte první tři koupitelné položky
z aktuální kategorie detailu, vynechá právě otevřený produkt a zaškrtnuté
položky přidá do košíku společně s hlavním produktem přes nativní Shoptet
JavaScript API.
