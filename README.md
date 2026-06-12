# Hyttevold Booking v5

Denne versjonen lar admin lagre plasseringer direkte fra admin.html.

## Viktig

GitHub Pages kan ikke skrive til filer direkte.
Derfor lagres plasseringer og innstillinger i Google Sheets via Apps Script.

## Google Sheet

Lag et Google Sheet. Apps Script lager fanene automatisk hvis de mangler:

- Bookings
- Places
- Settings

## Apps Script

1. Åpne Google Apps Script.
2. Lim inn innholdet fra `appscript.gs`.
3. Sett `SHEET_ID`.
4. Deploy som Web App:
   - Execute as: Me
   - Who has access: Anyone
5. Kopier Web App URL.
6. Lim den inn i `config.js` som `appsScriptUrl`.

## Første oppsett

Når Apps Script er koblet til:

1. Åpne admin.html
2. Legg til / flytt plasser
3. Trykk `Lagre endringer`
4. Åpne index.html

Da hentes plassene direkte fra Google Sheet.

## Ikoner

Legg egne ikoner her:

- icons/bobil.svg
- icons/campingvogn.svg
- icons/telt.svg
- icons/bat.svg
