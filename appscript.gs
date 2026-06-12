/* Google Apps Script backend
Sheet-fane: Bookings
Kolonner: Timestamp | Plass | Navn */
const SHEET_ID = "LIM_INN_GOOGLE_SHEET_ID_HER";
const SHEET_NAME = "Bookings";
function doPost(e){const lock=LockService.getScriptLock();lock.waitLock(30000);try{const placeId=String(e.parameter.placeId||"").trim();const name=String(e.parameter.name||"").trim();if(!placeId||!name)return json({ok:false,message:"Mangler plass eller navn."});const sheet=SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);const rows=sheet.getDataRange().getValues().slice(1);const conflict=rows.some(row=>String(row[1]||"").trim()===placeId);if(conflict)return json({ok:false,message:"Denne plassen ble nettopp booket av noen andre."});sheet.appendRow([new Date(),placeId,name]);return json({ok:true,message:"Booking registrert."})}catch(err){return json({ok:false,message:err.message})}finally{lock.releaseLock()}}
function json(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)}
