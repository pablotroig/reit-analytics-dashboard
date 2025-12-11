import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'


type ReitSnapshot = {
  ticker: string
  name: string
  sector: string
  dividendYield: number
  totalReturn1Y: number
}

type SortBy = 'ticker' | 'dividendYield' | 'totalReturn1Y'
type Order = 'asc' | 'desc'

function ReitListPage() {
  const [reits, setReits] = useState<ReitSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [sector, setSector] = useState('')
  const [minDividendYield, setMinDividendYield] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('ticker')
  const [order, setOrder] = useState<Order>('asc')

  const navigate = useNavigate()

  async function fetchReits() {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()

      if (sector) params.set('sector', sector)
      if (minDividendYield) params.set('minDividendYield', minDividendYield)
      if (sortBy) params.set('sortBy', sortBy)
      if (order) params.set('order', order)

      const response = await fetch(
        `http://localhost:3000/reits?${params.toString()}`,
      )

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data: ReitSnapshot[] = await response.json()
      setReits(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReits()
  }, [sector, minDividendYield, sortBy, order])

  const totalReits = reits.length
  const avgDividendYield =
    totalReits === 0
      ? 0
      : reits.reduce((sum, r) => sum + r.dividendYield, 0) / totalReits

  const bestByReturn =
    reits.length === 0
      ? null
      : reits.reduce<ReitSnapshot | null>((best, current) => {
          if (!best) return current
          return current.totalReturn1Y > best.totalReturn1Y ? current : best
        }, null)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>REIT Analytics Dashboard</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <label style={{ fontSize: 12, display: 'block' }}>Sector</label>
          <input
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="e.g. Retail"
            style={{ width: '100%', padding: '0.25rem 0.5rem' }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, display: 'block' }}>
            Min Dividend Yield (%)
          </label>
          <input
            value={minDividendYield}
            onChange={(e) => setMinDividendYield(e.target.value)}
            placeholder="e.g. 4"
            style={{ width: '100%', padding: '0.25rem 0.5rem' }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, display: 'block' }}>Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            style={{ width: '100%', padding: '0.25rem 0.5rem' }}
          >
            <option value="ticker">Ticker</option>
            <option value="dividendYield">Dividend Yield</option>
            <option value="totalReturn1Y">1Y Total Return</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: 12, display: 'block' }}>Order</label>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as Order)}
            style={{ width: '100%', padding: '0.25rem 0.5rem' }}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {!loading && !error && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              padding: '1rem',
              borderRadius: 8,
              border: '1px solid #333',
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.8 }}>REITs in view</div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{totalReits}</div>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: 8,
              border: '1px solid #333',
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Avg Dividend Yield
            </div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>
              {avgDividendYield.toFixed(2)}%
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: 8,
              border: '1px solid #333',
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.8 }}>Best 1Y Performer</div>
            {bestByReturn ? (
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {bestByReturn.ticker} ({bestByReturn.totalReturn1Y.toFixed(2)}
                  %)
                </div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  {bestByReturn.name}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 16 }}>—</div>
            )}
          </div>
        </div>
      )}

      {loading && <p>Loading REITs...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #ddd',
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#111', color: '#fff' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Ticker</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Sector</th>
              <th style={{ textAlign: 'right', padding: '0.5rem' }}>
                Dividend Yield (%)
              </th>
              <th style={{ textAlign: 'right', padding: '0.5rem' }}>
                1Y Total Return (%)
              </th>
            </tr>
          </thead>
          <tbody>
            {reits.map((reit) => (
              <tr
                key={reit.ticker}
                onClick={() => navigate(`/reit/${reit.ticker}`)}
                style={{ cursor: 'pointer' }}
              >
                <td style={{ padding: '0.5rem', borderTop: '1px solid #eee' }}>
                  {reit.ticker}
                </td>
                <td style={{ padding: '0.5rem', borderTop: '1px solid #eee' }}>
                  {reit.name}
                </td>
                <td style={{ padding: '0.5rem', borderTop: '1px solid #eee' }}>
                  {reit.sector}
                </td>
                <td
                  style={{
                    padding: '0.5rem',
                    borderTop: '1px solid #eee',
                    textAlign: 'right',
                  }}
                >
                  {reit.dividendYield.toFixed(2)}
                </td>
                <td
                  style={{
                    padding: '0.5rem',
                    borderTop: '1px solid #eee',
                    textAlign: 'right',
                  }}
                >
                  {reit.totalReturn1Y.toFixed(2)}
                </td>
              </tr>
            ))}
            {reits.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: '1rem', textAlign: 'center' }}
                >
                  No REITs match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

function ReitDetailPage() {
  const { ticker } = useParams<{ ticker: string }>()
  const [reit, setReit] = useState<ReitSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [history, setHistory] = useState<{ date: string; price: number }[]>([])
  const [historyError, setHistoryError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDetails() {
      if (!ticker) return
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`http://localhost:3000/reits/${ticker}`)

        if (response.status === 404) {
          setError('REIT not found')
          setReit(null)
          return
        }

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data: ReitSnapshot = await response.json()
        setReit(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [ticker])

  useEffect(() => {
    async function fetchHistory() {
      if (!ticker) return
      try {
        setHistoryError(null)

        const res = await fetch(
          `http://localhost:3000/reits/${ticker}/history`
        )

        if (res.status === 404) {
          setHistory([]) // no history but not a crash
          return
        }

        if (!res.ok) {
          throw new Error(`History request failed with ${res.status}`)
        }

        const data: { date: string; price: number }[] = await res.json()
        setHistory(data)
      } catch (err) {
        console.error(err)
        setHistoryError('Failed to load history')
      }
    }

    fetchHistory()
  }, [ticker])

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem' }}>
      <Link to="/" style={{ color: '#61dafb', textDecoration: 'none' }}>
        ← Back to dashboard
      </Link>

      {loading && (
        <p style={{ marginTop: '1rem' }}>Loading REIT details...</p>
      )}
      {error && (
        <p style={{ marginTop: '1rem', color: 'red' }}>Error: {error}</p>
      )}

      {!loading && !error && reit && (
        <>
          <h1 style={{ marginTop: '1rem' }}>
            {reit.name} ({reit.ticker})
          </h1>
          <p style={{ marginTop: '0.5rem', fontSize: 16 }}>
            Sector: <strong>{reit.sector}</strong>
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '1rem',
              marginTop: '1.5rem',
            }}
          >
            <div
              style={{
                padding: '1rem',
                borderRadius: 8,
                border: '1px solid #333',
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.8 }}>Dividend Yield</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>
                {reit.dividendYield.toFixed(2)}%
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 8,
                border: '1px solid #333',
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                1-Year Total Return
              </div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>
                {reit.totalReturn1Y.toFixed(2)}%
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <h2 style={{ fontSize: 20, marginBottom: '0.75rem' }}>
              Price History
            </h2>

            {historyError && (
              <p style={{ color: 'red', marginBottom: '0.5rem' }}>
                {historyError}
              </p>
            )}

            {history.length === 0 && !historyError ? (
              <p>No history available.</p>
            ) : (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}


function App() {
  return (
    <Routes>
      <Route path="/" element={<ReitListPage />} />
      <Route path="/reit/:ticker" element={<ReitDetailPage />} />
    </Routes>
  )
}

export default App
