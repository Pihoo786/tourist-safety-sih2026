import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const RISK_ZONES = [
  {
    id: 1,
    name: "Police Bazar",
    lat: 25.5795,
    lng: 91.8940,
    radius: 500,
    level: "HIGH"
  },
  {
    id: 2,
    name: "Laitumkhrah Market",
    lat: 25.5650,
    lng: 91.8850,
    radius: 400,
    level: "MEDIUM"
  },
  {
    id: 3,
    name: "Golf Course",
    lat: 25.5900,
    lng: 91.9000,
    radius: 600,
    level: "LOW"
  }
];

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


function App() {
  const [position, setPosition] = useState({
    lat: 25.5788,
    lng: 91.8933
  });

  /*const distance = haversine(
    position.lat,
    position.lng,
    RISK_ZONE.lat,
    RISK_ZONE.lng
  );*/

  // Check if user is inside ANY zone
function checkAllZones(lat, lng) {
  const insideZones = [];
  
  RISK_ZONES.forEach(zone => {
    const distance = haversine(lat, lng, zone.lat, zone.lng);
    if (distance <= zone.radius) {
      insideZones.push({
        ...zone,
        distance: Math.round(distance)
      });
    }
  });
  
  return insideZones;
}

// In your component, replace the old isInside check with:
const insideZones = checkAllZones(position.lat, position.lng);
const isInside = insideZones.length > 0;
const highestRisk = insideZones[0] || null; // First one is highest risk


  
  const goToRiskZone = () => {
    setPosition({ lat: 25.5800, lng: 91.8950 });
  };
  // Add these functions BEFORE the return statement
  const goToPoliceBazar = () => {
  setPosition({ lat: 25.5795, lng: 91.8940 });
  };

  const goToLaitumkhrah = () => {
    setPosition({ lat: 25.5650, lng: 91.8850 });
  };

  const goToGolfCourse = () => {
    setPosition({ lat: 25.5900, lng: 91.9000 });
  };

  const goToSafeZone = () => {
    setPosition({ lat: 25.5400, lng: 91.8600 });
  };  

  return {(
    <div style={{
      height: '100vh',
      width: '100%',
      backgroundColor: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* ============================================
          TOP HEADER BAR (Laptop Optimized)
          ============================================ */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 30px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 1000,
        height: '64px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🛡️</span>
          <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#1f2937' }}>
            SafeTour
          </span>
          <span style={{
            fontSize: '12px',
            padding: '4px 12px',
            backgroundColor: '#dbeafe',
            color: '#2563eb',
            borderRadius: '20px',
            fontWeight: '600'
          }}>
            DEMO v1.0
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            Tourist ID: <strong style={{ color: '#1f2937' }}>NE-1028</strong>
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            backgroundColor: isInside ? '#fee2e2' : '#dcfce7'
          }}>
            <span style={{ fontSize: '16px' }}>{isInside ? '🔴' : '🟢'}</span>
            <span style={{
              fontSize: '13px',
              fontWeight: '600',
              color: isInside ? '#dc2626' : '#16a34a'
            }}>
              {isInside ? 'HIGH RISK' : 'SAFE'}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================
          MAIN CONTENT (Map + Side Panel)
          ============================================ */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
      }}>
        
        {/* MAP - Takes 70% of width on laptop */}
        <div style={{ flex: '7', position: 'relative', height: '100%' }}>
          <MapContainer
            center={[25.5795, 91.8940]}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />

            {/* Render ALL risk zones */}
            {RISK_ZONES.map(zone => (
              <Circle
                key={zone.id}
                center={[zone.lat, zone.lng]}
                radius={zone.radius}
                pathOptions={{
                  color: zone.level === 'HIGH' ? '#dc2626' : 
                        zone.level === 'MEDIUM' ? '#f59e0b' : '#22c55e',
                  fillColor: zone.level === 'HIGH' ? '#dc2626' : 
                            zone.level === 'MEDIUM' ? '#f59e0b' : '#22c55e',
                  fillOpacity: 0.15,
                  weight: 2,
                  dashArray: '5, 5'
                }}
              />
            ))}
            
          

            <Marker position={[position.lat, position.lng]} />
          </MapContainer>

          {/* Floating SOS button on map */}
          <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          zIndex: 1000,
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: '12px',
          borderRadius: '12px',
          maxWidth: '90%'
        }}>
          <button 
            onClick={goToPoliceBazar} 
            style={{
              padding: '10px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔴 HIGH Risk
          </button>
          <button 
            onClick={goToLaitumkhrah} 
            style={{
              padding: '10px 16px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🟡 MEDIUM Risk
          </button>
          <button 
            onClick={goToGolfCourse} 
            style={{
              padding: '10px 16px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🟢 LOW Risk
          </button>
          <button 
            onClick={goToSafeZone} 
            style={{
              padding: '10px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ✅ Safe
          </button>
        </div>

        {/* ============================================
            RIGHT SIDE PANEL (30% of laptop screen)
            ============================================ */}
        <div style={{
          flex: '3',
          backgroundColor: 'white',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          borderLeft: '1px solid #e5e7eb',
          overflowY: 'auto'
        }}>
          
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            📍 Location Status
          </h2>

          {/* Status Card */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: isInside ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${isInside ? '#fca5a5' : '#86efac'}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '32px' }}>
                {isInside ? '⚠️' : '✅'}
              </span>
              <div>
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '18px',
                  color: isInside ? '#dc2626' : '#16a34a'
                }}>
                  {isInside ? 'High-Risk Zone' : 'Safe Zone'}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  {isInside 
                    ? 'Exercise caution in this area' 
                    : 'No immediate threats detected'}
                </div>
              </div>
            </div>
            <div style={{
              borderTop: `1px solid ${isInside ? '#fca5a5' : '#86efac'}`,
              paddingTop: '12px',
              fontSize: '14px',
              color: '#374151'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Distance to risk zone:</span>
                <strong>{Math.round(distance)} meters</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Risk zone:</span>
                <strong>{RISK_ZONE.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Risk level:</span>
                <strong style={{ color: '#dc2626' }}>{RISK_ZONE.level}</strong>
              </div>
            </div>
          </div>

          {/* Demo Controls */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#6b7280',
              margin: '0 0 12px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              🎮 Demo Controls
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={goToSafeZone}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#16a34a'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#22c55e'}
              >
                ✅ Safe
              </button>
              <button
                onClick={goToRiskZone}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
              >
                ⚠️ Risk
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
          }}>
            <div style={{
              padding: '14px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px' }}>📍</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                {Math.round(distance)}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>meters</div>
            </div>
            <div style={{
              padding: '14px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px' }}>🛡️</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                {isInside ? 'HIGH' : 'LOW'}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>risk level</div>
            </div>
          </div>

          <div style={{
            marginTop: 'auto',
            padding: '12px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            🧪 Demo Mode • SafeTour v1.0 • SIH25002
          </div>
        </div>
      </div>
    </div>
  );

export default App;