const APP_CONFIG = {
  // Ekte booking krever Apps Script URL.
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbzlsArraMIZEb7vZcE8my5qiP2ViPG_paz4A6xVidtBoFv5GFONvwu4Um2mXQoaHfwfSA/exec",

  // Publisert CSV fra Google Sheet.
  // Kolonner: Timestamp, Plass, Navn
  bookingsCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSWeVLX-_EP_glVBrHjj4FtpaSe0jhZyv06OQPruEiso18V_pIEON82yHUX2S1WE1RckemMIOFx9a-a/pub?output=csv",

  refreshIntervalMs: 10000,

  // Bookingstyring. Kan endres i admin.html og kopieres tilbake hit.
  bookingEnabled: true,
  bookingOpenText: "Booking er åpen.",
  bookingClosedText: "Booking er stengt."
};
