import { MapContainer, Marker, TileLayer } from "react-leaflet";

type CityMapProps = {
  latitude: number;
  longitude: number;
};

const CityMap: React.FC<CityMapProps> = ({ latitude, longitude }) => (
  <MapContainer
    center={[latitude, longitude]}
    minZoom={2}
    zoom={13}
    dragging={false}
    style={{ width: "100%", height: 500 }}
  >
    <TileLayer
      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={[latitude, longitude]}></Marker>
  </MapContainer>
);

export default CityMap;
