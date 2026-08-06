import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

const RISK_ZONES = [
  {
    id: 1,
    name: 'Police Bazar',
    lat: 25.5795,
    lng: 91.8940,
    radius: 500,
    level: 'HIGH'
  },
  {
    id: 2,
    name: 'Laitumkhrah Market',
    lat: 25.5650,
    lng: 91.8850,
    radius: 400,
    level: 'MEDIUM'
  },
  {
    id: 3,
    name: 'Golf Course',
    lat: 25.5900,
    lng: 91.9000,
    radius: 600,
    level: 'LOW'
  }
]

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3

  const p1 = lat1 * Math.PI / 180
  const p2 = lat2 * Math.PI / 180
  const dp = (lat2 - lat1) * Math.PI / 180
  const dl = (lon2 - lon1) * Math.PI / 180

  const a =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) *
      Math.cos(p2) *
      Math.sin(dl / 2) *
      Math.sin(dl / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export function detectRiskZone(latitude, longitude) {
  const insideZones = RISK_ZONES
    .map(zone => ({
      ...zone,
      distance: haversine(
        latitude,
        longitude,
        zone.lat,
        zone.lng
      )
    }))
    .filter(zone => zone.distance <= zone.radius)

  return (
    insideZones.find(zone => zone.level === 'HIGH') ||
    insideZones.find(zone => zone.level === 'MEDIUM') ||
    insideZones.find(zone => zone.level === 'LOW') ||
    null
  )
}

export default function SafetyMap({ location }) {
  if (!location) return null

  return (
    <div
      style={{
        height: '210px',
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden'
      }}
    >
      <MapContainer
        center={[location.latitude, location.longitude]}
        zoom={14}
        style={{
          height: '100%',
          width: '100%'
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {RISK_ZONES.map(zone => (
          <Circle
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{
              color:
                zone.level === 'HIGH'
                  ? '#dc2626'
                  : zone.level === 'MEDIUM'
                    ? '#f59e0b'
                    : '#22c55e',
              fillColor:
                zone.level === 'HIGH'
                  ? '#dc2626'
                  : zone.level === 'MEDIUM'
                    ? '#f59e0b'
                    : '#22c55e',
              fillOpacity: 0.15,
              weight: 2
            }}
          />
        ))}

        <Marker
          position={[
            location.latitude,
            location.longitude
          ]}
        />
      </MapContainer>
    </div>
  )
}
