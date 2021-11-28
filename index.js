// check if screen is small (mobile)
// if so, hide map and set mobile to true
let mobile = false;
if (window.matchMedia("(max-width: 790px)").matches) {
  mapid.style.display = "none";
  mobile = true;
}

// init positon object for map
const posObj = {
  latlng: [
    0, 0,
  ],
};
// init map
const map = L.map('mapid').setView([0, 0], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
let marker = "";
let isAdded = false;

// create or update marker
function drawMap({ latlng: [lat, long] }) {
  if (!isAdded || isAdded) {
    console.log(`created ${lat} ${long}`);
    marker = L.marker([lat, long]).addTo(map)
      .openPopup();
    isAdded = true;
  } else {
    console.log(`updated ${lat} ${long}`);
    map.removeLayer(marker);
    marker = L.marker([lat, long]).addTo(map)
      .openPopup();
  }
  map.setView([lat, long]);
}
// fetch/set lat/long
async function posGetReq({ coords: { latitude: lat, longitude: long } }) {
  const options = `?lat=${lat}&long=${long}&mobile=true`;
  const blob = await fetch(`https://sleepy-knuth-3cbcf4.netlify.app/.netlify/functions/poslog${options}`);
  const json = await blob.json();
  // if the position has changed, draw a marker
  if (json != posObj.latlng) {
    console.log(json)
    console.log(posObj.latlng)
    posObj.latlng = json;
    drawMap(posObj);
  }
}
// fetch lat/long only
async function posCheck() {
  const blob = await fetch(`https://sleepy-knuth-3cbcf4.netlify.app/.netlify/functions/poslog`);
  const json = await blob.json();
  if (json != posObj.latlng) {
    console.log(json)
    console.log(posObj.latlng)
    posObj.latlng = json;
    drawMap(posObj);
  }
}
// watch position, update if mobile
// check position only if desktop
if (mobile) {
  navigator.geolocation.watchPosition(posGetReq);
} else {
  setInterval(posCheck, 3000);
}
