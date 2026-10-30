const map = L.map("map").setView([-3.689, -40.349], 14);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	maxZoom: 19,
	attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);
