# Kačík

Kachní tunelovka pro prohlížeč. Dvě stejné kačenky se probíjejí hlínou a střílejí malé golfové míčky. Život ubývá sám od sebe, hrabání ho bere podle odporu země a střela bourá rychleji, ale stojí víc. Život se vrací jen ve vlastním krytu, o 40 % rychleji, a až na 100 %. Na té stovce se znovu zapne pancíř. V krytu výstřel nesejme poslední život: když na řádný výstřel není dost, kačenka se zastaví a čeká, než se dobije.

Sestřel dá **2 body**. Účinnost střelby a rychlost střelby stojí 2, pancíř 4. Body se mezi koly neztratí, takže se dají schovat.

V menu se volí délka zápasu: na 3, 5 nebo 8 vítězných kol. Prohrané kolo zápas neskončí, dokud soupeř nenasbírá stejný počet.

Mapa je složená z pásů s různou hustotou, podobně jako arény mají různě natěsnané bloky: písek 1, hlína 2, jíl 4, štěrk 6, skála 9. Mezi nimi stojí pevné pilíře. Hráčova kačenka je žlutá s oranžovým zobákem a při pancíři má stříbrnou helmu, černý průzor a oranžový zobák. Soupeř má rezavou hlavu, černou hruď, světlé tělo, černý zobák s bledým pruhem a červené oko. Po zásahu kvákne, nejdřív za dvě sekundy znovu. V pozadí hraje původní osmibitová smyčka, výstřel má vlastní ránu.

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
- Pole prostřelené míčkem zůstane otevřené až do nového zápasu. Vydlabaný tunel se mezi koly zavře. Nový zápas postaví novou zem.

## Kachna 3310

Druhá hra je na `kachna.html`. Nokia z nočního trhu: fialová kachnička, tyrkysový zobák a číro, růžové brýle. Hráč si zvolí krycí jméno a honí vlastní stín, nejlepší skóre v tomhle prohlížeči.

Synthrohlík dá 10 kvá krát kombo. Kombo drží deset dílků, strop je ×5. Každý čtvrtý rohlík přidá adrenalin a zrychlí ulici. Síň kváknutí je místní výloha, nikam se neposílá.

## Test

`npm test` pustí pravidla Kačíka (`tests/sim.test.js`), jeden průchod hráče (`tests/experience.test.js`) a pravidla Kachny 3310 (`test/logic.test.js`).

Ve hře stačí minuta: Na 3, vyjít z krytu, prostřílet pár polí, vrátit se a počkat na 100 %. Výstřel má být slyšet přes hudbu. Kvákání po zásahu ne častěji než jednou za dvě sekundy.
