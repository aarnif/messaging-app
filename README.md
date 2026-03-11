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
   npm run start:db
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
   npm run populate:db
   ```

6. Käynnistä backend kehitystilassa (uudessa terminaalissa)

   ```bash
   npm run dev:backend
   ```

7. Käynnistä frontend kehitystilassa (uudessa terminaalissa)

   ```bash
   npm run dev:frontend
   ```

## npm-komennot

### Yleiset

- `npm run install` - Asenna kaikki sovellusriippuvuudet

### Tietokanta

- `npm run start:db` - Käynnistä PostgreSQL ja Redis Docker-konteissa
- `npm run populate:db` - Lisää seed data tietokantaan

### Backend

- `npm run dev:backend` - Käynnistä backend kehitystilassa
- `npm run prod:backend` - Käynnistä backend tuotantotilassa
- `npm run test:backend` - Suorita backendin testit
- `npm run typecheck:backend` - Suorita TypeScript-tyyppitarkistus backendille
- `npm run lint:backend` - Suorita linttaus backendin koodille
- `npm run generate:backend` - Generoi GraphQL-tyypit

### Frontend

- `npm run dev:frontend` - Käynnistä frontend kehitystilassa
- `npm run build:frontend` - Buildaa frontend tuotantoa varten
- `npm run preview:frontend` - Esikatsele tuotantobuild paikallisesti
- `npm run test:frontend` - Suorita frontendin testit
- `npm run test:frontend:coverage` - Suorita frontendin testit kattavuusraportin kanssa
- `npm run typecheck:frontend` - Suorita TypeScript-tyyppitarkistus käyttöliittymälle
- `npm run lint:frontend` - Suorita linttaus frontendin koodille
- `npm run generate:frontend` - Generoi GraphQL-tyypit

### End-to-End-testaus

- `npm run test:e2e` - Suorita Playwright end-to-end-testit
