import { useEffect, useState } from 'react'
import SafetyMap, { detectRiskZone } from './components/SafetyMap'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const demoLocation = { latitude: 25.5788, longitude: 91.8933 }
const api = async (path, options) => { const r = await fetch(`${API}${path}`, options); const data = await r.json(); if (!r.ok) throw new Error(data.detail || 'Request failed'); return data }

export default function App() {
  const [id, setId] = useState(localStorage.getItem('tourist_id') || '')
  const [tourist, setTourist] = useState(null)
  const [location, setLocation] = useState(demoLocation)
  const [risk, setRisk] = useState('SAFE')
  const [zone, setZone] = useState(null)
  const [incident, setIncident] = useState(null)
  const [sending, setSending] = useState(false)
  const [screen, setScreen] = useState('home')
  const [message, setMessage] = useState('')
  const detectedZone = detectRiskZone(
  location.latitude,
  location.longitude
)
  const load = async (value = id) => { try { const profile = await api(`/api/tourists/${value.toUpperCase()}`); setTourist(profile); setId(profile.tourist_id); localStorage.setItem('tourist_id', profile.tourist_id); setMessage('') } catch (e) { setMessage(e.message) } }
  useEffect(() => { if (id) load(id); if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => setLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude }), () => {}) }, [])
  useEffect(() => { if (!incident) return; const tick = setInterval(async () => { try { const all = await api('/api/incidents'); const current = all.find(item => item.id === incident.incident_id); if (current) setIncident({ ...incident, status: current.status }) } catch {} }, 1800); return () => clearInterval(tick) }, [incident])
  useEffect(() => {
  if (detectedZone) {
    setRisk(detectedZone.level)
    setZone(detectedZone.name)
  } else {
    setRisk('SAFE')
    setZone(null)
  }
}, [location.latitude, location.longitude])
    const simulateRisk = async () => { const risky = risk === 'SAFE'; setRisk(risky ? 'HIGH' : 'SAFE'); setZone(risky ? 'Restricted hillside trail' : null); setLocation(risky ? { latitude: 25.5795, longitude: 91.8940 } : demoLocation); if (tourist) try { await api('/api/risk-events', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ tourist_id: tourist.tourist_id, latitude: risky?25.5795:demoLocation.latitude, longitude:risky?91.8940:demoLocation.longitude, event:risky?'ENTERED_RISK_ZONE':'EXITED_RISK_ZONE' }) }) } catch {} }
  const sos = async () => { if (!tourist) return; setSending(true); try { const result = await api('/api/incidents/sos', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ tourist_id: tourist.tourist_id, ...location }) }); setIncident(result); setScreen('sos') } catch (e) { setMessage(e.message) } finally { setSending(false) } }
  if (!tourist) return <div className="phone activation"><div className="mark">⬡</div><p className="overline">GOVERNMENT OF MEGHALAYA</p><h1>Tourist<br/><em>Shield</em></h1><p className="intro">Your temporary digital companion for a safer journey.</p><label>TOURIST ID<input placeholder="NE-26-1028" value={id} onChange={e=>setId(e.target.value.toUpperCase())}/></label><button className="continue" onClick={()=>load()}>CONTINUE →</button>{message&&<p className="error">{message}</p>}<p className="hint">Get your Tourist ID from the entry checkpost.</p></div>
  const state = incident?.status
  return (
  <div className="phone">
    <header>
      <div className="app-brand">
        <span>⬡</span>
        <b>
          TOURIST
          <br />
          SHIELD
        </b>
      </div>

      <button className="help">? HELP</button>
    </header>

    {screen === 'id' ? (
      <DigitalID
        tourist={tourist}
        back={() => setScreen('home')}
      />
    ) : screen === 'sos' ? (
      <SOSScreen
        incident={incident}
        back={() => setScreen('home')}
      />
    ) : (
      <>
        <div className="welcome">
          <p>WELCOME BACK</p>

          <h1>
            {tourist.name.split(' ')[0]} <span>👋</span>
          </h1>

          <small>
            Tourist ID · {tourist.tourist_id}
          </small>
        </div>

        <section className={`safety ${risk}`}>
          <div className="ring">
            {risk === 'SAFE' ? '✓' : '!'}
          </div>

          <div>
            <p>YOU'RE IN A {risk} ZONE</p>

            <h2>
              {risk === 'SAFE'
                ? 'You are safe'
                : 'High-risk zone ahead'}
            </h2>

            <small>
              {risk === 'SAFE'
                ? 'Shillong · Location sharing is active'
                : `${zone}. Please return to the recommended route.`}
            </small>
          </div>
        </section>

        {risk !== 'SAFE' && (
          <section className="warning">
            <b>⚠ SAFETY ALERT</b>
            <p>
              You have entered a restricted area. Return to the
              recommended route.
            </p>
          </section>
        )}

        <section className="map">
          <span>📍 LIVE LOCATION</span>

          <small>
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </small>

          <SafetyMap location={location} />

          <button
            type="button"
            onClick={simulateRisk}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '10px',
              cursor: 'pointer'
            }}
          >
            {risk === 'SAFE'
              ? 'SIMULATE RISK ZONE'
              : 'RETURN TO SAFE ZONE'}
          </button>
        </section>
        <section className="sos-wrap">
          <p>IN AN EMERGENCY?</p>

          <button
            className="sos"
            onClick={sos}
            disabled={sending}
          >
            <span>🆘</span>
            {sending ? 'SENDING...' : 'SOS'}
          </button>

          <small>
            Press to instantly alert the nearest control room
          </small>
        </section>

        <button
          className="id-link"
          onClick={() => setScreen('id')}
        >
          ▦
          <span>
            DIGITAL TOURIST ID
            <small>Show at checkpoints</small>
          </span>
          ›
        </button>
      </>
    )}
  </div>
)
}
function DigitalID({tourist,back}) { return <><button className="back" onClick={back}>‹ HOME</button><div className="id-page"><p className="overline">VERIFIABLE DIGITAL PASS</p><h1>Your Tourist ID</h1><div className="id-card"><div className="id-logo">⬡ TOURIST SHIELD</div><div className="id-qr">▦<br/>▦</div><p>TOURIST ID</p><h2>{tourist.tourist_id}</h2><h3>{tourist.name}</h3><div><span className="active-dot">● ACTIVE</span><small>Valid until {tourist.expected_exit_date}</small></div></div><p className="id-note">This ID automatically expires once your journey has ended.</p></div></> }
function SOSScreen({incident,back}) { const copy = incident?.status === 'NEW' ? ['SOS SENT', 'Contacting the nearest control room...', 'Your live location and emergency contact have been shared.'] : incident?.status === 'ACCEPTED' ? ['HELP REQUEST ACCEPTED', 'A response team has been notified.', 'Please stay in a safe, visible place. Help is on the way.'] : ['INCIDENT RESOLVED', 'The control room has closed this request.', 'Thank you for confirming that you are safe.']; return <div className={`sos-screen ${incident?.status}`}><div className="sos-pulse">{incident?.status==='RESOLVED'?'✓':'🆘'}</div><p className="overline">EMERGENCY RESPONSE</p><h1>{copy[0]}</h1><p className="response-copy">{copy[1]}</p><div className="response-status"><b>{incident?.status==='NEW'?'● REQUEST RECEIVED':incident?.status==='ACCEPTED'?'✓ CONTROL ROOM ACCEPTED':'✓ CASE CLOSED'}</b><p>{copy[2]}</p></div><button className="return" onClick={back}>RETURN TO HOME</button></div> }
