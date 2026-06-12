const APP_CONFIG = {
  // Ekte booking krever Apps Script URL.
  appsScriptUrl: "DIN_APPS_SCRIPT_WEB_APP_URL_HER",

  // Publisert CSV fra Google Sheet.
  // Kolonner: Timestamp, Plass, Navn
  bookingsCsvUrl: "DIN_PUBLISERTE_CSV_URL_HER",

  refreshIntervalMs: 10000,

  // Bookingstyring. Kan endres i admin.html og kopieres tilbake hit.
  bookingEnabled: true,
  bookingOpenText: "Booking er åpen.",
  bookingClosedText: "Booking er stengt."
};
