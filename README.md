# Hyttevold Booking v4

Denne versjonen har fjernet passordbeskyttelsen på admin-siden.

## Filer

Last opp alle filene til GitHub-repoet ditt.

## Admin

Åpne:

admin.html

Admin-siden åpnes direkte uten login.

## Ikoner

Legg egne SVG-filer i `icons/`:

- bobil.svg
- campingvogn.svg
- telt.svg
- bat.svg

## Google Sheet

Arket skal ha fanen `Bookings` og kolonnene:

Timestamp | Plass | Navn

## Apps Script

Bruk `appscript.gs`.

Den hindrer dobbeltbooking med `LockService`.
