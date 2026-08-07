import { useEffect, useState } from 'react'
import SafetyMap, { detectRiskZone } from './components/SafetyMap'
import { useTouristRealtime } from './useTouristRealtime'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const demoLocation = { latitude: 25.5788, longitude: 91.8933 }
const api = async (path, options) => { const r = await fetch(`${API}${path}`, options); const data = await r.json(); if (!r.ok) throw new Error(data.detail || 'Request failed'); return data }

function VerificationPage({ touristId }) {
  const [tourist, setTourist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const verifyTourist = async () => {
      try {
        const data = await api(
          `/api/tourists/${encodeURIComponent(touristId)}`
        )

        setTourist(data)
      } catch (err) {
        setError(err.message || 'Tourist ID could not be verified.')
      } finally {
        setLoading(false)
      }
    }

    verifyTourist()
  }, [touristId])

  if (loading) {
    return (
      <div className="verification-page">
        <div className="verification-card verification-loading">
          <div className="verification-logo">⬡</div>
          <p className="overline">TOURIST SHIELD</p>
          <h1>Verifying Tourist ID...</h1>
          <p>Checking the digital pass with TouristShield.</p>
        </div>
      </div>
    )
  }

  if (error || !tourist) {
    return (
      <div className="verification-page">
        <div className="verification-card verification-invalid">
          <div className="verification-icon">!</div>

          <p className="overline">
            TOURIST SHIELD · VERIFICATION
          </p>

          <h1>Tourist ID Not Verified</h1>

          <p>
            This Tourist ID could not be found or is no longer
            available.
          </p>

          <div className="verification-id">
            {touristId}
          </div>
        </div>
      </div>
    )
  }

  const isActive = tourist.status === 'ACTIVE'

  return (
    <div className="verification-page">
      <div className="verification-card">

        <div className="verification-brand">
          <span>⬡</span>

          <div>
            <b>TOURIST SHIELD</b>
            <small>GOVERNMENT OF MEGHALAYA</small>
          </div>
        </div>

        <div
          className={`verification-status ${
            isActive ? 'verified' : 'inactive'
          }`}
        >
          <div className="verification-check">
            {isActive ? '✓' : '!'}
          </div>

          <p>
            {isActive
              ? 'VERIFIED DIGITAL TOURIST ID'
              : 'TOURIST ID INACTIVE'}
          </p>

          <h1>
            {isActive
              ? 'Identity Verified'
              : 'Pass Not Active'}
          </h1>

          <small>
            {isActive
              ? 'This digital tourist pass is valid.'
              : 'This tourist pass is no longer active.'}
          </small>
        </div>

        <div className="verification-details">

          <p className="verification-label">
            TOURIST ID
          </p>

          <h2>{tourist.tourist_id}</h2>

          <div className="verification-row">
            <span>Traveller</span>
            <b>{tourist.name}</b>
          </div>

          <div className="verification-row">
            <span>Entry point</span>
            <b>{tourist.entry_point}</b>
          </div>

          <div className="verification-row">
            <span>Valid until</span>
            <b>{tourist.expected_exit_date}</b>
          </div>

          <div className="verification-row">
            <span>Status</span>

            <b className={isActive ? 'status-active' : 'status-inactive'}>
              ● {tourist.status}
            </b>
          </div>

        </div>

        <div className="verification-footer">
          <span>⬡</span>

          <p>
            Verified through the TouristShield safety network.
          </p>
        </div>

      </div>
    </div>
  )
}

