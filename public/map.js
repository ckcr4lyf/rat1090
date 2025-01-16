let markers = [];

let allTimeState = {}; // all aircraft seen
let currentState = {}; // aircraft currently in the JSON file
var map;

const configString = window.localStorage.getItem('config');
if (configString === undefined) {
    location.href = '/index.html';
}

const parsedConfig = JSON.parse(configString);

class Aircraft {
    constructor(dump1090Aircraft){
        this.hex = dump1090Aircraft.hex;

        if (dump1090Aircraft.flight !== undefined){
            this.flight = dump1090Aircraft.flight.trim();
        }
        
        this.lat = dump1090Aircraft.lat
        this.lon = dump1090Aircraft.lon
        this.messages = dump1090Aircraft.messages
        this.seen = dump1090Aircraft.seen
        this.rssi = dump1090Aircraft.rssi
        this.alt_baro = dump1090Aircraft.alt_baro

        this.added = new Date();
        this.lastMessage = new Date();

        this.positions = [];

        if (this.lat !== undefined){
            this.positions.push({
                lat: this.lat,
                lon: this.lon,
                time: Date.now(),
            });
        }
    }

    updateInfo(dump1090Aircraft){
        if (this.flight == undefined && dump1090Aircraft.flight !== undefined){
            this.flight = dump1090Aircraft.flight.trim();
        }
        this.lat = this.lat ?? dump1090Aircraft.lat
        this.lon = this.lon ?? dump1090Aircraft.lon
        this.messages = this.messages ?? dump1090Aircraft.messages
        this.seen = this.seen ?? dump1090Aircraft.seen
        this.rssi = this.rssi ?? dump1090Aircraft.rssi
        this.alt_baro = this.alt_baro ?? dump1090Aircraft.alt_baro

        if (dump1090Aircraft.lat !== undefined){
            this.positions.push({
                lat: dump1090Aircraft.lat,
                lon: dump1090Aircraft.lon,
                time: Date.now(),
            });
        }

        this.lastMessage = new Date();
    }
}

const renderNewCraft = async () => {
    // let a = await fetch('http://127.0.0.1:1338/aircraft.json?a=b');
    let jsonFileResponse = await fetch(parsedConfig.aircraftjson);
    let dump1090Aircraft = await jsonFileResponse.json();

    let c = dump1090Aircraft.aircraft.filter(a => a.lat !== undefined).map(a => {
        return { x: a.lat, y: a.lon, flight: a.flight, hex: a.hex }
    });

    // Get a list of hex in current aircraft.json
    const currentFlights = dump1090Aircraft.aircraft.map(ac => ac.hex);

    for (const d1090aircraft of dump1090Aircraft.aircraft){
        if (allTimeState[d1090aircraft.hex] === undefined){
            const aircraft = new Aircraft(d1090aircraft);
            allTimeState[d1090aircraft.hex] = aircraft;
            console.log(`[${d1090aircraft.hex}] New aircraft: ${aircraft.flight}`);
        } else {
            allTimeState[d1090aircraft.hex].updateInfo(d1090aircraft);
        }
    }

    for (const marker of markers) {
        marker.remove();
    }

    currentState = {};
    for (const hex of currentFlights){
        currentState[hex] = allTimeState[hex];

        if (allTimeState[hex].lat !== undefined){
            x = L.marker([allTimeState[hex].lat, allTimeState[hex].lon]).addTo(map).bindTooltip(allTimeState[hex].flight ?? hex, {
                permanent: true,
                direction: 'right'
            });
            markers.push(x);
        }
    }

    console.log(`Total aircraft seen: ${Object.keys(allTimeState).length}. Current aircraft: ${Object.keys(currentState).length}`);
    console.log(currentState);

    // for (const ac of c) {
    //     x = L.marker([ac.x, ac.y]).addTo(map).bindTooltip(state[ac.hex].flight, {
    //         permanent: true,
    //         direction: 'right'
    //     });
    //     markers.push(x);
    // }

    // console.log(state);
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
