import { useEffect, useState } from 'react'
import { getEvents, type GraphEvent } from '../lib/getEvents'
import './GraphEvents.css'

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatUnix(ts: string): string {
  const n = parseInt(ts, 10)
  if (!n) return '—'
  return new Date(n * 1000).toLocaleString()
}

type Status = 'upcoming' | 'live' | 'ended'

function getStatus(startTime: string, endTime: string): Status {
  const now = Math.floor(Date.now() / 1000)
  const start = parseInt(startTime, 10)
  const end = parseInt(endTime, 10)
  if (now < start) return 'upcoming'
  if (now >= start && now <= end) return 'live'
  return 'ended'
}

const STATUS_LABELS: Record<Status, string> = {
  upcoming: '🗓 Upcoming',
  live: '🔴 Live Now',
  ended: '✅ Ended',
}

const STATUS_CLASSES: Record<Status, string> = {
  upcoming: 'badge badge--upcoming',
  live: 'badge badge--live',
  ended: 'badge badge--ended',
}

// ── EventCard ─────────────────────────────────────────────────────────────────
function EventCard({ event }: { event: GraphEvent }) {
  const status = getStatus(event.startTime, event.endTime)

  return (
    <article className="event-card">
      <div className="event-card__header">
        <h3 className="event-card__name">{event.name || '(Unnamed Event)'}</h3>
        <span className={STATUS_CLASSES[status]}>{STATUS_LABELS[status]}</span>
      </div>

      {event.description && (
        <p className="event-card__desc">{event.description}</p>
      )}

      <ul className="event-card__meta">
        <li>
          <span className="meta-label">📍 Location</span>
          <span className="meta-value">{event.location || '—'}</span>
        </li>
        <li>
          <span className="meta-label">🟢 Start</span>
          <span className="meta-value">{formatUnix(event.startTime)}</span>
        </li>
        <li>
          <span className="meta-label">🔴 End</span>
          <span className="meta-value">{formatUnix(event.endTime)}</span>
        </li>
        <li>
          <span className="meta-label">👤 Creator</span>
          <span className="meta-value event-card__addr">
            {event.creator}
          </span>
        </li>
        <li>
          <span className="meta-label">🆔 Event ID</span>
          <span className="meta-value">#{event.id}</span>
        </li>
      </ul>
    </article>
  )
}

// ── GraphEvents ───────────────────────────────────────────────────────────────
export function GraphEvents() {
  const [events, setEvents] = useState<GraphEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getEvents()
      .then((data) => {
        if (!cancelled) {
          setEvents(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch events')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="ge-state">
        <div className="ge-spinner" />
        <p>Fetching events from The Graph…</p>
      </div>
    )
  }

  if (error) {
    // const isNotDeployed =
    //   error.includes('does not exist') || error.includes('deployment')
// const isNotDeployed = error.includes('does not exist') || error.includes('deployment')
const isNotDeployed = false;
    return (
      <div className="ge-state ge-state--error" style={{ maxWidth: '560px', margin: '2rem auto', textAlign: 'left', padding: '2rem', borderRadius: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
        <p style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {isNotDeployed ? '🔌 Subgraph Not Yet Deployed' : '⚠️ Graph Error'}
        </p>

        {isNotDeployed ? (
          <>
            <p style={{ color: '#94a3b8', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              The Graph Studio doesn't have an active deployment for the{' '}
              <code style={{ background: 'rgba(255,255,255,0.08)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}>chain-link</code>{' '}
              subgraph yet. The "Events" tab will work once you deploy and sync your subgraph.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f97316', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Steps to fix</p>
              <ol style={{ paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.9, margin: 0 }}>
                <li>Go to <a href="https://thegraph.com/studio/" target="_blank" rel="noreferrer" style={{ color: '#f97316' }}>thegraph.com/studio</a> and sign in.</li>
                <li>Create a subgraph named <strong>chain-link</strong> (or verify the slug matches your existing one).</li>
                <li>In the <code style={{ fontSize: '0.78rem' }}>chain-link/</code> folder, run <code style={{ fontSize: '0.78rem' }}>graph deploy chain-link</code>.</li>
                <li>Wait for the subgraph to sync, then click <strong>Retry</strong> below.</li>
              </ol>
            </div>
          </>
        ) : (
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.75rem', margin: '0.5rem 0 1.25rem', color: '#fca5a5' }}>{error}</pre>
        )}

        <button
          onClick={() => { setError(null); setLoading(true); getEvents().then(setEvents).catch((e) => setError(e.message)).finally(() => setLoading(false)) }}
          style={{ background: 'linear-gradient(135deg,#f97316,#ef4444)', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.6rem 1.4rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
        >
          ↺ Retry
        </button>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="ge-state">
        <p>No events indexed yet. Create one using the Control Desk!</p>
      </div>
    )
  }

  return (
    <div className="ge-grid">
      {events.map((ev) => (
        <EventCard key={ev.id} event={ev} />
      ))}
    </div>
  )
}
