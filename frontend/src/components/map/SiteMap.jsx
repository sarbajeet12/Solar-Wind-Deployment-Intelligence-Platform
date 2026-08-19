import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../services/api";

const solarIcon = new L.Icon({ iconUrl: "/markers/solar.png", shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png", iconSize: [32, 42], iconAnchor: [16, 42], popupAnchor: [0, -40], shadowSize: [41, 41] });
const windIcon = new L.Icon({ iconUrl: "/markers/wind.png", shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png", iconSize: [32, 42], iconAnchor: [16, 42], popupAnchor: [0, -40], shadowSize: [41, 41] });

function RecenterMap({ position, zoom }) {
    const map = useMap();
    useEffect(() => { map.setView(position, zoom, { animate: true }); }, [map, position, zoom]);
    return null;
}

/**
 * Without selectedLocation this is the global Sites map. With selectedLocation it is
 * deliberately a single-site map: it does not request or render the global site list.
 */
export default function SiteMap({ selectedLocation, project, site, editing = false, onLocationChange }) {
    const [sites, setSites] = useState([]);
    const markerRef = useRef(null);
    const isSelectedSiteMap = Number.isFinite(Number(selectedLocation?.latitude)) && Number.isFinite(Number(selectedLocation?.longitude));
    const position = useMemo(() => isSelectedSiteMap ? [Number(selectedLocation.latitude), Number(selectedLocation.longitude)] : [20.2961, 85.8245], [isSelectedSiteMap, selectedLocation?.latitude, selectedLocation?.longitude]);

    useEffect(() => {
        if (isSelectedSiteMap) return;
        api.get("/sites/").then((response) => setSites(response.data)).catch((error) => console.error(error));
    }, [isSelectedSiteMap]);

    const finishDrag = () => {
        const marker = markerRef.current;
        if (!marker || !onLocationChange) return;
        const { lat, lng } = marker.getLatLng();
        onLocationChange({ ...selectedLocation, latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) });
    };

    return <MapContainer center={position} zoom={isSelectedSiteMap ? 17 : 7} scrollWheelZoom className="h-[420px] w-full rounded-2xl sm:h-[500px]">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {isSelectedSiteMap ? <>
            <RecenterMap position={position} zoom={17} />
            <Marker ref={markerRef} position={position} icon={site?.energy_type === "Wind" ? windIcon : solarIcon} draggable={editing} eventHandlers={{ dragend: finishDrag }} zIndexOffset={1000}>
                <Tooltip permanent direction="top" offset={[0, -40]}>Selected Site</Tooltip>
                <Popup><div className="space-y-1"><h3 className="text-lg font-bold">Project Site</h3><p><strong>Project:</strong> {project?.name || "Selected project"}</p><p><strong>Site:</strong> {site?.site_name || selectedLocation.name || "Selected site"}</p><p><strong>Latitude:</strong> {position[0].toFixed(6)}</p><p><strong>Longitude:</strong> {position[1].toFixed(6)}</p></div></Popup>
            </Marker>
        </> : sites.map((item) => <Marker key={item.id} position={[item.latitude, item.longitude]} icon={item.energy_type === "Wind" ? windIcon : solarIcon}><Popup><div className="space-y-2"><h3 className="text-lg font-bold">{item.site_name}</h3><p><strong>Energy:</strong> {item.energy_type}</p><p><strong>Status:</strong> {item.status}</p><p><strong>Location:</strong><br />{item.district}, {item.state}</p></div></Popup></Marker>)}
    </MapContainer>;
}
