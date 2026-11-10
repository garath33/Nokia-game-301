# Verze Kačíka

Číslo verze je jediné: `GAME_VERSION` v `js/version.js`. V Kačíkovi je nápis `verze N` uprostřed nahoře a pod názvem v menu. V Kachně 3310 je vlevo dole. Stejné číslo je v titulku karty prohlížeče. Nová změna hry zvedne číslo o jedna a připíše sem záznam nahoru. `npm test` hlídá, že číslo v kódu, na obou stránkách a tady v prvním záznamu je totéž.

Verze 9 je starší zveřejněná hra na větvi `cursor/tunik-duck-tunneler-47a0`. Tahle řada začala na 10. Od 11 je v ní kruhový knipl z verze 9.

## 15 — 10. 11. 2026

Hudba a efekty jdou zase zapnout a vypnout zvlášť, v menu i v pauze. M přepíná hudbu, N efekty. Místo jedné smyčky jsou čtyři skladby: Pochod, Bažina, Rychlík a Kolébka. Každé kolo si vylosuje jinou než tu minulou. Uvnitř se po průchodu střídá druhý hlas, aby se melodie pořád neopakovala.

## 14 — 9. 11. 2026

Složená je tahle řada s větví, která už byla na hlavní. Výbuch dál okusuje pevnou zeď a zásah do zdi nechá flek, který zmizí. GhostDuck, křížový šrám a stopa míčku zůstávají. Pull request kvůli tomu už nejde sloučit s konfliktem.

## 13 — 6. 11. 2026

Do téhle hry se přeneslo, co bylo ve verzi 9 a tady chybělo. DuckShop má rychlost chůze, trojstřel, Zbíječku, nezranitelnost, GhostDuck a laser. Po výhře kola se dá obchod otevřít, nebo přeskočit. Dobíjení funguje v každém krytu. Kačenky se do sebe zaseknou. Střela nechá šrám, míček má stopu a zásah čtvrt sekundy nepočítá znovu. V zemi leží nálezy. Výhra na kola, kostičky a vzhled kačenek zůstávají.

## 12 — 6. 11. 2026

Nápis verze sedí ve volném pruhu nad panely, linka panelu ho nepřekrývá. Kryt má zase čtyři východy, na každé straně jeden. Jeden východ se ztratil ve funkci `carveBunker`, když se hra rozešla od verze 9. Tam se otvíraly všechny čtyři strany.

## 11 — 6. 11. 2026

Na telefonu je znovu kruhový knipl a kulaté tlačítko střelby, mezi nimi Pauza. Šipkový kříž z verze 10 je pryč. Výhra na kola, kostičky, text nad kačenou a vzhled soupeře zůstávají.

Ve verzi 9 a v téhle hře dál není totéž. Verze 9 má navíc GhostDuck, šrámy po střele, stopu míčku, dobíjení i v cizím krytu a nabídku přeskočit obchod. Tahle řada je nemá, protože by přepsaly zápas, který se stavěl potom: výhru na kola, kostičky a vzhled kačenek.

## 10 — 6. 11. 2026

První zapsaná verze. Číslo je vidět ve hře. Hra umí výhru na 3, 5 nebo 8 kol s větou „Vítězství! Nechť tě kachní síla provází.“ Kostička přidá průraz nebo kadenci do konce příštího kola a nález se ukáže jako text nad kačenou: „Získáváš… Zbiječku!“ Koupená vylepšení drží celý zápas. Soupeř je světle šedá kulatá kachna s oranžovým zobákem a třemi pery, v cyberpunku černobílá.
