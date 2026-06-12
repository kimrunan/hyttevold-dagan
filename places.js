// Rediger plassene her.
// x og y er prosent på bildet. 0,0 = øverst til venstre. 100,100 = nederst til høyre.
// Kategorier: bobil, campingvogn, telt, bat

const PLACE_TYPES = {
  bobil: { label: "Bobil", icon: "🚐" },
  campingvogn: { label: "Campingvogn", icon: "🚛" },
  telt: { label: "Telt", icon: "🏕️" },
  bat: { label: "Båt", icon: "⛵" }
};

const PLACES = [
  // Forslag basert på bildet. Flytt dem i admin.html etter behov.
  { id: "1", type: "bobil", x: 59, y: 35 },
  { id: "2", type: "bobil", x: 64, y: 39 },
  { id: "3", type: "bobil", x: 69, y: 44 },
  { id: "4", type: "bobil", x: 74, y: 49 },

  { id: "5", type: "campingvogn", x: 56, y: 49 },
  { id: "6", type: "campingvogn", x: 62, y: 54 },
  { id: "7", type: "campingvogn", x: 68, y: 59 },
  { id: "8", type: "campingvogn", x: 74, y: 64 },

  { id: "9", type: "telt", x: 49, y: 63 },
  { id: "10", type: "telt", x: 55, y: 68 },
  { id: "11", type: "telt", x: 61, y: 73 },
  { id: "12", type: "telt", x: 67, y: 78 },

  { id: "A1", type: "bat", x: 19, y: 69 },
  { id: "A2", type: "bat", x: 23, y: 72 },
  { id: "A3", type: "bat", x: 27, y: 75 },
  { id: "A4", type: "bat", x: 31, y: 78 },
  { id: "B1", type: "bat", x: 16, y: 83 },
  { id: "B2", type: "bat", x: 21, y: 86 },
  { id: "B3", type: "bat", x: 26, y: 89 },
  { id: "B4", type: "bat", x: 31, y: 92 }
];
