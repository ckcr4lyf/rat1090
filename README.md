# rat1090

A dead simple and basic flight visualizer to view current time position on a map.  Built out of frustration seeing tar1090 and stuff have complicated config and setup (services, sudo).

Screenshot of current progress:
![image](https://github.com/user-attachments/assets/d35a4d82-90d5-4cee-8a5f-559ce70f2cd5)
Mapping thanks to OpenStreetMaps & Leaflet

## Supported Data Sources

|Source|Support|
|------|-------|
|dump1090|Yes, aircraft.json served via HTTP|
|jet1090|TODO|

## Quickstart

```
npx http-server public/ -p 1337
```

Then open http://127.0.0.1:1337/ in your browser

### Running dump1090

We need `dump1090` to write the aircraft to a JSON file and then serve it:

```
mkdir -p /tmp/dump1090
./dump1090 --write-json /tmp/dump1090 --interactive
```
and
```
npx http-server /tmp/dump1090 -p 1338
```

### Local Tileserver

You can run a local tileserver, the easiest way is via the docker image [overv/openstreetmap-tile-server](https://hub.docker.com/r/overv/openstreetmap-tile-server/)

Assuming you've imported the `.pbf` data etc. (follow guide on docker page), just run

```
docker run \
    -p 8080:80 \
    -v osm-data:/data/database/ \
    -v osm-tiles:/data/tiles/ \
    -d overv/openstreetmap-tile-server \
    run
```

The local tileserver then should be `http://localhost:8080/tile/{z}/{x}/{y}.png`
