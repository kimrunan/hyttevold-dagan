// 1) Lim inn Web App URL fra Google Apps Script her.
// Eksempel: https://script.google.com/macros/s/AKfy.../exec
const APP_CONFIG = {
  appsScriptUrl: "DIN_APPS_SCRIPT_WEB_APP_URL_HER",

  // 2) Publisert CSV fra Google Sheets.
  // Arket bør ha kolonnene: Timestamp, Plass, Navn, Kontakt, Fra, Til
  bookingsCsvUrl: "DIN_PUBLISERTE_CSV_URL_HER",

  // Oppdaterer status fra Google Sheets hvert 10. sekund.
  refreshIntervalMs: 10000,

  // Sett til false hvis du vil skjule fullt navn i kart/info.
  showFullName: true
};
