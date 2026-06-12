const APP_CONFIG = {
  // Lim inn Web App URL fra Google Apps Script her.
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbzlsArraMIZEb7vZcE8my5qiP2ViPG_paz4A6xVidtBoFv5GFONvwu4Um2mXQoaHfwfSA/exec",

  // Brukes bare som fallback hvis Apps Script ikke er satt opp.
  refreshIntervalMs: 10000,

  // Lokal fallback. Når Apps Script er koblet på, hentes dette fra Google Sheet.
  bookingEnabled: true,
  bookingOpenText: "Booking er åpen.",
  bookingClosedText: "Booking er stengt."
};
