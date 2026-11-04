# Kačík

Kachní tunelovka pro prohlížeč. Dvě stejné kačenky se probíjejí hlínou a střílejí malé golfové míčky. Život ubývá sám od sebe, hrabání ho bere podle odporu země a střela bourá rychleji, ale stojí víc. Dobít se dá jen ve vlastním krytu, pomalu, až na 100 %. Na té stovce se znovu zapne pancíř.

Sestřel dá **2 body**. Účinnost střelby a rychlost střelby stojí 2, pancíř 4. Body se mezi koly neztratí, takže se dají schovat.

V menu se volí délka zápasu: na 3, 5 nebo 8 vítězných kol. Prohrané kolo zápas neskončí, dokud soupeř nenasbírá stejný počet.

Mapa je složená z pásů s různou hustotou, podobně jako arény mají různě natěsnané bloky: písek 1, hlína 2, jíl 4, štěrk 6, skála 9. Mezi nimi stojí pevné pilíře. Kačenka je žlutá s oranžovým zobákem. Po zásahu kvákne, nejdřív za dvě sekundy znovu. V pozadí hraje původní osmibitová smyčka, výstřel má vlastní ránu.

## Hraní

```bash
npm start
```

Pak otevři `http://localhost:8765`.

Šipky nebo WASD hrabou (jde to i šikmo). Mezerník střílí. M ztlumí zvuk, Esc je pauza.

V menu jsou tři obtížnosti a dva vzhledy: klasická paleta ve stylu Tunneleru a cyberpunk (tyrkys, fialová, laserová červeň).

## Pravidla kol

- Soupeř používá stejné hrabání, střelbu, úbytek života a dobíjení ve svém krytu.
- Každé kolo si soupeř postaví kryt jinde. Každá hra začíná jiným rozložením.
- Na radaru se občas mihne nepřesná tečka. Blízké hrabání je slyšet.
- Světlo z kačenky neprochází hlínou. Vlastní tunely zůstávají v paměti tmavší.
- Na těžké obtížnosti má soupeř od začátku krátký pancíř. S každým dalším kolem je ostřejší.
- Čím vyšší hustota, tím dražší hrabání. Skála se míčkem láme na třikrát.

## Test

`npm test` pustí pravidla (`tests/sim.test.js`) a jeden průchod hráče (`tests/experience.test.js`): hrabání podle hustoty, cenu střely, návrat do krytu a konec zápasu na zvolený počet výher.

Ve hře stačí minuta: Na 3, vyjít z krytu, prostřílet pár polí, vrátit se a počkat na 100 %. Výstřel má být slyšet přes hudbu. Kvákání po zásahu ne častěji než jednou za dvě sekundy.
