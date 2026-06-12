/*
Hyttevold Booking v5 - Google Apps Script backend

Google Sheet må ha disse fanene:

1) Bookings
Timestamp | Plass | Navn

2) Places
ID | Type | X | Y

3) Settings
Key | Value

Settings-rader:
bookingEnabled | true
bookingOpenText | Booking er åpen.
bookingClosedText | Booking er stengt.

Deploy:
- Execute as: Me
- Who has access: Anyone
*/

const SHEET_ID = "LIM_INN_GOOGLE_SHEET_ID_HER";

const BOOKING_SHEET = "Bookings";
const PLACES_SHEET = "Places";
const SETTINGS_SHEET = "Settings";

function doGet(e) {
  const action = String(e.parameter.action || "");

  if (action === "config") {
    return json({
      ok: true,
      settings: getSettings(),
      places: getPlaces()
    });
  }

  if (action === "bookings") {
    return json({
      ok: true,
      bookings: getBookings()
    });
  }

  return json({
    ok: false,
    message: "Ukjent action."
  });
}

function doPost(e) {
  const action = String(e.parameter.action || "book");

  if (action === "book") {
    return bookPlace(e);
  }

  if (action === "saveConfig") {
    return saveConfig(e);
  }

  return json({
    ok: false,
    message: "Ukjent action."
  });
}

function bookPlace(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const placeId = String(e.parameter.placeId || "").trim();
    const name = String(e.parameter.name || "").trim();

    if (!placeId || !name) {
      return json({
        ok: false,
        message: "Mangler plass eller navn."
      });
    }

    const sheet = getSheet(BOOKING_SHEET, ["Timestamp", "Plass", "Navn"]);
    const rows = sheet.getDataRange().getValues().slice(1);

    const conflict = rows.some(row => String(row[1] || "").trim() === placeId);

    if (conflict) {
      return json({
        ok: false,
        message: "Denne plassen ble nettopp booket av noen andre."
      });
    }

    sheet.appendRow([new Date(), placeId, name]);

    return json({
      ok: true,
      message: "Booking registrert."
    });
  } catch (error) {
    return json({
      ok: false,
      message: error.message
    });
  } finally {
    lock.releaseLock();
  }
}

function saveConfig(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const places = JSON.parse(String(e.parameter.places || "[]"));
    const settings = JSON.parse(String(e.parameter.settings || "{}"));

    savePlaces(places);
    saveSettings(settings);

    return json({
      ok: true,
      message: "Lagret."
    });
  } catch (error) {
    return json({
      ok: false,
      message: error.message
    });
  } finally {
    lock.releaseLock();
  }
}

function getBookings() {
  const sheet = getSheet(BOOKING_SHEET, ["Timestamp", "Plass", "Navn"]);
  const rows = sheet.getDataRange().getValues().slice(1);

  return rows
    .filter(row => row[1] && row[2])
    .map(row => ({
      timestamp: row[0],
      placeId: String(row[1]),
      name: String(row[2])
    }));
}

function getPlaces() {
  const sheet = getSheet(PLACES_SHEET, ["ID", "Type", "X", "Y"]);
  const rows = sheet.getDataRange().getValues().slice(1);

  return rows
    .filter(row => row[0])
    .map(row => ({
      id: String(row[0]),
      type: String(row[1] || "bobil"),
      x: Number(row[2] || 50),
      y: Number(row[3] || 50)
    }));
}

function savePlaces(places) {
  const sheet = getSheet(PLACES_SHEET, ["ID", "Type", "X", "Y"]);

  sheet.clearContents();
  sheet.appendRow(["ID", "Type", "X", "Y"]);

  places.forEach(place => {
    sheet.appendRow([
      place.id,
      place.type,
      Number(place.x),
      Number(place.y)
    ]);
  });
}

function getSettings() {
  const sheet = getSheet(SETTINGS_SHEET, ["Key", "Value"]);
  const rows = sheet.getDataRange().getValues().slice(1);

  const settings = {
    bookingEnabled: true,
    bookingOpenText: "Booking er åpen.",
    bookingClosedText: "Booking er stengt."
  };

  rows.forEach(row => {
    const key = String(row[0] || "");
    const value = row[1];

    if (key === "bookingEnabled") {
      settings.bookingEnabled = String(value).toLowerCase() === "true";
    }

    if (key === "bookingOpenText") {
      settings.bookingOpenText = String(value || "");
    }

    if (key === "bookingClosedText") {
      settings.bookingClosedText = String(value || "");
    }
  });

  return settings;
}

function saveSettings(settings) {
  const sheet = getSheet(SETTINGS_SHEET, ["Key", "Value"]);

  sheet.clearContents();
  sheet.appendRow(["Key", "Value"]);
  sheet.appendRow(["bookingEnabled", String(!!settings.bookingEnabled)]);
  sheet.appendRow(["bookingOpenText", String(settings.bookingOpenText || "")]);
  sheet.appendRow(["bookingClosedText", String(settings.bookingClosedText || "")]);
}

function getSheet(name, headers) {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  let sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  return sheet;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
