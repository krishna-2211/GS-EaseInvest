import { useEffect, useRef, useState } from 'react'
import { getMarketSummary } from '../api/market'

function IndexPill({ index }) {
  const up    = index.direction === 'up'
  const color = up ? '#16a34a' : '#b45309'
  return (
    <span
      className="rounded-full"
      style={{
        backgroundColor: 'rgba(255,255,255,0.6)',
        border:    '1px solid #d0dff0',
        padding:   '4px 12px',
        fontSize:  11,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {index.name} {up ? '↑' : '↓'}{Math.abs(index.change_pct)}%
    </span>
  )
}

export default function DontPanicBanner() {
  const [marketData, setMarketData] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const intervalRef = useRef(null)

  const fetchData = () =>
    getMarketSummary()
      .then(setMarketData)
      .catch(() => setMarketData(null))
      .finally(() => setLoading(false))

  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(fetchData, 300_000)
    return () => clearInterval(intervalRef.current)
  }, [])

  if (loading)                         return null
  if (marketData?.has_alert !== true)  return null

  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{ backgroundColor: '#e8f4fb', borderLeft: '3px solid #6B96C3' }}
    >
      <p className="font-bold text-gs-navy text-sm">No need to panic</p>
      <p className="text-gs-gray text-sm mt-0.5">{marketData.summary}</p>

      {marketData.indices?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {marketData.indices.map(idx => (
            <IndexPill key={idx.name} index={idx} />
          ))}
        </div>
      )}
    </div>
  )
}
