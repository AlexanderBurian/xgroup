# xgroup

Frontend doplňky pro Shoptet.

## Kratas.cz – doporučené produkty

Do pole **Vzhled a obsah → Editor → HTML kód → Zápatí** vložte obsah souboru
`shoptet-footer-loader.html`.

Loader používá konkrétní commitovou URL, aby prohlížeč nemohl držet starší
verzi skriptu z dlouhodobé cache CDN.

Jediný loader zajišťuje také nastavení homepage carouselu, homepage recenze,
návratový titulek neaktivní karty a doplnění IČO v zápatí.

Na všech stránkách také přidá horní zelený promo pruh „SLEVA 10% NA VŠE : NAVSE10“
s odpočtem do nejbližší neděle 24:00 (Europe/Prague); po vypršení se sám přepne
na další neděli. Text a kód se mění v bloku `__xgKratasPromo`.

Produktový widget se vykreslí jen na detailu produktu. Načte první tři koupitelné položky
z aktuální kategorie detailu, vynechá právě otevřený produkt a zaškrtnuté
položky přidá do košíku společně s hlavním produktem přes nativní Shoptet
JavaScript API.
