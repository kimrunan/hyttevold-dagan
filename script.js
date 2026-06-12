const state = {
  bookings: [],
  selected: null
};

const spotsLayer = document.getElementById("spotsLayer");
const placeCard = document.getElementById("placeCard");
const bookingList = document.getElementById("bookingList");
const dialog = document.getElementById("bookingDialog");
const form = document.getElementById("bookingForm");
const formMessage = document.getElementById("formMessage");
const toast = document.getElementById("toast");

init();

async function init() {
  await loadPublicConfig();

  document.getElementById("bookingStatusText").textContent =
    APP_CONFIG.bookingEnabled
      ? APP_CONFIG.bookingOpenText
      : APP_CONFIG.bookingClosedText;

  renderSpots();
  await loadBookings();

  setInterval(loadBookings, APP_CONFIG.refreshIntervalMs || 10000);

  document.getElementById("cancelButton").onclick = () => dialog.close();
  form.addEventListener("submit", submitBooking);
}

async function loadPublicConfig() {
  if (!APP_CONFIG.appsScriptUrl || APP_CONFIG.appsScriptUrl.includes("DIN_")) {
    return;
  }

  try {
    const response = await fetch(APP_CONFIG.appsScriptUrl + "?action=config&cacheBust=" + Date.now());
    const data = await response.json();

    if (data.ok) {
      PLACES = data.places || PLACES;
      APP_CONFIG.bookingEnabled = data.settings.bookingEnabled;
      APP_CONFIG.bookingOpenText = data.settings.bookingOpenText;
      APP_CONFIG.bookingClosedText = data.settings.bookingClosedText;
    }
  } catch (error) {
    console.warn("Kunne ikke hente config fra Apps Script", error);
  }
}

function renderSpots() {
  spotsLayer.innerHTML = "";

  PLACES.forEach(place => {
    const type = PLACE_TYPES[place.type];
    const button = document.createElement("button");

    button.type = "button";
    button.className = "spot ledig" + (APP_CONFIG.bookingEnabled ? "" : " closed");
    button.dataset.placeId = place.id;
    button.style.setProperty("--x", place.x + "%");
    button.style.setProperty("--y", place.y + "%");

    button.innerHTML = `
      <img
        class="spot-icon"
        src="${type.iconFile}"
        onerror="this.replaceWith(Object.assign(document.createElement('span'), { className: 'fallback-icon', textContent: '${type.fallback}' }))"
      >
      <span>${place.id}</span>
    `;

    button.onclick = () => selectPlace(place.id);
    spotsLayer.appendChild(button);
  });
}

async function loadBookings() {
  if (!APP_CONFIG.appsScriptUrl || APP_CONFIG.appsScriptUrl.includes("DIN_")) {
    state.bookings = [
      { placeId: "2", name: "Ola Nordmann" },
      { placeId: "A1", name: "Kari Hansen" }
    ];

    updateUi();
    return;
  }

  try {
    const response = await fetch(APP_CONFIG.appsScriptUrl + "?action=bookings&cacheBust=" + Date.now());
    const data = await response.json();

    if (data.ok) {
      state.bookings = data.bookings || [];
      updateUi();
    }
  } catch (error) {
    showToast("Kunne ikke hente bookingdata");
  }
}

function updateUi() {
  document.querySelectorAll(".spot").forEach(spot => {
    const booked = Boolean(getBooking(spot.dataset.placeId));

    spot.classList.toggle("opptatt", booked);
    spot.classList.toggle("ledig", !booked);
  });

  renderBookingList();

  if (state.selected) {
    renderPlaceCard(state.selected);
  }
}

function renderBookingList() {
  bookingList.innerHTML = "";

  if (!state.bookings.length) {
    bookingList.innerHTML = "<li>Ingen bookinger enda.</li>";
    return;
  }

  state.bookings
    .sort((a, b) =>
      String(a.placeId).localeCompare(String(b.placeId), "no", { numeric: true })
    )
    .forEach(booking => {
      const item = document.createElement("li");

      item.innerHTML = `
        <strong>Plass ${escapeHtml(booking.placeId)}</strong><br>
        ${escapeHtml(booking.name)}
      `;

      bookingList.appendChild(item);
    });
}

function selectPlace(id) {
  state.selected = id;
  renderPlaceCard(id);
}

function renderPlaceCard(id) {
  const place = PLACES.find(item => String(item.id) === String(id));
  const type = PLACE_TYPES[place.type];
  const booking = getBooking(id);

  if (!APP_CONFIG.bookingEnabled) {
    placeCard.innerHTML = `
      <h2>Plass ${place.id}</h2>
      <span class="status closed">Booking stengt</span>
      <p>${APP_CONFIG.bookingClosedText}</p>
    `;

    return;
  }

  if (booking) {
    placeCard.innerHTML = `
      <h2>Plass ${place.id}</h2>
      <span class="status opptatt">Opptatt</span>
      <p><strong>Type:</strong> ${type.label}</p>
      <p><strong>Booket av:</strong><br>${escapeHtml(booking.name)}</p>
    `;
  } else {
    placeCard.innerHTML = `
      <h2>Plass ${place.id}</h2>
      <span class="status ledig">Ledig</span>
      <p><strong>Type:</strong> ${type.label}</p>
      <button class="primary" id="bookBtn">Book denne plassen</button>
    `;

    document.getElementById("bookBtn").onclick = () => openDialog(place);
  }
}

function openDialog(place) {
  document.getElementById("dialogTitle").textContent = "Book plass " + place.id;
  document.getElementById("placeId").value = place.id;
  document.getElementById("name").value = "";
  formMessage.textContent = "";

  dialog.showModal();
}

async function submitBooking(event) {
  event.preventDefault();

  if (!APP_CONFIG.appsScriptUrl || APP_CONFIG.appsScriptUrl.includes("DIN_")) {
    formMessage.textContent = "Legg inn Apps Script URL i config.js før ekte booking.";
    return;
  }

  const formData = new FormData();

  formData.append("action", "book");
  formData.append("placeId", document.getElementById("placeId").value);
  formData.append("name", document.getElementById("name").value.trim());

  formMessage.textContent = "Sender...";

  try {
    const response = await fetch(APP_CONFIG.appsScriptUrl, {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (!result.ok) {
      formMessage.textContent = result.message || "Plassen er opptatt";
      await loadBookings();
      return;
    }

    dialog.close();
    showToast("Booking registrert");
    await loadBookings();
  } catch (error) {
    formMessage.textContent = "Kunne ikke sende booking";
  }
}

function getBooking(id) {
  return state.bookings.find(booking => String(booking.placeId) === String(id));
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

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}
