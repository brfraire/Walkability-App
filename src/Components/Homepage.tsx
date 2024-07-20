import React, {useState, useEffect} from 'react';
import ReactMapGL, {FullscreenControl, GeolocateControl, Marker, Source, Layer, NavigationControl} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import polyline from '@mapbox/polyline';

const Homepage = () => {
    const [viewState, setViewState] = useState({
        longitude: -117.257767,
        latitude: 32.842674,
        zoom: 10
    });

    const [start, setStart] = useState([-117.257767, 32.842674]);
    const [end, setEnd] = useState([-117.257767, 32.842674]);
    const [coords, setCoords] = useState([]);

    useEffect(()=> {
        getRoute()
    }, [start, end])

    const getRoute = async () => {
        const response = await fetch
        (`https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?access_token=pk.eyJ1IjoiYmZyYWlyZSIsImEiOiJjbHlyanpjbmswNWJlMmlvbnB0a2c5eWplIn0.2SMu2M_9wR0IvIfkPth7CA`);
        const data = await response.json(); 
        console.log("API Response:", data);

        if (data.routes && data.routes.length > 0){
            const encodedCoordinates = data.routes[0].geometry;
            const decodeCoordinates = polyline.decode(encodedCoordinates);
            console.log("Route Coordinates:", decodeCoordinates);
            const formatCoords = decodeCoordinates.map(([lat, lng]) => [lng, lat]);
            console.log("Formatted Coordinates:", formatCoords);
            setCoords(formatCoords);
        } else{
            console.error("No routes found"); 
        }
    };

    const geojson = {
        "type" : "FeatureCollection",
        "features" : [{
            "type" : "Feature",
            "geometry" :{
                "type": "LineString",
                "coordinates":
                    coords,
            }
        }]
    };

    console.log("GeoJSON Data:", geojson);

    const lineStyle = {
        id: "roadLayer",
        type: 'line' as const,
        source: "routeSource",
        layout:{
            "line-join":"round" as const,
            "line-cap":"round" as const,
        },
        paint:{
            "line-color":"blue",
            "line-width": 4,
            "line-opacity": 1
        }
    };

    const handleClick = (e) => {
        const newEnd = e.lngLat;
        const endPoint = Object.keys(newEnd).map((item, i) => newEnd[item]);
        console.log(endPoint);
        setEnd(endPoint);
    };


    return (
           <ReactMapGL
            {...viewState}
            onClick= {handleClick}
            mapboxAccessToken = "pk.eyJ1IjoiYmZyYWlyZSIsImEiOiJjbHlyanpjbmswNWJlMmlvbnB0a2c5eWplIn0.2SMu2M_9wR0IvIfkPth7CA"
            onMove = {(evt) => setViewState(evt.viewState)}
            style = {{width: '100vw', height: '100vh'}}
            mapStyle = "mapbox://styles/mapbox/streets-v9"
           >
            <Source id ='routeSource' type = 'geojson' data = {geojson}>
                <Layer {...lineStyle}/>
            </Source>


            <GeolocateControl/>
            <FullscreenControl/>
            <NavigationControl/>

            <Marker longitude = {start[0]} latitude = {start[1]}
            />


           </ReactMapGL>
    );
};

export default Homepage; 