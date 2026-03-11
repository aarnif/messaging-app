# Testaus

Sovelluksen testaus koostuu automaattisista yksikkö-, integraatio- ja järjestelmätesteistä. Näistä yksikkötestit on toteutettu `vitest` kirjastolla, intergraatiotestit `Node.js` mukana tulevalla `test-runner` kirjastolla ja järjestelmätestit `playwright` testikirjastolla.

## Yksikkötestaus

Sovelluksen `React` käyttöliittymä komponentteja testaavat yksikkötestit sijaitsevat `frontend/src/tests` hakemistossa. Koska osalla komponenteista on alikomponentteja saavat nämä testit myös integraatiotestien piirteitä. Testit voi suorittaa komennolla `npm run test:frontend`.

## Integraatiotestaus

Sovelluksen `GraphQL`-rajapinnan resolvereita kokonaisuudessaan testaavat testit sijaitsevat `backend/src/tests` hakemistossa. Rajapinnan osalta voitaisiin puhua myös järjestelmätesteistä, mutta koska rajapinta on vain osa sovellusta, ovat nämä testin luokiteltu integraatiotestien alle. Testit voi suorittaa komennolla `npm run test:backend`.
Rajapinnan testit vaativat myös käynnissä olevan tietokannan, jonka voi käynnistää komennolla `npm run start:db`. Tietokannan taulut ja seed-datan voi luoda komennolla `npm run populate:db`.

## Järjestelmätestaus

Sovelluksen järjestelmätestit sijaitsevat `e2e-tests` hakemistossa. Ne testaavat sovelluksen toiminnallisuuksia alusta loppuun. Testit voi suorittaa komennolla `npm run test:e2e`. Tätä ennen sovellus täytyy käynnistää [käyttöohjeessa](./kayttoohje.md) mainittujen ohjeiden mukaan.

Sovellusta on testattu myös manuaalisesti suorittamalla kaikki sovelluksen toiminnallisuudet käyttöliittymästä käsin. Tämä pitää sisällään myös virheelliset ja tyhjät syötteet. Käyttöjärjestelmät joilla sovellusta on testattu ovat macOS Ventura, Sequoia ja Tahoe.

## Testikattavuus

Sovelluksella on testikattavuus sekä `backend` että `frontend` hakemistoille. Palvelimen integraatiotestien testikattavuus on toteutettu `c8` kirjastolla ja käyttöliittymän yksikkötestien `vitest coverage` kirjastolla. Testikattavuusraportti löytyy [Codecov](https://app.codecov.io/gh/aarnif/messaging-app) palvelusta.
