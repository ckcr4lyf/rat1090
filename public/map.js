let markers = [];
var map;

const configString = window.localStorage.getItem('config');
if (configString === undefined) {
    location.href = '/index.html';
}

const parsedConfig = JSON.parse(configString);

const renderNewCraft = async () => {
    // let a = await fetch('http://127.0.0.1:1338/aircraft.json?a=b');
    let a = await fetch(parsedConfig.aircraftjson);
    let b = await a.json();

    let c = b.aircraft.filter(a => a.lat !== undefined).map(a => {
        return { x: a.lat, y: a.lon, flight: a.flight }
    });

    for (const marker of markers) {
        marker.remove();
    }

    for (const ac of c) {
        x = L.marker([ac.x, ac.y]).addTo(map).bindTooltip(ac.flight, {
            permanent: true,
            direction: 'right'
        });
        markers.push(x);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    map = L.map('map', {
        wheelPxPerZoomLevel: 100,
    }).setView([0, 0], 3);

    L.tileLayer(parsedConfig.tileserver, {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        id: 'base'
    }).addTo(map);

    setInterval(renderNewCraft, 1000);
});
