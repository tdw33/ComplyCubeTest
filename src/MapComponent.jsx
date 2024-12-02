import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";

const redIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const blueIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function MapClickHandler({ setSelectedCoordinates }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      setSelectedCoordinates({ lat, lng });
    },
  });
  return null;
}

const MapComponent = () => {
  const [selectedCoordinates, setSelectedCoordinates] = useState({
    lat: 51.5038472,
    lng: -0.0203435,
  });
  const [restaurants, setRestaurants] = useState([]);

  const fetchRestaurants = async (latitude, longitude) => {
    const radius = 1000; // 1 km radius
    const query = `[out:json];node["amenity"="restaurant"](around:${radius},${latitude},${longitude});out;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
      query
    )}`;

    try {
      const response = await axios.get(url);
      setRestaurants(response.data.elements || []);
      console.log({ response: response.data.elements });
    } catch (error) {
      console.error("Error fetching restaurant data:", error);
    }
  };

  useEffect(() => {
    fetchRestaurants(selectedCoordinates.lat, selectedCoordinates.lng);
  }, [selectedCoordinates]);

  return (
    <MapContainer
      center={[selectedCoordinates.lat, selectedCoordinates.lng]}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <MapClickHandler setSelectedCoordinates={setSelectedCoordinates} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker
        position={[selectedCoordinates.lat, selectedCoordinates.lng]}
        icon={redIcon}
      >
        <Popup>Your Location</Popup>
      </Marker>
      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={[restaurant.lat, restaurant.lon]}
          icon={blueIcon}
        >
          <Popup>
            <strong>{restaurant.tags.name || "Unnamed Restaurant"}</strong>
            <br />
            {restaurant.tags.cuisine && `Cuisine: ${restaurant.tags.cuisine}`}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
