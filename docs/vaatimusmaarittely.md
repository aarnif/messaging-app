# Vaatimusmäärittely

## Sovelluksen tarkoitus

Sovelluksen avulla käyttäjä voi luoda chatteja tai hänet voidaan lisätä niihin. Chatit voivat olla kahdenkeskisiä tai ryhmächatteja.
Käyttäjä voi lähettää viestejä muille käyttäjille sekä lisätä heitä kontakteiksi.

## Käyttäjät

Sovelluksessa on vain yhdenlaisia käyttäjiä, jotka ovat rekisteröityneitä käyttäjiä.

## Sovelluksen tarjoama toiminnallisuus

### Ennen kirjautumista

- [x] **Käyttäjän luonti**
  - [x] Käyttäjätunnuksen tulee olla uniikki
  - [x] Käyttäjätunnuksen tulee olla pituudeltaan vähintään 3 merkkiä
  - [x] Salasanan tulee olla pituudeltaan vähintään 6 merkkiä
  - [x] Jos käyttäjätunnus on jo käytössä, käyttäjälle ilmoitetaan tästä

- [x] **Käyttäjän kirjautuminen**
  - [x] Kirjautuminen tapahtuu syöttämällä käyttäjätunnus ja salasana lomakkeelle
    - [x] Jos käyttäjätunnus tai salasana on väärin, käyttäjälle ilmoitetaan tästä

### Kirjautumisen jälkeen

- [x] **Chatit ja viestit**

- [x] Käyttäjä näkee päänäkymän, jossa on listattuna käyttäjän chatit
- [x] Käyttäjä voi luoda uuden ryhmä- tai kahdenkeskisen chatin
- [x] Käyttäjä voi admin-roolissa muokata ryhmächatin tietoja
- [x] Käyttäjä voi admin-roolissa poistaa chatin
- [x] Käyttäjä voi lähettää tekstipohjaisia viestejä sovelluksessa
- [x] Käyttäjä voi muokata omia viestejään
- [x] Käyttäjä voi poistaa omia viestejään
- [x] Käyttäjä voi poistua chatista
- [x] Käyttäjä saa tiedon uusista viesteitä reaaliaikaisesti

- [x] **Kontaktit**
  - [x] Käyttäjä voi lisätä uuden kontaktin
  - [x] Käyttäjä voi poistaa kontaktin
  - [x] Käyttäjä voi blokata kontaktin

- [x] **Profiili**
  - [x] Käyttäjä voi vaihtaa päivittää tietojaan, kuten nimensä ja salasanan
  - [x] Käyttäjä voi vaihtaa asetuksia, kuten teeman dark- ja light moden välillä

- [x] **Käyttäjä voi kirjautua ulos järjestelmästä**

## Jatkokehitysideoita

Sovellus toimii tällä hetkellä, mutta esim. seuraavat toiminnallisuudet voisivat parantaa sen käytettävyyttä.

- Käyttäjä voi lisätä profiilikuvan
- Käyttäjä voi nollata unohdetun salasanan
- Käyttäjä voi lisätä ryhmächatille kuvan
- Käyttäjä voi jakaa kuvia chatissa
- Käyttäjä voi jakaa videoita chatissa
- Käyttäjä voi poistaa käyttäjätunnuksen
- Käyttäjä voi hakea viestejä
- Käyttäjä voi reagoida viesteihin emojilla
- Käyttäjä voi nähdä muiden käyttäjien statuksen
- Käyttäjä voi nähdä, milloin muut käyttäjät ovat viimeksi olleet paikalla
- Käyttäjä voi nähdä, kun muut käyttäjät kirjoittavat viestiä chatissa
