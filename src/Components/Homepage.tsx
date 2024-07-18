import React from 'react';
import ReactMapGL from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const Homepage = () => {
    return (
           <ReactMapGL
            mapboxAccessToken = "pk.eyJ1IjoiYmZyYWlyZSIsImEiOiJjbHlyanpjbmswNWJlMmlvbnB0a2c5eWplIn0.2SMu2M_9wR0IvIfkPth7CA"
            initialViewState={{
                longitude: -117.257767,
                latitude: 32.842674,
                zoom: 10, 
            }}
            style = {{width: '100vw', height: '100vh'}}
            mapStyle = "mapbox://styles/mapbox/streets-v9"
           />
    );
};

export default Homepage; 