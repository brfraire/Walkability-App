import React, { useState, useEffect, useRef } from 'react';
import ReactMapGL, { FullscreenControl, GeolocateControl, Marker, Source, Layer, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import polyline from '@mapbox/polyline';
import Instructions from "./Instructions";
import { SearchBox, SearchBoxProps } from '@mapbox/search-js-react';

interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
}

interface Step {
    maneuver: {
        instruction: string;
    };
}

const Homepage: React.FC = () => {
    const [viewState, setViewState] = useState<ViewState>({
        longitude: 0,
        latitude: 0,
        zoom: 10
    });

    const [start, setStart] = useState<[number, number]>([0, 0]);
    const [end, setEnd] = useState<[number, number]>([0, 0]);
    const [coords, setCoords] = useState<[number, number][]>([]);
    const [steps, setSteps] = useState<Step[]>([]);

    const geolocateControlRef = useRef<GeolocateControl | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { longitude, latitude } = position.coords;
            setStart([longitude, latitude]);
            setViewState({ ...viewState, longitude, latitude });
        });
    }, []);

    useEffect(() => {
        if (start[0] !== 0 && end[0] !== 0) {
            getRoute();
        }
    }, [end, start]);

    const getRoute = async () => {
        const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&access_token=pk.eyJ1IjoiYmZyYWlyZSIsImEiOiJjbHlyanpjbmswNWJlMmlvbnB0a2c5eWplIn0.2SMu2M_9wR0IvIfkPth7CA`
        );
        const data = await response.json();
        console.log("API Response:", data);

        if (data.routes && data.routes.length > 0) {
            const encodedCoordinates = data.routes[0].geometry;
            const decodeCoordinates = polyline.decode(encodedCoordinates);
            console.log("Route Coordinates:", decodeCoordinates);
            const formatCoords = decodeCoordinates.map(([lat, lng]: [number, number]) => [lng, lat]);
            console.log("Formatted Coordinates:", formatCoords);
            setCoords(formatCoords);

            const steps = data.routes[0].legs[0].steps;
            setSteps(steps);
            steps.forEach((step: Step, index: number) => {
                console.log(`Step ${index + 1} Instruction:`, step.maneuver.instruction);
            });
        } else {
            console.error("No routes found");
        }
    };

    const geojson = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": coords,
            }
        }]
    };

    const endPoint = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [...end],
            }
        }]
    };

    const layerEndpoint = {
        id: 'end',
        type: 'circle',
        source: {
            type: 'geojson',
            data: end
        },
        paint: {
            'circle-radius': 10,
            'circle-color': '#f30'
        }
    }

    console.log("GeoJSON Data:", geojson);

    const lineStyle = {
        id: "roadLayer",
        type: 'line' as const,
        source: "routeSource",
        layout: {
            "line-join": "round" as const,
            "line-cap": "round" as const,
        },
        paint: {
            "line-color": "blue",
            "line-width": 4,
            "line-opacity": 1
        }
    };

    const handleClick = (e: { lngLat: [number, number] }) => {
        const newEnd = e.lngLat;
        const endPoint = Object.keys(newEnd).map((item, i) => newEnd[item]) as [number, number];
        console.log(endPoint);
        setEnd(endPoint);
    };

    const handleSearchResult = (result: any) => {
        if (result && result.features && result.features.length > 0) {
            const [longitude, latitude] = result.features[0].geometry.coordinates;
            setEnd([longitude, latitude]);
            setViewState({ ...viewState, longitude, latitude, zoom: 14 });
        }
    };

    return (
        <section className="relative">
            <form>
                <SearchBox
                    accessToken="pk.eyJ1IjoiYmZyYWlyZSIsImEiOiJjbHlyanpjbmswNWJlMmlvbnB0a2c5eWplIn0.2SMu2M_9wR0IvIfkPth7CA"
                    onRetrieve={handleSearchResult as SearchBoxProps['onRetrieve']}
                />
            </form>
            <ReactMapGL
                {...viewState}
                onClick={handleClick}
                mapboxAccessToken="pk.eyJ1IjoiYmZyYWlyZSIsImEiOiJjbHlyanpjbmswNWJlMmlvbnB0a2c5eWplIn0.2SMu2M_9wR0IvIfkPth7CA"
                onMove={(evt) => setViewState(evt.viewState)}
                style={{ width: '100vw', height: '100vh' }}
                mapStyle="mapbox://styles/mapbox/streets-v9"
            >
                <Source id='routeSource' type='geojson' data={geojson}>
                    <Layer {...lineStyle} />
                </Source>

                <Source id='endSource' type='geojson' data={endPoint}>
                    <Layer {...layerEndpoint} />
                </Source>

                <GeolocateControl
                    onGeolocate={(e) => setStart([e.coords.longitude, e.coords.latitude])} ref={geolocateControlRef} />
                <FullscreenControl />
                <NavigationControl />

                <Marker longitude={start[0]} latitude={start[1]} />
            </ReactMapGL>

            <article className="bg-slate-800 rounded-md px-5 py-3 max-h-[30vh] absolute top-5 left-40 overflow-y-auto">
                {steps.map((item, i) => (
                    <div className="flex flex-col gap-2" key={i}>
                        <Instructions no_={i + 1} step={item.maneuver.instruction} />
                    </div>
                ))}
            </article>
        </section>
    );
};

export default Homepage;
