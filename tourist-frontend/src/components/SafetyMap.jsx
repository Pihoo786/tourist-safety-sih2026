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

const DEFAULT_RISK_ZONES = [
  {
    id: '1b8fa19b-a8e2-4502-89e9-5be45c11922b',
    name: 'Demo High Risk Zone',
    latitude: 25.5788,
    longitude: 91.8933,
    radius_m: 500,
    risk_level: 'HIGH'
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

export function detectRiskZone(latitude, longitude, zones = DEFAULT_RISK_ZONES) {
  if (!zones || !zones.length) return null

  const insideZones = zones
    .map(zone => {
      const zLat = zone.latitude ?? zone.lat
      const zLng = zone.longitude ?? zone.lng
      const zRad = zone.radius_m ?? zone.radius ?? 500
      const zLevel = zone.risk_level ?? zone.level ?? 'SAFE'
      return {
        ...zone,
        latitude: zLat,
        longitude: zLng,
        radius_m: zRad,
        risk_level: zLevel,
        distance: haversine(latitude, longitude, zLat, zLng)
      }
    })
    .filter(zone => zone.distance <= zone.radius_m)

  return (
    insideZones.find(zone => zone.risk_level === 'CRITICAL') ||
    insideZones.find(zone => zone.risk_level === 'HIGH') ||
    insideZones.find(zone => zone.risk_level === 'CAUTION') ||
    insideZones.find(zone => zone.risk_level === 'SAFE') ||
    null
  )
}

export default function SafetyMap({ location, riskZones = DEFAULT_RISK_ZONES }) {
  if (!location) return null
  const activeZones = (riskZones && riskZones.length) ? riskZones : DEFAULT_RISK_ZONES

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

        {activeZones.map(zone => {
          const zLat = zone.latitude ?? zone.lat
          const zLng = zone.longitude ?? zone.lng
          const zRad = zone.radius_m ?? zone.radius ?? 500
          const zLevel = zone.risk_level ?? zone.level ?? 'SAFE'
          const isDanger = zLevel === 'CRITICAL' || zLevel === 'HIGH'
          const isCaution = zLevel === 'CAUTION'
          const color = isDanger ? '#dc2626' : isCaution ? '#f59e0b' : '#22c55e'

          return (
            <Circle
              key={zone.id}
              center={[zLat, zLng]}
              radius={zRad}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.15,
                weight: 2
              }}
            />
          )
        })}

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
