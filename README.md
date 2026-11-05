# kacik

Verze 3. Hra se jmenuje kacik a je určená pro Nokii 301. Displej je na výšku, 240×320 bodů, úhlopříčka 2,4 palce. Telefon nemá dotyk: pohyb je pětičlenný kříž, dvě měkké klávesy a číselnice. V prohlížeči na počítači se hraje jen jako náhled. Rozhraní, písmo i ovládání se posuzují podle téhle obrazovky, ne podle širokého monitoru.

Kachní tunelovka pro prohlížeč. Dvě stejné kačenky se probíjejí hlínou a střílejí malé golfové míčky. Život ubývá sám od sebe, hrabání ho bere podle odporu země a střela bourá rychleji, ale stojí víc. Dobít se dá jen ve vlastním krytu, pomalu, až na 100 %. Na té stovce se znovu zapne pancíř.

Sestřel dá **2 body**. V DuckShopu stojí vylepšení 2 body, GhostDuck a pancíř 4. V mapě je nález zhruba na každých 30 políčkách a každé kolo leží jinde. Hráč začíná každé kolo vlevo, soupeř vpravo.

V menu se volí délka zápasu: na 3, 5 nebo 8 vítězných kol. Prohrané kolo zápas neskončí, dokud soupeř nenasbírá stejný počet.

Mapa je ve vlnitých vrstvách: písek 1, hlína 2, jíl 4, štěrk 6, skála 9. Mezi nimi stojí pevné pilíře. Kačenka je žlutá s oranžovým zobákem. Po zásahu kvákne, nejdřív za dvě sekundy znovu, a čtvrt sekundy další střela nepočítá. Míček má krátkou stopu. Hudba a rány se ztlumují zvlášť.

## Hraní na počítači

Hra nemá vlastní okno programu. Běží v prohlížeči, a jen na tom počítači, kde jsi spustil příkaz níž. Adresa `127.0.0.1` v prohlížeči znamená „tento počítač“. Když příkaz běží ve vzdáleném terminálu Cursoru a prohlížeč máš na svém PC, stránka se neotevře a Chrome napíše, že web odmítl připojení.

Hra poslouchá jen na portu **8765**. Adresa je vždy:

`http://127.0.0.1:8765`

Port 18765 hra nepoužívá. Na něm prohlížeč spojení odmítne.

Ve složce hry, v terminálu na svém počítači:

```bash
python3 serve.py status
python3 serve.py stop
python3 serve.py
```

`status` řekne, jestli hra běží. `stop` ji vypne a uvolní port. Poslední příkaz ji spustí a vypíše adresu i číslo verze. Terminál nech otevřený. V Chromu, Firefoxu nebo Edge otevři přesně vypsanou adresu. Vypnutí je Ctrl+C v tom terminálu, nebo v druhém okně `python3 serve.py stop`.

Když už jedna kopie běží, druhý start ji nespouští znovu a jen zopakuje adresu. `npm` k tomu není potřeba. Když ho máš, `npm start` dělá totéž co `python3 serve.py`.

## Nová verze

Číslo verze je v `js/game.js` (`GAME_VERSION`). Při startu ho terminál vypíše a stejné číslo je na úvodní obrazovce.

1. `python3 serve.py stop`
2. Vezmi nový kód (`git pull`, nebo nech doběhnout úpravu ve složce).
3. `python3 serve.py`
4. Otevři `http://127.0.0.1:8765` a obnov stránku klávesami Ctrl+F5.

Na stránce musí být stejné číslo verze jako v terminálu. Server posílá stránku bez uložení do mezipaměti, takže po obnovení vidíš kód, který právě běží.

## Pixel 8

Na telefonu se hraje zveřejněná stránka, ne server z počítače. Ten poslouchá jen na tom samém stroji. V zápasu je vlevo kruhový knipl: střed je klid a prst od středu určuje směr, i šikmo. Vpravo je kulaté tlačítko střelby.

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
