const APP_CONFIG = {
  // Lim inn Web App URL fra Google Apps Script her.
  appsScriptUrl: "DIN_APPS_SCRIPT_WEB_APP_URL_HER",

  // Brukes bare som fallback hvis Apps Script ikke er satt opp.
  refreshIntervalMs: 10000,

  // Lokal fallback. Når Apps Script er koblet på, hentes dette fra Google Sheet.
  bookingEnabled: true,
  bookingOpenText: "Booking er åpen.",
  bookingClosedText: "Booking er stengt."
};
