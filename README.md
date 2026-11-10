# Kačík

Aktuální verze je **15**. Číslo je v `js/version.js`, v Kačíkovi uprostřed nahoře a v titulku karty. Na telefonu se chodí kruhovým kniplem a střílí kulatým tlačítkem. Záznam verzí je v [docs/verze.md](docs/verze.md). Při každé změně hry se číslo zvedne o jedna, nahoru do záznamu přibude odstavec a nápis na stránkách se srovná se stejným číslem.

Kachní tunelovka pro prohlížeč. Dvě stejné kačenky se probíjejí hlínou a střílejí malé golfové míčky. Život ubývá sám od sebe, hrabání ho bere podle odporu země a střela bourá rychleji, ale stojí víc. Život se vrací jen ve vlastním krytu, o 40 % rychleji, a až na 100 %. Na té stovce se znovu zapne pancíř. V krytu výstřel nesejme poslední život: když na řádný výstřel není dost, kačenka se zastaví a čeká, než se dobije.

Sestřel dá **2 body**. Účinnost střelby a rychlost střelby stojí 2, pancíř 4. Body se mezi koly neztratí, takže se dají schovat. Koupené vylepšení zůstává celý zápas.

V zemi leží pár kachních kostiček a nálezů, ale nejsou vidět. Až na ně kačenka najede, nad ní se rozletí jiskry a nápis, co získala. Kostička přidá průraz nebo kadenci hned a ještě na příští kolo. Když v tom příštím kole někdo zemře, bonus zmizí a střelba je zase jen ta koupená. Napořád nezůstane. Když jsi nekupoval, střelba je znovu ta výchozí.

V menu se volí délka zápasu: na 3, 5 nebo 8 vítězných kol. Prohrané kolo zápas neskončí, dokud soupeř nenasbírá stejný počet. Výhra na ten počet kol se ohlásí větou: Vítězství! Nechť tě kachní síla provází.

Mapa je složená z pásů s různou hustotou, podobně jako arény mají různě natěsnané bloky: písek 1, hlína 2, jíl 4, štěrk 6, skála 9. Mezi nimi stojí pevné pilíře. V klasickém vzhledu je hráčova kačenka žlutá s oranžovým zobákem a při pancíři má stříbrnou helmu, černý průzor a oranžový zobák. Soupeř je světle šedá kulatá kachna s oranžovým zobákem a třemi ocasními pery. V cyberpunku má hráčova kačenka tělo ze dvou fialových, zobák a obrys tyrkysové, zem je z fialových kostek se tyrkysovou spárou a soupeř je černobílý. Po zásahu kvákne, nejdřív za dvě sekundy znovu. V pozadí hraje původní osmibitová smyčka, výstřel má vlastní ránu.

## Hraní

```bash
npm start
```

Pak otevři `http://localhost:8765`.

Na telefonu je vlevo kruhový knipl a vpravo kulatá střelba. Šipky nebo WASD hrabou (jde to i šikmo). Mezerník střílí. M ztlumí zvuk, Esc nebo tlačítko Pauza je pauza.

V menu jsou tři obtížnosti a dva vzhledy: klasická paleta ve stylu Tunneleru a cyberpunk (dvě fialové na kostkách i na kačence, tyrkysový zobák, obrys a potrubí, soupeř černobílý).

## Pravidla kol

- Soupeř používá stejné hrabání, střelbu, úbytek života a dobíjení ve svém krytu.
- Každé kolo si soupeř postaví kryt jinde. Každá hra začíná jiným rozložením.
- Z krytu se jde ven na všechny čtyři strany. Dobít se dá v každém krytu, vlastním i soupeřově.
- Po výhře kola jdeš do DuckShopu, nebo ho vynecháš. GhostDuck, laser, trojstřel, rychlost chůze, Zbíječka a nezranitelnost se kupují za body a koupené stupně drží celý zápas. V zemi jsou navíc nálezy.
- Kačenky se do sebe zaseknou. Střela nechá na zdi a skále šrám a míček má krátkou stopu. Laser řeže natrvalo. Zásah chvíli nepočítá znovu.
- Na radaru se občas mihne nepřesná tečka. Blízké hrabání je slyšet.
- Světlo z kačenky neprochází hlínou. Vlastní tunely zůstávají v paměti tmavší.
- Na těžké obtížnosti má soupeř od začátku krátký pancíř. S každým dalším kolem je ostřejší.
- Čím vyšší hustota, tím dražší hrabání. Skála se míčkem láme na třikrát.
- Pole prostřelené míčkem zůstane otevřené až do nového zápasu. Vydlabaný tunel se mezi koly zavře. Nový zápas postaví novou zem.

## Kachna 3310

Druhá hra je na `kachna.html`. Nokia z nočního trhu: fialová kachnička, tyrkysový zobák a číro, růžové brýle. Hráč si zvolí krycí jméno a honí vlastní stín, nejlepší skóre v tomhle prohlížeči.

Synthrohlík dá 10 kvá krát kombo. Kombo drží deset dílků, strop je ×5. Každý čtvrtý rohlík přidá adrenalin a zrychlí ulici. Síň kváknutí je místní výloha, nikam se neposílá.

## Test

`npm test` pustí pravidla Kačíka (`tests/sim.test.js`), jeden průchod hráče (`tests/experience.test.js`), pravidla Kachny 3310 (`test/logic.test.js`) a shodu čísla verze (`tests/version.test.js`).

Ve hře stačí minuta: Na 3, vyjít z krytu, prostřílet pár polí, vrátit se a počkat na 100 %. Výstřel má být slyšet přes hudbu. Kvákání po zásahu ne častěji než jednou za dvě sekundy.
