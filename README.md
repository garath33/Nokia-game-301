# kacik

Verze 1. Hra se jmenuje kacik a je určená pro Nokii 301. Displej je na výšku, 240×320 bodů, úhlopříčka 2,4 palce. Telefon nemá dotyk: pohyb je pětičlenný kříž, dvě měkké klávesy a číselnice. V prohlížeči na počítači se hraje jen jako náhled. Rozhraní, písmo i ovládání se posuzují podle téhle obrazovky, ne podle širokého monitoru.

Kachní tunelovka pro prohlížeč. Dvě stejné kačenky se probíjejí hlínou a střílejí malé golfové míčky. Život ubývá sám od sebe, hrabání ho bere podle odporu země a střela bourá rychleji, ale stojí víc. Dobít se dá jen ve vlastním krytu, pomalu, až na 100 %. Na té stovce se znovu zapne pancíř.

Sestřel dá **2 body**. V DuckShopu stojí vylepšení 2 body, GhostDuck a pancíř 4. V mapě je nález zhruba na každých 30 políčkách a každé kolo leží jinde. Hráč začíná každé kolo vlevo, soupeř vpravo.

V menu se volí délka zápasu: na 3, 5 nebo 8 vítězných kol. Prohrané kolo zápas neskončí, dokud soupeř nenasbírá stejný počet.

Mapa je ve vlnitých vrstvách: písek 1, hlína 2, jíl 4, štěrk 6, skála 9. Mezi nimi stojí pevné pilíře. Kačenka je žlutá s oranžovým zobákem. Po zásahu kvákne, nejdřív za dvě sekundy znovu, a čtvrt sekundy další střela nepočítá. Míček má krátkou stopu. Hudba a rány se ztlumují zvlášť.

## Hraní na počítači

Hra nemá vlastní okno programu. Otevře se v prohlížeči.

Ve složce hry spusť:

```bash
python3 serve.py
```

Příkaz vypíše adresu, obvykle `http://127.0.0.1:8765`. Tu zadej do Chromu, Firefoxu nebo Edge. Terminál nech běžet, hra v něm stojí. Vypne se klávesami Ctrl+C.

Když terminál napíše, že adresa už je obsazená (`Address already in use`), server už běží. Druhý start není potřeba, stačí otevřít tu adresu v prohlížeči.

`npm start` dělá totéž. V novém terminálu ale npm někdy není vidět a napíše `npm: command not found`. `python3 serve.py` npm nepotřebuje.

Šipky nebo WASD hrabou (jde to i šikmo). Mezerník střílí. M přepíná hudbu (zapnuto, potichu, vypnuto). Rány mají v menu vlastní tlačítko. Esc je pauza.

V menu jsou tři obtížnosti a dva vzhledy: klasická paleta ve stylu Tunneleru a cyberpunk (tyrkys, fialová, laserová červeň).

## Pravidla kol

- Soupeř používá stejné hrabání, střelbu, úbytek života a dobíjení ve svém krytu.
- Každé kolo si soupeř postaví kryt jinde. Každá hra začíná jiným rozložením.
- Na radaru se občas mihne nepřesná tečka. Blízké hrabání je slyšet. Výstřel mimo dohled ukáže na chvíli směr.
- Po výhře se dá jít do obchodu, nebo ho vynechat a hrát dál. Body zůstanou.
- Světlo z kačenky neprochází hlínou. Vlastní tunely zůstávají v paměti tmavší.
- Zásah bez vylepšení bere 30 % života. Střela stojí 5,1 života.
- Z krytu se jde ven na všechny čtyři strany. Obě kačenky jsou stejně rychlé, i v pozdějších kolech.
- Na těžké obtížnosti má soupeř od začátku krátký pancíř. S každým dalším kolem reaguje rychleji, ale neběží rychleji.
- Čím vyšší hustota, tím dražší hrabání. Skála se míčkem láme na třikrát.

## Test

`npm test` pustí pravidla (`tests/sim.test.js`) a jeden průchod hráče (`tests/experience.test.js`): hrabání podle hustoty, cenu střely, návrat do krytu a konec zápasu na zvolený počet výher.

Ve hře stačí minuta: Na 3, vyjít z krytu, prostřílet pár polí, vrátit se a počkat na 100 %. Výstřel má být slyšet přes hudbu. Kvákání po zásahu ne častěji než jednou za dvě sekundy.
