const state = {
  bookings: [],
  selectedPlace: null
};

const spotsLayer = document.getElementById("spotsLayer");
const placeCard = document.getElementById("placeCard");
const bookedList = document.getElementById("bookedList");
const lastUpdated = document.getElementById("lastUpdated");
const bookingDialog = document.getElementById("bookingDialog");
const bookingForm = document.getElementById("bookingForm");
const dialogTitle = document.getElementById("dialogTitle");
const dialogMessage = document.getElementById("dialogMessage");
const bookingPlaceId = document.getElementById("bookingPlaceId");
const bookingFrom = document.getElementById("bookingFrom");
const bookingTo = document.getElementById("bookingTo");
const fromDate = document.getElementById("fromDate");
const toDate = document.getElementById("toDate");
const toast = document.getElementById("toast");

init();

function init() {
  setDefaultDates();
  renderSpots();
  loadBookings();

  document.getElementById("refreshButton").addEventListener("click", loadBookings);
  document.getElementById("checkDatesButton").addEventListener("click", loadBookings);
  document.getElementById("cancelBooking").addEventListener("click", () => bookingDialog.close());
  bookingForm.addEventListener("submit", submitBooking);

  setInterval(loadBookings, APP_CONFIG.refreshIntervalMs || 10000);
}

function setDefaultDates() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  fromDate.value = toIsoDate(today);
  toDate.value = toIsoDate(tomorrow);
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function renderSpots() {
  spotsLayer.innerHTML = "";

  PLACES.forEach(place => {
    const type = PLACE_TYPES[place.type] || PLACE_TYPES.bobil;
    const spot = document.createElement("button");
    spot.className = "spot available";
    spot.type = "button";
    spot.dataset.placeId = place.id;
    spot.style.setProperty("--x", `${place.x}%`);
    spot.style.setProperty("--y", `${place.y}%`);
    spot.innerHTML = `<span>${type.icon}</span><span>${place.id}</span>`;
    spot.title = `${type.label} ${place.id}`;
    spot.addEventListener("click", () => selectPlace(place.id));
    spotsLayer.appendChild(spot);
  });
}

async function loadBookings() {
  if (!APP_CONFIG.bookingsCsvUrl || APP_CONFIG.bookingsCsvUrl.includes("DIN_")) {
    state.bookings = demoBookings();
    updateUi();
    showToast("Demo-data vises. Legg inn CSV-url i config.js.");
    return;
  }

  try {
    const res = await fetch(APP_CONFIG.bookingsCsvUrl + "&cacheBust=" + Date.now());
    const csv = await res.text();
    state.bookings = parseCsv(csv);
    updateUi();
  } catch (error) {
    console.error(error);
    showToast("Kunne ikke hente bookingdata.");
  }
}

function demoBookings() {
  return [
    { placeId: "2", name: "Ola Nordmann", contact: "", from: fromDate.value, to: toDate.value },
    { placeId: "A1", name: "Kari Hansen", contact: "", from: fromDate.value, to: toDate.value }
  ];
}

function parseCsv(csv) {
  const rows = csv.trim().split(/\r?\n/);
  if (rows.length <= 1) return [];
  return rows.slice(1).map(row => {
    const c = splitCsvRow(row).map(cleanCsv);
    return {
      timestamp: c[0] || "",
      placeId: c[1] || "",
      name: c[2] || "",
      contact: c[3] || "",
      from: c[4] || "",
      to: c[5] || ""
    };
  }).filter(b => b.placeId && b.name);
}

