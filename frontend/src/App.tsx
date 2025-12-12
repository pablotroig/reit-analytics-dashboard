import { useEffect, useMemo, useState } from 'react'
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

type ReitValuationResult = {
  ticker: string
  model: 'DDM'
  currentPrice: number
  dividendPerShare: number
  discountRate: number
  growthRate: number
  fairValue: number
  marginOfSafetyPct: number
}

type SortBy = 'ticker' | 'dividendYield' | 'totalReturn1Y'
type Order = 'asc' | 'desc'

function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function goToTicker() {
    const t = query.trim().toUpperCase()
    if (!t) return
    setQuery('')
    navigate(`/reit/${t}`)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background:
          'radial-gradient(1200px 600px at 20% 0%, rgba(79,70,229,0.20), transparent 60%), radial-gradient(900px 500px at 80% 10%, rgba(6,182,212,0.18), transparent 55%), #0b0f19',
        color: '#e5e7eb',
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          background: 'rgba(11, 15, 25, 0.75)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          width: '100%',
        }}
      >
        <div
          style={{
            width: '100%',
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.2 }}>
              REIT Analytics
            </div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Dashboard • Valuation • Research
            </div>
          </div>

          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(2, 6, 23, 0.65)',
                borderRadius: 999,
                padding: '0.35rem 0.55rem',
                width: 420,
                maxWidth: '42vw',
              }}
            >
              <span style={{ fontSize: 12, opacity: 0.75, paddingLeft: 6 }}>
                Search ticker
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') goToTicker()
                }}
                placeholder="e.g. AMT"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#e5e7eb',
                  padding: '0.35rem 0.5rem',
                }}
              />
              <button
                onClick={goToTicker}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 999,
                  padding: '0.45rem 0.85rem',
                  fontWeight: 700,
                  color: '#0b0f19',
                  background: 'linear-gradient(to right, #4f46e5, #06b6d4)',
                }}
              >
                Go
              </button>
            </div>

            <button
              onClick={() => navigate('/')}
              style={{
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(2, 6, 23, 0.65)',
                color: '#e5e7eb',
                padding: '0.55rem 0.9rem',
                borderRadius: 999,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Dashboard
            </button>

            <button
              style={{
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(2, 6, 23, 0.65)',
                color: '#9ca3af',
                padding: '0.55rem 0.9rem',
                borderRadius: 999,
                cursor: 'not-allowed',
                fontWeight: 700,
              }}
              title="Sidebar navigation coming next"
              disabled
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <main
        style={{
          width: '100%',
          padding: '2.5rem 2rem',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </main>
    </div>
  )
}

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
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`)

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
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: 44, margin: 0, letterSpacing: -0.8 }}>
          REIT Analytics Dashboard
        </h1>
        <p style={{ marginTop: 10, marginBottom: 0, opacity: 0.8, maxWidth: 760 }}>
          Screen, compare, and value REITs using fast filters and a valuation lab.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(260px, 1.25fr) minmax(260px, 1.25fr) minmax(220px, 1fr) minmax(220px, 1fr)',
          columnGap: '2rem',
          rowGap: '1.25rem',
          marginBottom: '1.75rem',
          padding: '1.5rem',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(2, 6, 23, 0.55)',
        }}
      >
        <div>
          <label style={{ fontSize: 12, display: 'block', opacity: 0.85 }}>Sector</label>
          <input
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="e.g. Retail"
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(3, 7, 18, 0.75)',
              color: '#e5e7eb',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, display: 'block', opacity: 0.85 }}>
            Min Dividend Yield (%)
          </label>
          <input
            value={minDividendYield}
            onChange={(e) => setMinDividendYield(e.target.value)}
            placeholder="e.g. 4"
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(3, 7, 18, 0.75)',
              color: '#e5e7eb',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, display: 'block', opacity: 0.85 }}>Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(3, 7, 18, 0.75)',
              color: '#e5e7eb',
              outline: 'none',
            }}
          >
            <option value="ticker">Ticker</option>
            <option value="dividendYield">Dividend Yield</option>
            <option value="totalReturn1Y">1Y Total Return</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: 12, display: 'block', opacity: 0.85 }}>Order</label>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as Order)}
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(3, 7, 18, 0.75)',
              color: '#e5e7eb',
              outline: 'none',
            }}
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
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              padding: '1rem',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(2, 6, 23, 0.55)',
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.8 }}>REITs in view</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{totalReits}</div>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(2, 6, 23, 0.55)',
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.8 }}>Avg Dividend Yield</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              {avgDividendYield.toFixed(2)}%
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(2, 6, 23, 0.55)',
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.8 }}>Best 1Y Performer</div>
            {bestByReturn ? (
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>
                  {bestByReturn.ticker} ({bestByReturn.totalReturn1Y.toFixed(2)}%)
                </div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{bestByReturn.name}</div>
              </div>
            ) : (
              <div style={{ fontSize: 16 }}>—</div>
            )}
          </div>
        </div>
      )}

      {loading && <p>Loading REITs...</p>}
      {error && <p style={{ color: '#f87171' }}>Error: {error}</p>}

      {!loading && !error && (
        <div
          style={{
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(2, 6, 23, 0.55)',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Ticker</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Sector</th>
                <th style={{ textAlign: 'right', padding: '0.75rem' }}>Dividend Yield (%)</th>
                <th style={{ textAlign: 'right', padding: '0.75rem' }}>1Y Total Return (%)</th>
              </tr>
            </thead>
            <tbody>
              {reits.map((reit) => (
                <tr
                  key={reit.ticker}
                  onClick={() => navigate(`/reit/${reit.ticker}`)}
                  style={{
                    cursor: 'pointer',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <td style={{ padding: '0.75rem', fontWeight: 800 }}>{reit.ticker}</td>
                  <td style={{ padding: '0.75rem' }}>{reit.name}</td>
                  <td style={{ padding: '0.75rem', opacity: 0.9 }}>{reit.sector}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {reit.dividendYield.toFixed(2)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {reit.totalReturn1Y.toFixed(2)}
                  </td>
                </tr>
              ))}
              {reits.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', opacity: 0.8 }}>
                    No REITs match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

  const [valuation, setValuation] = useState<ReitValuationResult | null>(null)
  const [valuationLoading, setValuationLoading] = useState(false)
  const [valuationError, setValuationError] = useState<string | null>(null)

  const [discountRate, setDiscountRate] = useState(0.08)
  const [growthRate, setGrowthRate] = useState(0.02)

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
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
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
        const res = await fetch(`http://localhost:3000/reits/${ticker}/history`)
        if (res.status === 404) {
          setHistory([])
          return
        }
        if (!res.ok) throw new Error(`History request failed with ${res.status}`)
        const data: { date: string; price: number }[] = await res.json()
        setHistory(data)
      } catch (err) {
        console.error(err)
        setHistoryError('Failed to load history')
      }
    }
    fetchHistory()
  }, [ticker])

  async function runValuation(discount: number, growth: number) {
    if (!ticker) return
    try {
      setValuationLoading(true)
      setValuationError(null)

      const response = await fetch(`http://localhost:3000/reits/${ticker}/valuation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountRate: discount, growthRate: growth }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        const message = (payload && (payload as any).error) || 'Failed to calculate valuation'
        throw new Error(message)
      }

      setValuation(payload as ReitValuationResult)
    } catch (err) {
      setValuation(null)
      setValuationError(err instanceof Error ? err.message : 'Failed to calculate valuation')
    } finally {
      setValuationLoading(false)
    }
  }

  function computeDdmFairValue(d0: number, r: number, g: number) {
    if (r <= g) return null
    const d1 = d0 * (1 + g)
    return d1 / (r - g)
  }

  function buildSensitivityGrid(
    d0: number,
    price: number,
    discountRates: number[],
    growthRates: number[],
  ) {
    return discountRates.map((r) => {
      const cells = growthRates.map((g) => {
        const fv = computeDdmFairValue(d0, r, g)
        const mos = fv === null || price === 0 ? null : ((fv - price) / price) * 100
        return { r, g, fairValue: fv, marginOfSafetyPct: mos }
      })
      return { r, cells }
    })
  }

  useEffect(() => {
    if (!ticker || !reit || history.length === 0) return
    runValuation(discountRate, growthRate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, reit, history])

  const sensitivity = useMemo(() => {
    if (!valuation) return null
    const baseD0 = valuation.dividendPerShare
    const price = valuation.currentPrice
    const discountRates = [
      Math.max(0.01, discountRate - 0.02),
      Math.max(0.01, discountRate - 0.01),
      discountRate,
      discountRate + 0.01,
      discountRate + 0.02,
    ]
    const growthRates = [
      growthRate - 0.01,
      growthRate,
      growthRate + 0.01,
      growthRate + 0.02,
      growthRate + 0.03,
    ]
    return {
      discountRates,
      growthRates,
      grid: buildSensitivityGrid(baseD0, price, discountRates, growthRates),
    }
  }, [valuation, discountRate, growthRate])

  return (
    <div>
      <Link to="/" style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 800 }}>
        ← Back to dashboard
      </Link>

      {loading && <p style={{ marginTop: '1rem' }}>Loading REIT details...</p>}
      {error && <p style={{ marginTop: '1rem', color: '#f87171' }}>Error: {error}</p>}

      {!loading && !error && reit && (
        <>
          <h1 style={{ marginTop: '1rem', fontSize: 34, marginBottom: 0 }}>
            {reit.name} ({reit.ticker})
          </h1>
          <p style={{ marginTop: 8, fontSize: 15, opacity: 0.85 }}>
            Sector: <strong style={{ color: '#e5e7eb' }}>{reit.sector}</strong>
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <div
              style={{
                padding: '1rem',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(2, 6, 23, 0.55)',
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.8 }}>Dividend Yield</div>
              <div style={{ fontSize: 26, fontWeight: 900 }}>{reit.dividendYield.toFixed(2)}%</div>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(2, 6, 23, 0.55)',
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.8 }}>1-Year Total Return</div>
              <div style={{ fontSize: 26, fontWeight: 900 }}>{reit.totalReturn1Y.toFixed(2)}%</div>
            </div>
          </div>

          <div
            style={{
              marginTop: '1.75rem',
              padding: '1.25rem',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(2, 6, 23, 0.55)',
            }}
          >
            <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: '0.75rem' }}>Price History</h2>

            {historyError && <p style={{ color: '#f87171', marginBottom: '0.5rem' }}>{historyError}</p>}

            {history.length === 0 && !historyError ? (
              <p style={{ opacity: 0.8 }}>No history available.</p>
            ) : (
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: '1.75rem',
              padding: '1.5rem',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(2, 6, 23, 0.55)',
            }}
          >
            <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: '0.35rem' }}>
              Valuation (Dividend Discount Model)
            </h2>
            <p style={{ fontSize: 12, opacity: 0.8, marginTop: 0, marginBottom: '1rem' }}>
              Adjust assumptions to estimate intrinsic fair value. DDM tends to undervalue low-yield, growth-oriented REITs.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 220px' }}>
                <label style={{ display: 'block', fontSize: 12, marginBottom: '0.25rem', opacity: 0.85 }}>
                  Discount rate (%)
                </label>
                <input
                  type="number"
                  value={discountRate * 100}
                  onChange={(e) => setDiscountRate(Number(e.target.value) / 100)}
                  min={0}
                  max={30}
                  step={0.1}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.65rem',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: 'rgba(3, 7, 18, 0.75)',
                    color: '#e5e7eb',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ flex: '1 1 220px' }}>
                <label style={{ display: 'block', fontSize: 12, marginBottom: '0.25rem', opacity: 0.85 }}>
                  Dividend growth rate (%)
                </label>
                <input
                  type="number"
                  value={growthRate * 100}
                  onChange={(e) => setGrowthRate(Number(e.target.value) / 100)}
                  min={-10}
                  max={15}
                  step={0.1}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.65rem',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: 'rgba(3, 7, 18, 0.75)',
                    color: '#e5e7eb',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                onClick={() => runValuation(discountRate, growthRate)}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: 999,
                  border: 'none',
                  background: 'linear-gradient(to right, #4f46e5, #06b6d4)',
                  color: '#0b0f19',
                  fontWeight: 900,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Recalculate valuation
              </button>
            </div>

            {valuationLoading && <p style={{ marginTop: '0.75rem' }}>Calculating valuation…</p>}
            {valuationError && <p style={{ marginTop: '0.75rem', color: '#f87171' }}>{valuationError}</p>}

            {valuation && !valuationLoading && !valuationError && (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: '1rem',
                    marginTop: '1rem',
                  }}
                >
                  <div
                    style={{
                      padding: '0.9rem',
                      borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(3, 7, 18, 0.55)',
                    }}
                  >
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Current Price</div>
                    <div style={{ fontSize: 22, fontWeight: 900 }}>${valuation.currentPrice.toFixed(2)}</div>
                  </div>

                  <div
                    style={{
                      padding: '0.9rem',
                      borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(3, 7, 18, 0.55)',
                    }}
                  >
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Fair Value (DDM)</div>
                    <div style={{ fontSize: 22, fontWeight: 900 }}>${valuation.fairValue.toFixed(2)}</div>
                  </div>

                  <div
                    style={{
                      padding: '0.9rem',
                      borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(3, 7, 18, 0.55)',
                    }}
                  >
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Margin of Safety</div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 900,
                        color: valuation.marginOfSafetyPct >= 0 ? '#34d399' : '#fb7185',
                      }}
                    >
                      {valuation.marginOfSafetyPct.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {sensitivity && (
                  <div style={{ marginTop: '1.25rem' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 6 }}>
                      Sensitivity (Fair Value)
                    </h3>
                    <p style={{ fontSize: 12, opacity: 0.8, marginTop: 0 }}>
                      Fair value varies with discount rate (rows) and dividend growth rate (columns).
                      Invalid cases where r ≤ g are shown as “—”.
                    </p>

                    <div
                      style={{
                        overflowX: 'auto',
                        marginTop: '0.75rem',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 14,
                        background: 'rgba(3, 7, 18, 0.55)',
                      }}
                    >
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <th style={{ padding: '0.75rem', textAlign: 'left', whiteSpace: 'nowrap' }}>
                              r \ g
                            </th>
                            {sensitivity.growthRates.map((g) => (
                              <th
                                key={g}
                                style={{ padding: '0.75rem', textAlign: 'right', whiteSpace: 'nowrap' }}
                              >
                                {(g * 100).toFixed(1)}%
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sensitivity.grid.map((row) => (
                            <tr key={row.r} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                              <td style={{ padding: '0.75rem', fontWeight: 900, whiteSpace: 'nowrap' }}>
                                {(row.r * 100).toFixed(1)}%
                              </td>
                              {row.cells.map((cell) => (
                                <td
                                  key={`${cell.r}-${cell.g}`}
                                  style={{
                                    padding: '0.75rem',
                                    textAlign: 'right',
                                    whiteSpace: 'nowrap',
                                    opacity: cell.fairValue === null ? 0.6 : 1,
                                  }}
                                  title={
                                    cell.marginOfSafetyPct === null
                                      ? 'Invalid (r ≤ g)'
                                      : `Margin of Safety: ${cell.marginOfSafetyPct.toFixed(1)}%`
                                  }
                                >
                                  {cell.fairValue === null ? '—' : `$${cell.fairValue.toFixed(2)}`}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ marginTop: '0.75rem', fontSize: 12, opacity: 0.85 }}>
                      Using D0 (current dividend per share): <strong>${valuation.dividendPerShare.toFixed(2)}</strong>
                      {' · '}
                      Current price: <strong>${valuation.currentPrice.toFixed(2)}</strong>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<ReitListPage />} />
        <Route path="/reit/:ticker" element={<ReitDetailPage />} />
      </Routes>
    </AppShell>
  )
}

export default App
