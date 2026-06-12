let editablePlaces = JSON.parse(JSON.stringify(PLACES));
let settings = JSON.parse(JSON.stringify(APP_CONFIG));
let selectedId = null;

const saveStatus = document.getElementById("saveStatus");
const toast = document.getElementById("toast");

setupAdmin();

async function setupAdmin() {
  await loadAdminConfig();

  document.getElementById("bookingEnabled").checked = !!settings.bookingEnabled;
  document.getElementById("openText").value = settings.bookingOpenText;
  document.getElementById("closedText").value = settings.bookingClosedText;

  ["bookingEnabled", "openText", "closedText"].forEach(id => {
    document.getElementById(id).addEventListener("input", updateOutput);
  });

  document.getElementById("addPlaceForm").addEventListener("submit", addPlace);
  document.getElementById("deletePlace").onclick = deleteSelected;
  document.getElementById("saveButton").onclick = saveChanges;
  document.getElementById("reloadButton").onclick = async () => {
    await loadAdminConfig();
    renderAdmin();
    showToast("Hentet siste lagrede versjon");
  };

  renderAdmin();
}

async function loadAdminConfig() {
  if (!APP_CONFIG.appsScriptUrl || APP_CONFIG.appsScriptUrl.includes("DIN_")) {
    saveStatus.textContent = "Apps Script URL mangler i config.js. Endringer kan ikke lagres direkte enda.";
    return;
  }

  try {
    const response = await fetch(APP_CONFIG.appsScriptUrl + "?action=config&cacheBust=" + Date.now());
    const data = await response.json();

    if (data.ok) {
      editablePlaces = data.places || editablePlaces;
      settings.bookingEnabled = data.settings.bookingEnabled;
      settings.bookingOpenText = data.settings.bookingOpenText;
      settings.bookingClosedText = data.settings.bookingClosedText;
      saveStatus.textContent = "Klar til lagring.";
    }
  } catch (error) {
    saveStatus.textContent = "Kunne ikke hente lagret konfigurasjon.";
  }
}

function renderAdmin() {
  const layer = document.getElementById("adminLayer");

  layer.innerHTML = "";

  editablePlaces.forEach(place => {
    const type = PLACE_TYPES[place.type];
    const element = document.createElement("div");

    element.className = "admin-spot" + (place.id === selectedId ? " selected" : "");
    element.style.setProperty("--x", place.x + "%");
    element.style.setProperty("--y", place.y + "%");
    element.dataset.id = place.id;

    element.innerHTML = `
      <img src="${type.iconFile}" onerror="this.remove()">
      <span>${place.id}</span>
    `;

    element.onpointerdown = startDrag;

    element.onclick = () => {
      selectedId = place.id;
      renderAdmin();
    };

    layer.appendChild(element);
  });

  updateSelectedInfo();
  updateOutput();
}

function startDrag(event) {
  event.preventDefault();

  selectedId = event.currentTarget.dataset.id;

  const map = document.getElementById("adminMap");
  const target = event.currentTarget;

  const move = moveEvent => {
    const rect = map.getBoundingClientRect();
    const place = editablePlaces.find(
      item => String(item.id) === String(selectedId)
    );

    place.x = Math.max(
      0,
      Math.min(100, Math.round(((moveEvent.clientX - rect.left) / rect.width) * 1000) / 10)
    );

    place.y = Math.max(
      0,
      Math.min(100, Math.round(((moveEvent.clientY - rect.top) / rect.height) * 1000) / 10)
    );

    target.style.setProperty("--x", place.x + "%");
    target.style.setProperty("--y", place.y + "%");

    updateSelectedInfo();
    updateOutput();
  };

  const up = () => {
    removeEventListener("pointermove", move);
    removeEventListener("pointerup", up);
    renderAdmin();
  };

  addEventListener("pointermove", move);
  addEventListener("pointerup", up);
}

function addPlace(event) {
  event.preventDefault();

  const id = document.getElementById("newId").value.trim();
  const type = document.getElementById("newType").value;

  if (editablePlaces.some(place => String(place.id) === id)) {
    alert("ID finnes allerede");
    return;
  }

  editablePlaces.push({
    id: id,
    type: type,
    x: 50,
    y: 50
  });

  selectedId = id;
  event.target.reset();
  renderAdmin();
}

function deleteSelected() {
  if (!selectedId) {
    return;
  }

  if (confirm("Slette plass " + selectedId + "?")) {
    editablePlaces = editablePlaces.filter(
      place => String(place.id) !== String(selectedId)
    );

    selectedId = null;
    renderAdmin();
  }
}

function updateSelectedInfo() {
  const box = document.getElementById("selectedInfo");
  const place = editablePlaces.find(
    item => String(item.id) === String(selectedId)
  );

  if (!place) {
    box.textContent = "Ingen valgt.";
    return;
  }

  box.innerHTML = `
    <strong>Plass ${place.id}</strong><br>
    Type: ${PLACE_TYPES[place.type].label}<br>
    x: ${place.x}<br>
    y: ${place.y}
  `;
}

async function saveChanges() {
  if (!APP_CONFIG.appsScriptUrl || APP_CONFIG.appsScriptUrl.includes("DIN_")) {
    saveStatus.textContent = "Legg inn Apps Script URL i config.js først.";
    return;
  }

  updateOutput();
  saveStatus.textContent = "Lagrer...";

  const formData = new FormData();
  formData.append("action", "saveConfig");
  formData.append("places", JSON.stringify(editablePlaces));
  formData.append("settings", JSON.stringify({
    bookingEnabled: settings.bookingEnabled,
    bookingOpenText: settings.bookingOpenText,
    bookingClosedText: settings.bookingClosedText
  }));

  try {
    const response = await fetch(APP_CONFIG.appsScriptUrl, {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (!result.ok) {
      saveStatus.textContent = result.message || "Kunne ikke lagre.";
      return;
    }

    saveStatus.textContent = "Lagret " + new Date().toLocaleTimeString("no-NO");
    showToast("Endringer lagret");
  } catch (error) {
    saveStatus.textContent = "Kunne ikke lagre endringer.";
  }
}

function updateOutput() {
  settings.bookingEnabled =
    document.getElementById("bookingEnabled")?.checked ?? settings.bookingEnabled;

  settings.bookingOpenText =
    document.getElementById("openText")?.value ?? settings.bookingOpenText;

  settings.bookingClosedText =
    document.getElementById("closedText")?.value ?? settings.bookingClosedText;

  const places =
    `const PLACE_TYPES = ${JSON.stringify(PLACE_TYPES, null, 2)
      .replace(/"([a-zA-Z0-9_]+)":/g, "$1:")};\n\n` +
    `let PLACES = ${JSON.stringify(editablePlaces, null, 2)
      .replace(/"([a-zA-Z0-9_]+)":/g, "$1:")};`;

  document.getElementById("output").value = places;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}