function splitCsvRow(row) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const next = row[i + 1];

    if (char === '"' && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function cleanCsv(value) {
  return String(value || "").replace(/^"|"$/g, "").trim();
}

function updateUi() {
  updateSpotStatus();
  renderBookedList();
  if (state.selectedPlace) renderPlaceCard(state.selectedPlace);
  lastUpdated.textContent = new Date().toLocaleTimeString("no-NO");
}

function updateSpotStatus() {
  document.querySelectorAll(".spot").forEach(spot => {
    const placeId = spot.dataset.placeId;
    const booked = isPlaceBooked(placeId);
    spot.classList.toggle("booked", booked);
    spot.classList.toggle("available", !booked);
  });
}

function renderBookedList() {
  const active = state.bookings.filter(b => isBookingInSelectedPeriod(b));
  bookedList.innerHTML = "";

  if (!active.length) {
    bookedList.innerHTML = `<li>Ingen bookinger for valgt periode.</li>`;
    return;
  }

  active.sort((a, b) => naturalSort(a.placeId, b.placeId)).forEach(b => {
    const place = getPlace(b.placeId);
    const type = place ? PLACE_TYPES[place.type] : null;
    const name = APP_CONFIG.showFullName ? b.name : anonymizeName(b.name);

    const li = document.createElement("li");
    li.innerHTML = `<strong>${type ? type.icon : ""} ${b.placeId}</strong><br>${escapeHtml(name)}<br><small>${formatDate(b.from)} - ${formatDate(b.to)}</small>`;
    bookedList.appendChild(li);
  });
}

function selectPlace(placeId) {
  state.selectedPlace = placeId;
  renderPlaceCard(placeId);
}

function renderPlaceCard(placeId) {
  const place = getPlace(placeId);
  if (!place) return;

  const type = PLACE_TYPES[place.type] || PLACE_TYPES.bobil;
  const booking = getActiveBooking(placeId);

  if (booking) {
    const name = APP_CONFIG.showFullName ? booking.name : anonymizeName(booking.name);
    placeCard.innerHTML = `
      <h2>${type.icon} Plass ${place.id}</h2>
      <span class="status-pill booked">🔴 Opptatt</span>
      <div class="booking-meta">
        <div><strong>Type</strong><br>${type.label}</div>
        <div><strong>Booket av</strong><br>${escapeHtml(name)}</div>
        <div><strong>Periode</strong><br>${formatDate(booking.from)} - ${formatDate(booking.to)}</div>
      </div>
    `;
  } else {
    placeCard.innerHTML = `
      <h2>${type.icon} Plass ${place.id}</h2>
      <span class="status-pill available">🟢 Ledig</span>
      <div class="booking-meta">
        <div><strong>Type</strong><br>${type.label}</div>
      </div>
      <button class="primary-button" type="button" id="bookSelectedButton">Book denne plassen</button>
    `;

    document.getElementById("bookSelectedButton").addEventListener("click", () => openBookingDialog(place));
  }
}

function openBookingDialog(place) {
  dialogMessage.textContent = "";
  const type = PLACE_TYPES[place.type] || PLACE_TYPES.bobil;
  dialogTitle.textContent = `${type.icon} Book plass ${place.id}`;
  bookingPlaceId.value = place.id;
  bookingFrom.value = fromDate.value;
  bookingTo.value = toDate.value;
  bookingDialog.showModal();
}

async function submitBooking(event) {
  event.preventDefault();

  if (!APP_CONFIG.appsScriptUrl || APP_CONFIG.appsScriptUrl.includes("DIN_")) {
    dialogMessage.textContent = "Legg inn Apps Script URL i config.js før ekte booking.";
    return;
  }

  const payload = {
    placeId: bookingPlaceId.value,
    name: document.getElementById("customerName").value.trim(),
    contact: document.getElementById("customerContact").value.trim(),
    from: bookingFrom.value,
    to: bookingTo.value
  };

  if (!payload.name || !payload.from || !payload.to) {
    dialogMessage.textContent = "Fyll inn navn og dato.";
    return;
  }

  dialogMessage.textContent = "Sender booking...";

  try {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => formData.append(key, value));

    const res = await fetch(APP_CONFIG.appsScriptUrl, { method: "POST", body: formData });
    const json = await res.json();

    if (!json.ok) {
      dialogMessage.textContent = json.message || "Plassen er opptatt.";
      await loadBookings();
      return;
    }

    bookingDialog.close();
    bookingForm.reset();
    showToast("Booking registrert.");
    await loadBookings();
  } catch (error) {
    console.error(error);
    dialogMessage.textContent = "Kunne ikke sende booking.";
  }
}

function isPlaceBooked(placeId) {
  return Boolean(getActiveBooking(placeId));
}

function getActiveBooking(placeId) {
  return state.bookings.find(b => String(b.placeId) === String(placeId) && isBookingInSelectedPeriod(b));
}

function isBookingInSelectedPeriod(booking) {
  if (!booking.from || !booking.to) return true;

  const selectedFrom = fromDate.value;
  const selectedTo = toDate.value;

  if (!selectedFrom || !selectedTo) return true;

  return rangesOverlap(selectedFrom, selectedTo, booking.from, booking.to);
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart <= bEnd && bStart <= aEnd;
}

function getPlace(placeId) {
  return PLACES.find(p => String(p.id) === String(placeId));
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("no-NO");
}

function anonymizeName(name) {
  const parts = String(name || "").trim().split(/\s+/);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function naturalSort(a, b) {
  return String(a).localeCompare(String(b), "no", { numeric: true });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3500);
}
