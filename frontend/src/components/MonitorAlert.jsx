import { useEffect, useRef, useState } from 'react'
import api from '../api/index'
import { getAlert, dismissAlert } from '../api/alerts'

export default function MonitorAlert({ userId }) {
  const [alert, setAlert]     = useState(null)
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef(null)

  const fetchAlert = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const data = await getAlert(userId)
      setAlert(data)
    } catch {
      setAlert({ has_alert: false })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlert()
    intervalRef.current = setInterval(fetchAlert, 300_000)
    return () => clearInterval(intervalRef.current)
  }, [userId])

  const handleDismiss = () => {
    dismissAlert(userId).catch(() => {})
    setAlert({ has_alert: false })
  }

  const handleTestAlert = async () => {
    setLoading(true)
    try {
      await api.post('/alerts/run-now')
      const data = await getAlert(userId)
      setAlert(data)
    } catch {
      setAlert({ has_alert: false })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-xs px-1" style={{ color: '#9ca3af' }}>
        Checking for alerts…
      </div>
    )
  }

  if (!alert?.has_alert) {
    if (import.meta.env.DEV) {
      return (
        <button
          onClick={handleTestAlert}
          className="text-xs px-3 py-1 rounded-lg self-start"
          style={{ border: '1px dashed #acd4f1', color: '#6B96C3', backgroundColor: '#f4f8fd' }}
        >
          🔔 Test alert (dev)
        </button>
      )
    }
    return null
  }

  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3"
      style={{ backgroundColor: '#fef3c7', borderLeft: '3px solid #b45309' }}
    >
      <span style={{ fontSize: 16, lineHeight: 1.5, flexShrink: 0 }}>⚠️</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold" style={{ color: '#92400e' }}>
            {alert.stock}
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#fde68a', color: '#92400e' }}
          >
            -{alert.drop_pct}%
          </span>
        </div>
        <p className="text-sm leading-snug" style={{ color: '#78350f' }}>
          {alert.message}
        </p>
        {import.meta.env.DEV && (
          <button
            onClick={handleTestAlert}
            className="mt-2 text-xs"
            style={{ color: '#b45309', textDecoration: 'underline' }}
          >
            Re-run monitor
          </button>
        )}
      </div>

      <button
        onClick={handleDismiss}
        className="shrink-0 text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
        style={{ border: '1px solid #b45309', color: '#b45309', backgroundColor: 'transparent' }}
      >
        Got it
      </button>
    </div>
  )
}
