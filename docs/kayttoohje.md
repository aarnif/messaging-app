# Käyttöohje

## Sovelluksen konfigurointi

Luo `.env`-tiedosto `server`-hakemistoon seuraavilla tiedoilla:

```bash
DATABASE_URL=postgres://postgres:example@localhost:6001/postgres
JWT_SECRET=YOUR-SECRET-KEY
SERVER_URL=http://localhost:4000
WS_URL=ws://localhost:4000
REDIS_URI=redis://localhost:6379
CI=false
```

Luo `.env.development` ja `.env.production` tiedostot `ui`-hakemistoon seuraavilla tiedoilla:

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

## Sovelluksen käynnistäminen

1. Asenna sovelluksen vaatimat riippuvuudet:

       npm run install

2. Käynnistä tietokanta ja Redis Docker-konteissa uudessa terminaalissa:

       npm run start:db

3. Lisää seed data tietokantaan:

       npm run populate:db

4. Käynnistä palvelin kehitystilassa uudessa terminaalissa:

       npm run dev:server

5. Käynnistä käyttöliittymä kehitystilassa uudessa terminaalissa:

       npm run dev:ui

## Kirjautuminen

Sovellus käynnistyy kirjautumisnäkymään:

![Kirjautuminen](images/kirjautuminen.png)

Kirjautumisnäkymässä voit syöttää käyttäjätunnuksesi ja salasanasi ja painamalla `Sign In` painiketta, kirjaudut sisään sovellukseen.

## Uuden käyttäjän luominen

![Uuden käyttäjän luominen](images/kayttajan-luonti.png)

Uuden käyttäjän luominen onnistuu painamalla "Sign Up" painiketta kirjautumisnäkymässä. Tällöin sovellus siirtyy uuden käyttäjän luonti näkymään, jossa voit syöttää haluamasi käyttäjätunnuksen ja salasanan sekä vahvistaa salasanan. Kun olet syöttänyt tiedot, voit luoda uuden käyttäjän painamalla `Sign Up` painiketta. Jos uuden käyttäjän luonti onnistuu, sovellus kirjaa sinut automaattisesti sisään. Voit perua käyttäjän luonnin painamalla `Return to Sign In` painiketta.

## Päänäkymä

![Päänäkymä](images/paanakyma.png)

Sovelluksen päänäkymässä kirjautumisen jälkeen näkyy kaikki sinun chattisi. Näkymässä olevasta chattien listasta voit hakea chateista chatin nimen tai kuvauksen perusteella. Sovelluksen sivupalkista voit navigoida chattien lisäksi kontakteihin ja asetuksiin sekä kirjautua ulos.

## Uuden chatin luonti

![Uuden chatin luonti](images/chatin-luonti.png)

Voit luoda uuden chatin klikkaamalla chatti valikon `Chats` otsikon oikealla puolella olevaa painiketta. Tällöin avautuu ensiksi pudotusvalikko, mistä voit valita joko kahden keskisen (private chat) tai ryhmä chatin (group chat) luomisen. Tämän jälkeen avautuu joko kahden keskisen ja ryhmä chatin luonti modaali, mistä voit valita haluamasi kontaktin/kontaktit ja ryhmän chatin tapauksessa syöttää chatin tiedot. Chatin luonnin voi peruuttaa klikkaamalla rasti-ikonia modaalin vasemmassa yläkulmassa. Tietojen syöttämisen jälkeen klikkaamalla modaalin oikeassa yläkulmassa olevaa nuolta avautuu uuden chatin esikatselu näkymä.

![Uuden chatin esikatselu](images/chatin-esikatselu.png)

Tämä ei kuitenkaan vielä luo uutta chattia, vaan se luodaan vasta kun käyttäjä lähettää ensimmäisen viestin chattiin. Voit perua uuden chatin luonnin navigoimalla pois chatin esikatselu näkymästä esimerkiksi klikkaamalla olemassa olevaa chattia chatti listasta.

## Uuden viestin lähetys

![Uuden viestin lähetys](images/viestin-lahetys.png)

Olemassa olevaan chattiin voit lähettää viestin valitsemalla chatin chattien valikosta ja lähettämällä viestin syötekentästä chatti näkymän pohjalla. Sovelluksessa voi lähettää tekstipohjaisia viestejä sekä lisätä emojia niihin syötekentän vasemmalla puolella olevasta emoji valikosta.

## Kontaktit näkymä

![Kontaktit näkymä](images/kontaktit.png)

Voit siirtyä kontaktit näkymään klikkaamalla sivuvalikon kontaktit-painiketta. Tämän jälkeen kontaktit näkymässä avautuvasta listasta näet kaikki tämänhetkiset kontaktisi ja voit hakea kontakteistasi kontaktin käyttäjänimen tai nimen perusteella.

## Uuden kontaktin lisäys

![Uuden kontaktin lisäys](images/kontaktin-lisays.png)

Voit lisätä uuden kontaktin klikkaamalla kontaktit valikon `Contacts` otsikon oikealla puolella olevaa painiketta. Tämän jälkeen avautuu modaali, mistä voit valita haluamasi kontaktin ja lisätä hänet kontaktit listaan.

## Yksittäisen kontaktin näkymä

![Yksittäisen kontaktin näkymä](images/kontakti.png)

Pääset katsomaan yksittäisen kontaktin tietoja klikkaamalla kontaktia kontaktit listasta. Avautuvasta kontakti näkymästä voit aloittaa chatin ja blokata sekä poistaa kontaktin. Näet myös kontaktin sivulta onko kontakti blokannut sinut. Voit blokata kontaktin klikkaamalla `Block Contact` painiketta tai poistaa kontaktin klikkaamalla `Remove Contact` painiketta. Jos olet jo aiemmin blokannut kontaktin, tällöin sama `Block Contact` painike muuttuu `Unblock Contact` painikkeeksi. Kaikissa tapauksissa avautuu konfirmaatio modaali, joka vielä varmistaa että haluat tehdä valitun toiminnon.

## Asetukset näkymä

![Asetukset näkymä](images/asetukset.png)

Pääset muuttamaan asetuksia klikkaamalla sivuvalikon asetukset-painiketta. Tämän jälkeen avautuu näkymä käyttäjän profiilista, mistä voit muuttaa profiilitietoja, kuten näytettävää nimeä ja about-tekstiä, klikkaamalla näkymän oikeassa yläkulmassa olevaa painiketta ja vaihtaa salasanaa klikkaamalla `Change Password` painiketta.

![Ulkoasu näkymä](images/ulkoasu.png)

Klikkaamalla `Appearance` osiota asetukset valikosta, voit muuttaa sovelluksen ulkoasua dark- ja light-moden välillä sekä valita käytetäänkö 12h vai 24h kelloa viestin lähetysaikojen näyttämiseen.

## Uloskirjautuminen

![Uloskirjautuminen](images/uloskirjautuminen.png)

Pääset kirjautumaan ulos sovelluksesta klikkaamalla uloskirjautumispainiketta sivuvalikosta. Sovellus vielä kysyy konfirmaatio modaalin avulla haluatko varmasti kirjautua ulos.