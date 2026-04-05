import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { Tooltip } from "antd";
import {
  EnvironmentOutlined,
  AimOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import L from "leaflet";
import ReactDOMServer from "react-dom/server";
import useAppStore from "../store/useAppStore";
import useUserLocation from "../hooks/useUserLocation";
import MapClickHandler from "../hooks/useMapClick";
import type { Location } from "../store/useAppStore";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// User location icon — purple
const createUserIcon = () =>
  L.divIcon({
    className: "",
    html: ReactDOMServer.renderToString(
      <EnvironmentOutlined style={{ fontSize: "28px", color: "#7c3aed" }} />,
    ),
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

// Destination icon — red
const createDestinationIcon = () =>
  L.divIcon({
    className: "",
    html: ReactDOMServer.renderToString(
      <AimOutlined style={{ fontSize: "28px", color: "#ef4444" }} />,
    ),
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

const createStopIcon = () =>
  L.divIcon({
    className: "",
    html: `<div style="
      width: 28px;
      height: 28px;
      background: #f59e0b;
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">⛽</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

const BENGALURU_CENTER: [number, number] = [12.9716, 77.5946];

// Fly to user location when found
function FlyToLocation({ location }: { location: Location | null }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 14, { duration: 1.5 });
    }
  }, [location]);

  return null;
}

// Auto zoom map to fit entire route
function FitBounds({ coordinates }: { coordinates: number[][] | undefined }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(
        coordinates.map((coord) => [coord[1], coord[0]] as [number, number]),
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates]);

  return null;
}

export default function MapPanel() {
  const mapData = useAppStore((state) => state.mapData);
  const destination = useAppStore((state) => state.destination);
  const setDestination = useAppStore((state) => state.setDestination);
  const addMessage = useAppStore((state) => state.addMessage);
  const sendMessage = useAppStore((state) => state.sendMessage);
  const stops = useAppStore((state) => state.stops);
  const { userLocation } = useUserLocation();
  console.log("Stops in store:", stops);

  const handleMapClick = (location: Location) => {
    setDestination(location);

    const text = userLocation
      ? `Plan a route from ${userLocation.lat.toFixed(4)},${userLocation.lng.toFixed(4)} to ${location.lat.toFixed(4)},${location.lng.toFixed(4)}`
      : `Plan a route to ${location.lat.toFixed(4)},${location.lng.toFixed(4)}`;

    addMessage({ type: "user", text });

    if (sendMessage) {
      sendMessage(text);
    }
  };

  return (
    <div className="h-screen relative">
      {/* Header */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]
        bg-gray-900/80 backdrop-blur-sm px-5 py-2 rounded-full
        border border-gray-700 text-gray-400 text-xs flex items-center gap-2"
      >
        {userLocation ? (
          <>
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
            <span>Live location active</span>
          </>
        ) : (
          <span>📍 Bengaluru, Karnataka</span>
        )}
      </div>

      {/* Bottom hint — shows route info if route exists */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]
        bg-gray-900/80 backdrop-blur-sm px-6 py-3 rounded-2xl
        border border-gray-700 text-gray-400 text-sm text-center"
      >
        {mapData ? (
          <>
            <span className="text-violet-400 font-medium">
              {mapData.origin} → {mapData.destination}
            </span>
            <span className="mx-2">·</span>
            {mapData.distance}km
            <span className="mx-2">·</span>
            {mapData.duration} mins
          </>
        ) : destination ? (
          `Destination set → ${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}`
        ) : (
          "Click anywhere on map to set destination"
        )}
      </div>

      <MapContainer
        center={BENGALURU_CENTER}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fly to user location */}
        <FlyToLocation location={userLocation} />

        {/* Auto fit map to route */}
        <FitBounds coordinates={mapData?.coordinates} />

        {/* Click handler */}
        <MapClickHandler onLocationSelect={handleMapClick} />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserIcon()}
          >
            <Popup>
              <Tooltip title="Your current location">
                <span className="font-medium">You are here</span>
              </Tooltip>
            </Popup>
          </Marker>
        )}

        {/* Click destination marker */}
        {destination && !mapData && (
          <Marker
            position={[destination.lat, destination.lng]}
            icon={createDestinationIcon()}
          >
            <Popup>
              <span className="font-medium">Destination</span>
              <br />
              <span className="text-xs text-gray-500">
                {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
              </span>
            </Popup>
          </Marker>
        )}

        {/* Real road polyline */}
        {mapData?.coordinates && (
          <Polyline
            positions={mapData.coordinates.map(
              (coord: number[]) => [coord[1], coord[0]] as [number, number],
            )}
            pathOptions={{
              color: "#7c3aed",
              weight: 4,
              opacity: 0.8,
            }}
          />
        )}

        {/* Origin marker */}
        {mapData?.coordinates && (
          <Marker
            position={[mapData.coordinates[0][1], mapData.coordinates[0][0]]}
          >
            <Popup>
              <span className="font-medium">📍 {mapData.origin}</span>
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {mapData?.coordinates && (
          <Marker
            position={[
              mapData.coordinates[mapData.coordinates.length - 1][1],
              mapData.coordinates[mapData.coordinates.length - 1][0],
            ]}
          >
            <Popup>
              <span className="font-medium">🏁 {mapData.destination}</span>
            </Popup>
          </Marker>
        )}

        {stops.map((stop, i) => {
          console.log("Rendering stop marker:", stop);
          return (
            <Marker
              key={i}
              position={[stop.lat, stop.lng]}
              icon={createStopIcon()}
            >
              <Popup>
                <span className="font-medium">⛽ {stop.name}</span>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
