# Messaging App

[![codecov](https://codecov.io/gh/aarnif/messaging-app/graph/badge.svg?token=2WL0756H74)](https://codecov.io/gh/aarnif/messaging-app)

Full Stack Open -kurssin projekti: Messaging App

## Vaatimukset

- Node.js (v24 tai uudempi)
- Docker ja Docker Compose (paikallista tietokantaa varten)
- npm

## Kehitys

1. Kloonaa repositorio

   HTTPS:

   ```bash
   git clone https://github.com/aarnif/messaging-app.git
   ```

   SSH:

   ```bash
   git clone git@github.com:aarnif/messaging-app.git
   ```

2. Siirry projektin juurihakemistoon

   ```bash
   cd messaging-app
   ```

3. Asenna kaikki riippuvuudet

   ```bash
   npm run install
   ```

4. Määritä ympäristömuuttujat

   **Backend**

   Luo `.env`-tiedosto `backend`-hakemistoon seuraavilla muuttujilla:

   ```bash
   DATABASE_URL=YOUR_DATABASE_URL_HERE
   JWT_SECRET=YOUR_JWT_SECRET_HERE
   SERVER_URL=YOUR_SERVER_URL_HERE
   WS_URL=YOUR_WS_URL_HERE
   REDIS_URI=YOUR_REDIS_URI_HERE
   CI=false
   ```

   **Vaihtoehto A: Docker PostgreSQL ja Redis (suositeltava kehitykseen)**

   Jos käytät Docker-kontteja, ympäristömuuttujien tulisi olla:

   ```bash
   DATABASE_URL=postgres://postgres:mysecretpassword@localhost:6001/postgres
   JWT_SECRET=your-development-secret-key
   SERVER_URL=http://localhost:4000
   WS_URL=ws://localhost:4000
   REDIS_URI=redis://localhost:6379
   CI=false
   ```

   Käynnistä tietokanta ja Redis Docker-konteissa uudessa terminaalissa (jätä ne käyntiin):

   ```bash
   npm run backend:db:start
   ```

   **Vaihtoehto B: Oma PostgreSQL ja Redis**

   Määritä `DATABASE_URL` ja `REDIS_URI` osoittamaan omiin tietokantoihisi.

   **Frontend**

   Luo `.env.development` ja `.env.production` tiedostot `frontend`-hakemistoon seuraavilla tiedoilla:

   `.env.development`:

   ```bash
   VITE_API_URL=http://localhost:4000
   VITE_WS_URL=ws://localhost:4000
   ```

   `.env.production`:

   ```bash
   VITE_API_URL=YOUR_PRODUCTION_API_URL_HERE
   VITE_WS_URL=YOUR_PRODUCTION_WS_URL_HERE
   ```

5. Lisää seed data tietokantaan

   ```bash
   npm run backend:db:populate
   ```

6. Käynnistä backend kehitystilassa (uudessa terminaalissa)

   ```bash
   npm run backend:dev
   ```

7. Käynnistä frontend kehitystilassa (uudessa terminaalissa)

   ```bash
   npm run frontend:dev
   ```

## npm-komennot

### Yleiset

- `npm run install` - Asenna kaikki sovellusriippuvuudet

### Tietokanta

- `npm run backend:db:start` - Käynnistä PostgreSQL ja Redis Docker-konteissa
- `npm run backend:db:populate` - Lisää seed data tietokantaan

### Backend

- `npm run backend:dev` - Käynnistä backend kehitystilassa
- `npm run backend:prod` - Käynnistä backend tuotantotilassa
- `npm run backend:test` - Suorita backendin testit
- `npm run backend:typecheck` - Suorita TypeScript-tyyppitarkistus backendille
- `npm run backend:lint` - Suorita linttaus backendin koodille
- `npm run backend:generate` - Generoi GraphQL-tyypit

### Frontend

- `npm run frontend:dev` - Käynnistä frontend kehitystilassa
- `npm run frontend:build` - Buildaa frontend tuotantoa varten
- `npm run frontend:preview` - Esikatsele tuotantobuild paikallisesti
- `npm run frontend:test` - Suorita frontendin testit
- `npm run frontend:test:coverage` - Suorita frontendin testit kattavuusraportin kanssa
- `npm run frontend:typecheck` - Suorita TypeScript-tyyppitarkistus käyttöliittymälle
- `npm run frontend:lint` - Suorita linttaus frontendin koodille
- `npm run frontend:generate` - Generoi GraphQL-tyypit

### End-to-End-testaus

- `npm run e2e:test` - Suorita Playwright end-to-end-testit