export default function App() {
  const [id, setId] = useState(
    localStorage.getItem('tourist_id') || ''
  )
  const [tourist, setTourist] = useState(null)
  const [location, setLocation] = useState(demoLocation)
  const [riskZones, setRiskZones] = useState([])
  const [risk, setRisk] = useState('SAFE')
  const [zone, setZone] = useState(null)
  const [incident, setIncident] = useState(null)
  const [sending, setSending] = useState(false)
  const [screen, setScreen] = useState('home')
  const [message, setMessage] = useState('')

  const detectedZone = detectRiskZone(
    location.latitude,
    location.longitude,
    riskZones
  )

  // P3 REALTIME INTEGRATION
  // Listens for ACCEPTED / RESOLVED changes to the active SOS.
  useTouristRealtime(
    incident?.incident_id,
    (newStatus) => {
      setIncident((current) =>
        current
          ? { ...current, status: newStatus }
          : current
      )
    }
  )

  const load = async (value = id) => {
    try {
      const profile = await api(
        `/api/tourists/${value.toUpperCase()}`
      )

      setTourist(profile)
      setId(profile.tourist_id)

      localStorage.setItem(
        'tourist_id',
        profile.tourist_id
      )

      setMessage('')
    } catch (e) {
      setMessage(e.message)
    }
  }

  // Fetch live risk zones on mount
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const zones = await api('/api/risk-zones')
        setRiskZones(zones || [])
      } catch (e) {
        console.error('Failed to fetch risk zones:', e)
      }
    }
    fetchZones()
  }, [])

  // Load tourist + get browser location
  useEffect(() => {
    if (id) {
      load(id)
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) =>
          setLocation({
            latitude: p.coords.latitude,
            longitude: p.coords.longitude
          }),
        () => {}
      )
    }
  }, [])

  // Detect whether current location falls inside a risk zone
  useEffect(() => {
    if (detectedZone) {
      setRisk(detectedZone.risk_level || detectedZone.level || 'CAUTION')
      setZone(detectedZone.name)
    } else {
      setRisk('SAFE')
      setZone(null)
    }
  }, [location.latitude, location.longitude, detectedZone])

  const simulateRisk = async () => {
    const risky = risk === 'SAFE'
    const targetZone = riskZones.length > 0 ? riskZones[0] : null
    const targetZoneId = targetZone ? targetZone.id : '1b8fa19b-a8e2-4502-89e9-5be45c11922b'

    const newLocation = risky
      ? {
          latitude: targetZone?.latitude ?? 25.5788,
          longitude: targetZone?.longitude ?? 91.8933
        }
      : demoLocation

    setLocation(newLocation)

    if (tourist) {
      try {
        await api('/api/risk-events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tourist_id: tourist.tourist_id,
            risk_zone_id: targetZoneId,
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
            event_type: risky
              ? 'ENTERED_RISK_ZONE'
              : 'EXITED_RISK_ZONE'
          })
        })
      } catch (e) {
        console.error('Risk event failed:', e)
      }
    }
  }
  const path = window.location.pathname
  const verifyMatch = path.match(/^\/verify\/([^/]+)\/?$/)

  if (verifyMatch) {
    return (
      <VerificationPage
        touristId={decodeURIComponent(verifyMatch[1]).toUpperCase()}
      />
    )
  }

  const sos = async () => {
    if (!tourist) return

    setSending(true)

    try {
      const result = await api('/api/incidents/sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tourist_id: tourist.tourist_id,
          ...location
        })
      })

      setIncident(result)
      setScreen('sos')
    } catch (e) {
      setMessage(e.message)
    } finally {
      setSending(false)
    }
  }

  // Tourist activation/login screen
  if (!tourist) {
    return (
      <div className="phone activation">
        <div className="mark">⬡</div>

        <p className="overline">
          GOVERNMENT OF MEGHALAYA
        </p>

        <h1>
          Tourist
          <br />
          <em>Shield</em>
        </h1>

        <p className="intro">
          Your temporary digital companion for a safer journey.
        </p>

        <label>
          TOURIST ID

          <input
            placeholder="NE-26-1028"
            value={id}
            onChange={(e) =>
              setId(e.target.value.toUpperCase())
            }
          />
        </label>

        <button
          className="continue"
          onClick={() => load()}
        >
          CONTINUE →
        </button>

        {message && (
          <p className="error">{message}</p>
        )}

        <p className="hint">
          Get your Tourist ID from the entry checkpost.
        </p>
      </div>
    )
  }

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

        <button className="help">
          ? HELP
        </button>
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
              {tourist.name.split(' ')[0]}{' '}
              <span>👋</span>
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
              <p>
                YOU'RE IN A {risk} ZONE
              </p>

              <h2>
                {risk === 'SAFE'
                  ? 'You are safe'
                  : 'High-risk zone ahead'}
              </h2>

              <small>
                {risk === 'SAFE'
                  ? 'Shillong · Location sharing is active'
                  : `${zone || 'Risk Zone'}. Please return to the recommended route.`}
              </small>
            </div>
          </section>

          {risk !== 'SAFE' && (
            <section className="warning">
              <b>⚠ SAFETY ALERT</b>

              <p>
                You have entered a restricted area.
                Return to the recommended route.
              </p>
            </section>
          )}

          <section className="map">
            <span>
              📍 LIVE LOCATION
            </span>

            <small>
              {location.latitude.toFixed(4)},{' '}
              {location.longitude.toFixed(4)}
            </small>

            <SafetyMap location={location} riskZones={riskZones} />

            <button
              type="button"
              onClick={simulateRisk}
            >
              {risk === 'SAFE'
                ? 'SIMULATE RISK ZONE'
                : 'RETURN TO SAFE ZONE'}
            </button>
          </section>

          <section className="sos-wrap">
            <p>
              IN AN EMERGENCY?
            </p>

            <button
              className="sos"
              onClick={sos}
              disabled={sending}
            >
              <span>🆘</span>

              {sending
                ? 'SENDING...'
                : 'SOS'}
            </button>

            <small>
              Press to instantly alert the nearest
              control room
            </small>
          </section>

          <button
            className="id-link"
            onClick={() => setScreen('id')}
          >
            ▦

            <span>
              DIGITAL TOURIST ID

              <small>
                Show at checkpoints
              </small>
            </span>

            ›
          </button>
        </>
      )}
    </div>
  )
}

