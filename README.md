# Booking 2.0

Dette er et komplett startprosjekt for booking med:

- Flyfoto som kart
- Klikkbare plasser
- 4 kategorier: bobil, campingvogn, telt, båt
- Kun Ledig / Opptatt
- Adminside for å dra plassene og kopiere ny `places.js`
- Google Sheets som datakilde
- Google Apps Script med lås mot dobbeltbooking

## Filer

- `index.html` – hovedsiden
- `style.css` – design
- `script.js` – bookinglogikk
- `places.js` – plassene på kartet
- `config.js` – URL-er til Google Apps Script og CSV
- `admin.html` – dra/flytt plasser
- `admin.js` – adminlogikk
- `admin.css` – adminstil
- `appscript.gs` – backend-kode for Google Apps Script
- `images/plasskart.png` – flyfoto/kart

## Slik tester du lokalt

Åpne `index.html` i nettleser.

Hvis `config.js` fortsatt har standardverdier, vises demo-data.

## Slik legger du inn egne plasseringer

Åpne `admin.html`.

Dra ikonene dit de skal være.

Kopier koden fra feltet til høyre.

Lim den inn i `places.js`.

## Google Sheet

Lag et ark med fanen `Bookings`.

Første rad:

Timestamp | Plass | Navn | Kontakt | Fra | Til

Publiser arket som CSV og lim CSV-lenken inn i `config.js`.

## Google Apps Script

1. Åpne script.google.com
2. Lag nytt prosjekt
3. Lim inn innholdet fra `appscript.gs`
4. Sett `SHEET_ID`
5. Deploy som Web App
6. Lim Web App URL inn i `config.js`

## Dobbeltbooking

Apps Script bruker `LockService.getScriptLock()` slik at to bookinger ikke behandles samtidig.
Før booking lagres sjekker scriptet om plassen allerede er opptatt i samme periode.
