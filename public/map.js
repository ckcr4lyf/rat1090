let markers = [];
let state = {};
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
        return { x: a.lat, y: a.lon, flight: a.flight, hex: a.hex }
    });

    for (const aircraft of b.aircraft){
        if (state[aircraft.hex] === undefined){
            const newAircraft = {
                hex: aircraft.hex,
                flight: aircraft.flight,
                lat: aircraft.lat,
                lon: aircraft.lon,
                messages: aircraft.messages,
                seen: aircraft.seen,
                rssi: aircraft.rssi,
                alt_baro: aircraft.alt_baro,
                added: new Date(),
            }

            state[aircraft.hex] = newAircraft;
        } else {
            // sometimes the name can be lost, so only set if previously unknown
            if (state[aircraft.hex].flight === undefined && aircraft.flight !== undefined){
                console.log(`[${aircraft.hex}] Got new aircraft name: ${aircraft.flight}`)
                state[aircraft.hex].flight = aircraft.flight;
            }

            state[aircraft.hex].lat = aircraft.lat;
            state[aircraft.hex].lon = aircraft.lon;
            state[aircraft.hex].messages = aircraft.messages;
            state[aircraft.hex].seen = aircraft.seen;
            state[aircraft.hex].rssi = aircraft.rssi;
            state[aircraft.hex].alt_baro = aircraft.alt_baro;
        }
    }

    for (const marker of markers) {
        marker.remove();
    }

    for (const ac of c) {
        x = L.marker([ac.x, ac.y]).addTo(map).bindTooltip(state[ac.hex].flight, {
            permanent: true,
            direction: 'right'
        });
        markers.push(x);
    }

    console.log(state);
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
