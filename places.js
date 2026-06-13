const PLACE_TYPES = {
  bobil: { label: "Bobil", iconFile: "icons/bobil.svg", fallback: "B" },
  campingvogn: { label: "Campingvogn", iconFile: "icons/campingvogn.svg", fallback: "C" },
  telt: { label: "Telt", iconFile: "icons/telt.svg", fallback: "T" },
  bat: { label: "Båt", iconFile: "icons/bat.svg", fallback: "A" }
};

// Lokal fallback. Når Apps Script er koblet på, hentes plassene fra Google Sheet.
let PLACES = [
  { id: "1",  type: "campingvogn", x: 41.5, y: 75.1 },
  { id: "2",  type: "campingvogn", x: 50.3, y: 65.1 },
  { id: "3",  type: "campingvogn", x: 57.9, y: 51.6 },
  { id: "4",  type: "bobil",       x: 60.4, y: 67.7 },
  { id: "5",  type: "bobil",       x: 75.1, y: 61.3 },
  { id: "6",  type: "bobil",       x: 71.8, y: 46.0 },
  { id: "7",  type: "bobil",       x: 66.3, y: 38.8 },
  { id: "8",  type: "bobil",       x: 42.4, y: 61.7 },
  { id: "9",  type: "telt",        x: 45.8, y: 35.3 },
  { id: "10", type: "telt",        x: 39.0, y: 31.9 },
  { id: "11", type: "campingvogn", x: 17.8, y: 24.8 },
  { id: "12", type: "campingvogn", x: 20.7, y: 17.1 },
  { id: "13", type: "bat",         x: 27.5, y: 75.3 },
  { id: "14", type: "bat",         x: 29.1, y: 62.0 }
];