function DigitalID({ tourist, back }) {
  return (
    <>
      <button className="back" onClick={back}>
        ‹ HOME
      </button>

      <div className="id-page">
        <p className="overline">VERIFIABLE DIGITAL PASS</p>

        <h1>Your Tourist ID</h1>

        <div className="id-card">
          <div className="id-logo">⬡ TOURIST SHIELD</div>

          {tourist.qr_code ? (
            <img
              src={tourist.qr_code}
              alt={`QR code for ${tourist.tourist_id}`}
              className="digital-qr"
              style={{ width: '140px', height: '140px', margin: '16px auto', display: 'block', borderRadius: '8px' }}
            />
          ) : (
            <div className="id-qr">
              ▦<br />▦
            </div>
          )}

          <p>TOURIST ID</p>

          <h2>{tourist.tourist_id}</h2>

          <h3>{tourist.name}</h3>

          <div>
            <span className="active-dot">● {tourist.status || 'ACTIVE'}</span>

            <small>Valid until {tourist.expected_exit_date}</small>
          </div>
        </div>

        <p className="id-note">
          This ID automatically expires once your journey has ended.
        </p>
      </div>
    </>
  )
}

function SOSScreen({ incident, back }) {
  const status = incident?.status || 'NEW'

  const copy =
    status === 'NEW'
      ? [
          'SOS SENT',
          'Contacting the nearest control room...',
          'Your live location and emergency contact have been shared.'
        ]
      : status === 'ACCEPTED'
      ? [
          'HELP REQUEST ACCEPTED',
          'A response team has been notified.',
          'Please stay in a safe, visible place. Help is on the way.'
        ]
      : [
          'INCIDENT RESOLVED',
          'The control room has closed this request.',
          'Thank you for confirming that you are safe.'
        ]

  return (
    <div className={`sos-screen ${status}`}>
      <div className="sos-pulse">
        {status === 'RESOLVED' ? '✓' : '🆘'}
      </div>

      <p className="overline">EMERGENCY RESPONSE</p>

      <h1>{copy[0]}</h1>

      <p className="response-copy">{copy[1]}</p>

      <div className="response-status">
        <b>
          {status === 'NEW'
            ? '● REQUEST RECEIVED'
            : status === 'ACCEPTED'
            ? '✓ CONTROL ROOM ACCEPTED'
            : '✓ CASE CLOSED'}
        </b>

        <p>{copy[2]}</p>
      </div>

      <button className="return" onClick={back}>
        RETURN TO HOME
      </button>
    </div>
  )
}