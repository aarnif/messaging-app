# Testaus

Sovelluksen testaus koostuu automaattisista yksikkö-, integraatio- ja järjestelmätesteistä. Näistä yksikkötestit on toteutettu `vitest` kirjastolla, intergraatiotestit `Node.js` mukana tulevalla `test-runner` kirjastolla ja järjestelmätestit `playwright` testikirjastolla.

## Yksikkötestaus

Sovelluksen `React` käyttöliittymä komponentteja testaavat yksikkötestit sijaitsevat `ui/src/tests` hakemistossa. Koska osalla komponenteista on alikomponentteja saavat nämä testit myös integraatiotestien piirteitä. Testit voi suorittaa komennolla `npm run test:ui`.

## Integraatiotestaus

Sovelluksen `GraphQL`-rajapinnan resolvereita kokonaisuudessaan testaavat testit sijaitsevat `server/src/tests` hakemistossa. Rajapinnan osalta voitaisiin puhua myös järjestelmätesteistä, mutta koska rajapinta on vain osa sovellusta, ovat nämä testin luokiteltu integraatiotestien alle. Testit voi suorittaa komennolla `npm run test:server`.
Rajapinnan testit vaativat myös käynnissä olevan tietokannan, jonka voi käynnistää komennolla `npm run start:db`. Tietokannan taulut ja seed-datan voi luoda komennolla `npm run populate:db`.

## Järjestelmätestaus

Sovelluksen järjestelmätestit sijaitsevat `e2e-tests` hakemistossa. Ne testaavat sovelluksen toiminnallisuuksia alusta loppuun. Testit voi suorittaa komennolla `npm run test:e2e`. Tätä ennen sovellus täytyy käynnistää [käyttöohjeessa](./kayttoohje.md) mainittujen ohjeiden mukaan.

Sovellusta on testattu myös manuaalisesti suorittamalla kaikki sovelluksen toiminnallisuudet käyttöliittymästä käsin. Tämä pitää sisällään myös virheelliset ja tyhjät syötteet. Käyttöjärjestelmät joilla sovellusta on testattu ovat macOS Ventura, Sequoia ja Tahoe.

## Testikattavuus

Tällä hetkellä vain `ui` hakemiston käyttöliittymä komponentteja testaaville yksikkötesteille on olemassa testikattavuus. Se on toteutettu `vitest coverage` kirjastolla.

![Testikattavuus](images/testikattavuus.png)

Haarautumakattavuus hakemistossa `ui/src/components` sijaitsevien pääkomponenttien osalta on 87.29% ja niitä tukevien hakemistossa `ui/src/ui` sijaitsevien pienempien komponenttien osalta 94.11%.
