import { useState } from 'react'
import {
  createMetric,
  getMetrics,
  getChartData,
  getMetricsCursor,
} from '../api/metrics'
import type { MetricEntry, MetricType, MetricUnit } from '../api/types'
import { ALL_UNITS, DISTANCE_UNITS, TEMPERATURE_UNITS } from '../constants/units'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function getUTCToday(): string {
  return new Date().toISOString().split('T')[0]
}

export default function Home() {
  const [userId, setUserId] = useState('poc-user')

  // Section 1: Add metric
  const [addDate, setAddDate] = useState(getUTCToday)
  const [addValue, setAddValue] = useState('')
  const [addUnit, setAddUnit] = useState<MetricUnit>('meter')
  const [addStatus, setAddStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Section 2: List metrics
  const [listType, setListType] = useState<MetricType>('distance')
  const [listUnit, setListUnit] = useState<MetricUnit | ''>('')
  const [listData, setListData] = useState<MetricEntry[] | null>(null)
  const [listLoading, setListLoading] = useState(false)

  // Section 3: Chart
  const [chartType, setChartType] = useState<MetricType>('distance')
  const [chartPeriod, setChartPeriod] = useState(1)
  const [chartUnit, setChartUnit] = useState<MetricUnit | ''>('')
  const [chartData, setChartData] = useState<MetricEntry[] | null>(null)
  const [chartLoading, setChartLoading] = useState(false)

  // Section 4: Cursor pagination
  const [cursorData, setCursorData] = useState<MetricEntry[]>([])
  const [cursorNext, setCursorNext] = useState<string | null>(null)
  const [cursorLoading, setCursorLoading] = useState(false)

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddStatus(null)
    if (!addDate || !addValue) {
      setAddStatus({ type: 'error', msg: 'Please fill in date and value' })
      return
    }
    try {
      await createMetric(
        { date: addDate, value: Number(addValue), unit: addUnit },
        userId
      )
      setAddStatus({ type: 'success', msg: 'Metric added successfully!' })
      setAddDate('')
      setAddValue('')
    } catch (err) {
      setAddStatus({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  const handleFetchList = async () => {
    setListLoading(true)
    setListData(null)
    try {
      const res = await getMetrics(
        listType,
        listUnit || undefined,
        userId
      )
      setListData(res.data ?? [])
    } catch (err) {
      setListData([])
      console.error(err)
    } finally {
      setListLoading(false)
    }
  }

  const handleFetchChart = async () => {
    setChartLoading(true)
    setChartData(null)
    try {
      const res = await getChartData(
        chartType,
        chartPeriod,
        chartUnit || undefined,
        userId
      )
      setChartData(res.data ?? [])
    } catch (err) {
      setChartData([])
      console.error(err)
    } finally {
      setChartLoading(false)
    }
  }

  const handleFetchCursor = async (cursor?: string) => {
    setCursorLoading(true)
    try {
      const res = await getMetricsCursor(
        { perPage: 10, cursor },
        userId
      )
      const items = res.data ?? []
      if (!cursor) {
        setCursorData(items)
      } else {
        setCursorData((prev) => [...prev, ...items])
      }
      setCursorNext(res.metadata?.hasNext ? (res.metadata.cursor ?? null) : null)
    } catch (err) {
      console.error(err)
    } finally {
      setCursorLoading(false)
    }
  }

  const chartUnits = listType === 'distance' ? DISTANCE_UNITS : TEMPERATURE_UNITS
  const chartUnitsForChart = chartType === 'distance' ? DISTANCE_UNITS : TEMPERATURE_UNITS

  const chartDataForRecharts = (chartData ?? []).map((m) => ({
    date: m.date,
    value: Number(m.value),
  }))

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-2xl font-semibold text-slate-800">
          Metric Tracking - POC
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <label className="text-sm text-slate-600">User ID:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          />
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 p-6">
        {/* Section 1: Add metric */}
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Add new metric</h2>
          <form onSubmit={handleAddMetric} className="flex flex-wrap gap-4">
            <div>
              <label className="mr-2 text-sm">Date:</label>
              <input
                type="date"
                value={addDate}
                max={getUTCToday()}
                onChange={(e) => setAddDate(e.target.value)}
                className="rounded border border-slate-300 px-2 py-1"
                required
              />
            </div>
            <div>
              <label className="mr-2 text-sm">Value:</label>
              <input
                type="number"
                step="any"
                value={addValue}
                onChange={(e) => setAddValue(e.target.value)}
                className="rounded border border-slate-300 px-2 py-1"
                required
              />
            </div>
            <div>
              <label className="mr-2 text-sm">Unit:</label>
              <select
                value={addUnit}
                onChange={(e) => setAddUnit(e.target.value as MetricUnit)}
                className="rounded border border-slate-300 px-2 py-1"
              >
                {ALL_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Add
            </button>
          </form>
          {addStatus && (
            <p
              className={`mt-2 text-sm ${
                addStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {addStatus.msg}
            </p>
          )}
        </section>

        {/* Section 2: List metrics */}
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Metrics list</h2>
          <div className="mb-4 flex flex-wrap gap-4">
            <div>
              <label className="mr-2 text-sm">Type:</label>
              <select
                value={listType}
                onChange={(e) => {
                  setListType(e.target.value as MetricType)
                  setListUnit('')
                }}
                className="rounded border border-slate-300 px-2 py-1"
              >
                <option value="distance">distance</option>
                <option value="temperature">temperature</option>
              </select>
            </div>
            <div>
              <label className="mr-2 text-sm">Unit (optional):</label>
              <select
                value={listUnit}
                onChange={(e) => setListUnit(e.target.value as MetricUnit | '')}
                className="rounded border border-slate-300 px-2 py-1"
              >
                <option value="">-</option>
                {chartUnits.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleFetchList}
              disabled={listLoading}
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {listLoading ? 'Loading...' : 'Fetch'}
            </button>
          </div>
          {listData !== null && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-slate-100">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Value</th>
                    <th className="text-left p-2">Unit</th>
                    <th className="text-left p-2">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {listData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-500">
                        No data
                      </td>
                    </tr>
                  ) : (
                    listData.map((m) => (
                      <tr key={m.id} className="border-b">
                        <td className="p-2">{m.date}</td>
                        <td className="p-2">{m.value}</td>
                        <td className="p-2">{m.unit}</td>
                        <td className="p-2">{m.type}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Section 3: Chart */}
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Chart</h2>
          <div className="mb-4 flex flex-wrap gap-4">
            <div>
              <label className="mr-2 text-sm">Type:</label>
              <select
                value={chartType}
                onChange={(e) => {
                  setChartType(e.target.value as MetricType)
                  setChartUnit('')
                }}
                className="rounded border border-slate-300 px-2 py-1"
              >
                <option value="distance">distance</option>
                <option value="temperature">temperature</option>
              </select>
            </div>
            <div>
              <label className="mr-2 text-sm">Period (months):</label>
              <select
                value={chartPeriod}
                onChange={(e) => setChartPeriod(Number(e.target.value))}
                className="rounded border border-slate-300 px-2 py-1"
              >
                <option value={1}>1</option>
                <option value={3}>3</option>
                <option value={6}>6</option>
                <option value={12}>12</option>
              </select>
            </div>
            <div>
              <label className="mr-2 text-sm">Unit (optional):</label>
              <select
                value={chartUnit}
                onChange={(e) => setChartUnit(e.target.value as MetricUnit | '')}
                className="rounded border border-slate-300 px-2 py-1"
              >
                <option value="">-</option>
                {chartUnitsForChart.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleFetchChart}
              disabled={chartLoading}
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {chartLoading ? 'Loading...' : 'Fetch'}
            </button>
          </div>
          {chartData !== null && (
            <div className="h-64">
              {chartDataForRecharts.length === 0 ? (
                <p className="text-center text-slate-500">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartDataForRecharts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#4f46e5"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </section>

        {/* Section 4: Cursor pagination */}
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Cursor pagination</h2>
          <button
            onClick={() => handleFetchCursor()}
            disabled={cursorLoading}
            className="mb-4 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {cursorData.length === 0
              ? cursorLoading
                ? 'Loading...'
                : 'Load metrics'
              : 'Reload'}
          </button>
          {cursorData.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-slate-100">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Value</th>
                      <th className="text-left p-2">Unit</th>
                      <th className="text-left p-2">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cursorData.map((m) => (
                      <tr key={m.id} className="border-b">
                        <td className="p-2">{m.date}</td>
                        <td className="p-2">{m.value}</td>
                        <td className="p-2">{m.unit}</td>
                        <td className="p-2">{m.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {cursorNext && (
                <button
                  onClick={() => handleFetchCursor(cursorNext)}
                  disabled={cursorLoading}
                  className="mt-4 rounded bg-slate-600 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
                >
                  Load more
                </button>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  )
}
