/*
Google Apps Script backend for Booking 2.0

Slik bruker du:
1. Lag et Google Sheet med arkfanen "Bookings".
2. Første rad skal være:
   Timestamp | Plass | Navn | Kontakt | Fra | Til
3. Lim inn denne koden i Google Apps Script.
4. Sett SHEET_ID under.
5. Deploy som Web App:
   Execute as: Me
   Who has access: Anyone
6. Lim Web App URL inn i config.js.
*/

const SHEET_ID = "LIM_INN_GOOGLE_SHEET_ID_HER";
const SHEET_NAME = "Bookings";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const data = e.parameter;

    const placeId = String(data.placeId || "").trim();
    const name = String(data.name || "").trim();
    const contact = String(data.contact || "").trim();
    const from = String(data.from || "").trim();
    const to = String(data.to || "").trim();

    if (!placeId || !name || !from || !to) {
      return jsonResponse({ ok: false, message: "Mangler plass, navn eller dato." });
    }

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      return jsonResponse({ ok: false, message: "Fant ikke arkfanen Bookings." });
    }

    const values = sheet.getDataRange().getValues();
    const existingRows = values.slice(1);

    const conflict = existingRows.some(row => {
      const existingPlace = String(row[1] || "").trim();
      const existingFrom = toIsoDate(row[4]);
      const existingTo = toIsoDate(row[5]);

      if (existingPlace !== placeId) return false;
      return rangesOverlap(from, to, existingFrom, existingTo);
    });

    if (conflict) {
      return jsonResponse({
        ok: false,
        message: "Denne plassen ble nettopp booket av noen andre. Velg en annen plass."
      });
    }

    sheet.appendRow([new Date(), placeId, name, contact, from, to]);

    return jsonResponse({
      ok: true,
      message: "Booking registrert."
    });

  } catch (error) {
    return jsonResponse({ ok: false, message: error.message });
  } finally {
    lock.releaseLock();
  }
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart <= bEnd && bStart <= aEnd;
}

function toIsoDate(value) {
  if (!value) return "";
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(value).slice(0, 10);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
