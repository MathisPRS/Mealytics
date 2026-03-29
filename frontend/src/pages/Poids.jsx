import { useState } from 'react'
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import { useApp, todayKey, formatDateShort } from '../contexts/AppContext'

function LogWeightModal({ onClose, onSave }) {
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSave = async () => {
    if (!weight || parseFloat(weight) <= 0) return
    setSaving(true)
    setError(null)
    try {
      await onSave(todayKey(), parseFloat(weight), note)
      onClose()
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-t-3xl w-full max-w-md p-6 pb-10 space-y-6 shadow-2xl">
        <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto" />
        <h2 className="font-headline font-bold text-xl text-center">Enregistrer le poids</h2>

        <div className="space-y-2">
          <label className="text-xs font-bold text-outline uppercase tracking-wider">Poids (kg)</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="0.0"
              step="0.1"
              min="20"
              max="400"
              autoFocus
              className="flex-1 text-center text-4xl font-headline font-extrabold bg-surface-container-low border-none rounded-2xl py-5 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest outline-none transition-all"
            />
            <span className="text-xl font-bold text-outline">kg</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-outline uppercase tracking-wider">Note (optionnel)</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ex : après le sport..."
            className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest outline-none transition-all text-sm"
          />
        </div>

        {error && (
          <p className="text-secondary text-sm font-semibold text-center">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={!weight || parseFloat(weight) <= 0 || saving}
          className={`w-full py-4 rounded-full font-headline font-bold transition-all ${
            weight && parseFloat(weight) > 0 && !saving
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98]'
              : 'bg-surface-container text-outline cursor-not-allowed'
          }`}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface-container-lowest rounded-xl px-3 py-2 shadow-lg border border-outline-variant/10">
        <p className="font-headline font-bold text-primary">{payload[0].value} kg</p>
        <p className="text-xs text-outline">{payload[0].payload.label}</p>
      </div>
    )
  }
  return null
}

export default function Poids() {
  const { weightLog, addWeight, user } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [range, setRange] = useState(30)

  const latestWeight = weightLog.length > 0
    ? weightLog[weightLog.length - 1].weight
    : user?.weight || null

  const startWeight = weightLog.length > 0 ? weightLog[0].weight : user?.weight
  const diff = latestWeight && startWeight ? (latestWeight - startWeight) : 0

  // Prepare chart data
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - range)
  const chartData = weightLog
    .filter(w => new Date(w.date) >= cutoff)
    .map(w => ({
      date: w.date,
      weight: w.weight,
      label: formatDateShort(w.date),
    }))

  // Recent history (last 10)
  const recentHistory = [...weightLog].reverse().slice(0, 10)

  const getWeightDiff = (idx) => {
    const reversed = [...weightLog].reverse()
    if (idx >= reversed.length - 1) return null
    return (reversed[idx].weight - reversed[idx + 1].weight).toFixed(1)
  }

  return (
    <div className="bg-surface min-h-screen pb-28 font-body text-on-surface antialiased">
      {/* Header */}
      <header className="w-full top-0 sticky z-40 bg-surface flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">local_fire_department</span>
          <h1 className="font-headline font-extrabold tracking-tight text-2xl text-on-surface">Suivi du poids</h1>
        </div>
      </header>

      <main className="px-6 space-y-8 max-w-2xl mx-auto">
        {/* Hero stats */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_4px_32px_rgba(25,28,29,0.04)] flex flex-col justify-between h-36">
            <div className="space-y-1">
              <span className="text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider">Poids actuel</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-headline font-extrabold text-on-surface">
                  {latestWeight ?? '—'}
                </span>
                <span className="text-on-surface-variant font-semibold">kg</span>
              </div>
            </div>
            {diff !== 0 && (
              <div className={`flex items-center gap-1 text-xs font-bold ${diff < 0 ? 'text-primary' : 'text-secondary'}`}>
                <span className="material-symbols-outlined text-sm">
                  {diff < 0 ? 'trending_down' : 'trending_up'}
                </span>
                <span>{diff > 0 ? '+' : ''}{diff.toFixed(1)} kg depuis le début</span>
              </div>
            )}
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_4px_32px_rgba(25,28,29,0.04)] flex flex-col justify-between h-36">
            <div className="space-y-1">
              <span className="text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider">Poids départ</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-headline font-extrabold text-on-surface">
                  {user?.weight ?? '—'}
                </span>
                <span className="text-on-surface-variant font-semibold">kg</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-outline">
              <span className="material-symbols-outlined text-sm">person</span>
              <span>Poids initial</span>
            </div>
          </div>
        </section>

        {/* Chart */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_32px_rgba(25,28,29,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline font-bold text-lg">Progression</h3>
            <div className="flex gap-2">
              {[30, 90].map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${
                    range === r
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {r}J
                </button>
              ))}
            </div>
          </div>

          {chartData.length < 2 ? (
            <div className="h-48 flex flex-col items-center justify-center text-outline text-sm gap-2">
              <span className="material-symbols-outlined text-3xl text-surface-container-high">show_chart</span>
              <p>Enregistrez votre poids régulièrement pour voir la progression</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006857" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#006857" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eceeef" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#6d7a75', fontFamily: 'Manrope' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 10, fill: '#6d7a75', fontFamily: 'Manrope' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#006857"
                  strokeWidth={2}
                  fill="url(#weightGrad)"
                  dot={{ fill: '#006857', r: 3 }}
                  activeDot={{ r: 5, fill: '#006857' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* CTA */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform hover:bg-primary-container"
        >
          <span className="material-symbols-outlined">add</span>
          Enregistrer le poids
        </button>

        {/* History */}
        {recentHistory.length > 0 && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-headline font-bold text-lg">Historique récent</h3>
            </div>
            <div className="space-y-3">
              {recentHistory.map((entry, idx) => {
                const diff = getWeightDiff(idx)
                const isToday = entry.date === todayKey()
                return (
                  <div key={entry.date} className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-primary/10' : 'bg-surface-container'
                      }`}>
                        <span className={`material-symbols-outlined text-xl ${isToday ? 'text-primary' : 'text-on-surface-variant'}`}>
                          scale
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">{isToday ? "Aujourd'hui" : formatDateShort(entry.date)}</p>
                        {entry.note && <p className="text-[11px] text-outline">{entry.note}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-headline font-bold text-base">{entry.weight} kg</p>
                      {diff !== null && (
                        <p className={`text-[10px] font-bold ${parseFloat(diff) < 0 ? 'text-primary' : 'text-secondary'}`}>
                          {parseFloat(diff) > 0 ? '+' : ''}{diff} kg
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>

      {showModal && (
        <LogWeightModal
          onClose={() => setShowModal(false)}
          onSave={addWeight}
        />
      )}
    </div>
  )
}
