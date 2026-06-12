let editablePlaces = JSON.parse(JSON.stringify(PLACES));
let settings = JSON.parse(JSON.stringify(APP_CONFIG));
let selectedId = null;

setupAdmin();

function setupAdmin() {
  document.getElementById("bookingEnabled").checked = !!settings.bookingEnabled;
  document.getElementById("openText").value = settings.bookingOpenText;
  document.getElementById("closedText").value = settings.bookingClosedText;

  ["bookingEnabled", "openText", "closedText"].forEach(id => {
    document.getElementById(id).addEventListener("input", updateOutput);
  });

  document.getElementById("addPlaceForm").addEventListener("submit", addPlace);
  document.getElementById("deletePlace").onclick = deleteSelected;

  document.getElementById("copyButton").onclick = async () => {
    await navigator.clipboard.writeText(document.getElementById("output").value);
    alert("Kopiert");
  };

  renderAdmin();
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

function updateOutput() {
  settings.bookingEnabled =
    document.getElementById("bookingEnabled")?.checked ?? settings.bookingEnabled;

  settings.bookingOpenText =
    document.getElementById("openText")?.value ?? settings.bookingOpenText;

  settings.bookingClosedText =
    document.getElementById("closedText")?.value ?? settings.bookingClosedText;

  const config =
    `const APP_CONFIG = ${JSON.stringify(settings, null, 2)
      .replace(/"([a-zA-Z0-9_]+)":/g, "$1:")};`;

  const places =
    `const PLACE_TYPES = ${JSON.stringify(PLACE_TYPES, null, 2)
      .replace(/"([a-zA-Z0-9_]+)":/g, "$1:")};\n\n` +
    `const PLACES = ${JSON.stringify(editablePlaces, null, 2)
      .replace(/"([a-zA-Z0-9_]+)":/g, "$1:")};`;

  document.getElementById("output").value =
    `// ----- config.js -----\n${config}\n\n// ----- places.js -----\n${places}`;
}
