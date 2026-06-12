let editablePlaces = JSON.parse(JSON.stringify(PLACES));
let selectedId = null;

const adminMap = document.getElementById("adminMap");
const adminLayer = document.getElementById("adminLayer");
const output = document.getElementById("output");
const selectedInfo = document.getElementById("selectedInfo");
const addPlaceForm = document.getElementById("addPlaceForm");

renderAdmin();

addPlaceForm.addEventListener("submit", event => {
  event.preventDefault();
  const id = document.getElementById("newId").value.trim();
  const type = document.getElementById("newType").value;

  if (!id) return;
  if (editablePlaces.some(p => String(p.id) === id)) {
    alert("Denne ID-en finnes allerede.");
    return;
  }

  editablePlaces.push({ id, type, x: 50, y: 50 });
  selectedId = id;
  addPlaceForm.reset();
  renderAdmin();
});

document.getElementById("copyButton").addEventListener("click", async () => {
  await navigator.clipboard.writeText(output.value);
  alert("Koden er kopiert.");
});

function renderAdmin() {
  adminLayer.innerHTML = "";

  editablePlaces.forEach(place => {
    const type = PLACE_TYPES[place.type] || PLACE_TYPES.bobil;
    const el = document.createElement("div");
    el.className = "admin-spot" + (place.id === selectedId ? " selected" : "");
    el.style.setProperty("--x", `${place.x}%`);
    el.style.setProperty("--y", `${place.y}%`);
    el.textContent = `${type.icon}${place.id}`;
    el.dataset.id = place.id;
    el.addEventListener("pointerdown", startDrag);
    el.addEventListener("click", () => {
      selectedId = place.id;
      updateSelectedInfo(place);
      renderAdmin();
    });
    adminLayer.appendChild(el);
  });

  updateOutput();
  const selected = editablePlaces.find(p => p.id === selectedId);
  if (selected) updateSelectedInfo(selected);
}

function startDrag(event) {
  event.preventDefault();
  const id = event.currentTarget.dataset.id;
  selectedId = id;

  const onMove = moveEvent => {
    const rect = adminMap.getBoundingClientRect();
    const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
    const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;
    const place = editablePlaces.find(p => String(p.id) === String(id));

    place.x = clamp(round(x), 0, 100);
    place.y = clamp(round(y), 0, 100);

    const el = adminLayer.querySelector(`[data-id="${CSS.escape(String(id))}"]`);
    el.style.setProperty("--x", `${place.x}%`);
    el.style.setProperty("--y", `${place.y}%`);
    updateSelectedInfo(place);
    updateOutput();
  };

  const onUp = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    renderAdmin();
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function updateSelectedInfo(place) {
  const type = PLACE_TYPES[place.type] || PLACE_TYPES.bobil;
  selectedInfo.innerHTML = `
    <strong>${type.icon} Plass ${place.id}</strong><br>
    Type: ${type.label}<br>
    x: ${place.x}<br>
    y: ${place.y}
  `;
}

function updateOutput() {
  output.value = `// Rediger plassene her.\n// x og y er prosent på bildet.\n\nconst PLACE_TYPES = ${formatObject(PLACE_TYPES)};\n\nconst PLACES = ${formatArray(editablePlaces)};\n`;
}

function formatObject(obj) {
  return JSON.stringify(obj, null, 2)
    .replace(/"([a-zA-Z0-9_]+)":/g, "$1:");
}

function formatArray(arr) {
  return JSON.stringify(arr, null, 2)
    .replace(/"([a-zA-Z0-9_]+)":/g, "$1:");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Math.round(value * 10) / 10;
}
