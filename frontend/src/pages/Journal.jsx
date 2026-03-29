import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, todayKey } from '../contexts/AppContext'
import AddFoodModal from '../components/AddFoodModal'

const MEAL_CONFIG = [
  {
    id: 'petit_dejeuner',
    label: 'Petit déjeuner',
    icon: '🌅',
    placeholder: 'Pas encore de repas',
  },
  {
    id: 'dejeuner',
    label: 'Déjeuner',
    icon: '☀️',
    placeholder: 'Pas encore de repas',
  },
  {
    id: 'diner',
    label: 'Dîner',
    icon: '🌙',
    placeholder: 'Pas encore de repas',
  },
  {
    id: 'collation',
    label: 'Collation',
    icon: '🍎',
    placeholder: 'Pas encore de repas',
  },
]

function CalorieRing({ consumed, total }) {
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const ratio = total > 0 ? Math.min(consumed / total, 1) : 0
  const offset = circumference - ratio * circumference
  const remaining = Math.max(total - consumed, 0)

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
        <circle
          cx="64" cy="64" r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="8"
          className="text-surface-container-high"
        />
        <circle
          cx="64" cy="64" r={radius}
          fill="transparent"
          stroke="#006857"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-headline font-extrabold text-on-surface">{remaining}</span>
        <span className="text-[10px] font-bold text-outline uppercase tracking-wide">Restantes</span>
      </div>
    </div>
  )
}

function MacroBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold text-outline uppercase tracking-wide">{label}</span>
        <span className="text-[11px] font-semibold text-on-surface">{Math.round(value)}g</span>
      </div>
      <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function MealSection({ meal, date, onAdd, onRemove }) {
  const { getMealTotals, getDayJournalSync, userNeeds } = useApp()
  const totals = getMealTotals(date, meal.id)
  const dayJournal = getDayJournalSync(date)
  const entries = dayJournal[meal.id] || []
  const mealTarget = userNeeds ? Math.round(userNeeds.dailyCalories / 4) : 0
  const [expanded, setExpanded] = useState(false)

  const mealProtein = entries.reduce((s, e) => s + (parseFloat(e.protein) || 0), 0)
  const mealCarbs   = entries.reduce((s, e) => s + (parseFloat(e.carbs)   || 0), 0)
  const mealFat     = entries.reduce((s, e) => s + (parseFloat(e.fat)     || 0), 0)

  return (
    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0px_4px_32px_rgba(25,28,29,0.04)]">
      {/* Header row */}
      <div
        className="p-4 flex items-center gap-4 cursor-pointer"
        onClick={() => entries.length > 0 && setExpanded(e => !e)}
      >
        <div className="w-14 h-14 rounded-xl bg-surface-container-low flex items-center justify-center text-2xl flex-shrink-0">
          {meal.icon}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-headline font-bold text-sm text-on-surface">{meal.label}</h3>
            <span className="text-xs font-semibold text-outline ml-2 flex-shrink-0">
              {Math.round(totals.calories)} / {mealTarget} kcal
            </span>
          </div>
          <p className="text-xs text-outline mt-1 line-clamp-1">
            {entries.length === 0
              ? meal.placeholder
              : entries.map(e => e.food_name || e.name).join(', ')
            }
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {entries.length > 0 && (
            <span className="material-symbols-outlined text-outline text-base">
              {expanded ? 'expand_less' : 'expand_more'}
            </span>
          )}
          <button
            onClick={e => { e.stopPropagation(); onAdd(meal.id) }}
            className="w-10 h-10 rounded-full bg-on-surface text-surface-container-lowest flex items-center justify-center hover:scale-105 transition-transform active:scale-90"
          >
            <span className="material-symbols-outlined text-xl">add</span>
          </button>
        </div>
      </div>

      {/* Expanded entries */}
      {expanded && entries.length > 0 && (
        <div className="border-t border-surface-container">
          {/* Entry list */}
          <div className="px-4 pt-2 space-y-1">
            {entries.map(entry => (
              <div key={entry.id} className="flex items-center justify-between py-2.5 border-b border-surface-container last:border-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-base flex-shrink-0">
                    🍽️
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-on-surface truncate">{entry.food_name || entry.name}</p>
                    <p className="text-xs text-outline">
                      {entry.quantity}{entry.unit}
                      {entry.protein ? ` · P ${Math.round(entry.protein)}g` : ''}
                      {entry.carbs   ? ` · G ${Math.round(entry.carbs)}g`   : ''}
                      {entry.fat     ? ` · L ${Math.round(entry.fat)}g`     : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="font-headline font-bold text-sm text-primary">
                    {Math.round(entry.calories)} kcal
                  </span>
                  <button
                    onClick={() => onRemove(date, meal.id, entry.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary/10 text-outline hover:text-secondary transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Meal total footer */}
          <div className="mx-4 mb-4 mt-2 bg-surface-container-low rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs font-semibold text-outline">
              <span>P <span className="text-on-surface">{Math.round(mealProtein)}g</span></span>
              <span>G <span className="text-on-surface">{Math.round(mealCarbs)}g</span></span>
              <span>L <span className="text-on-surface">{Math.round(mealFat)}g</span></span>
            </div>
            <span className="font-headline font-extrabold text-sm text-primary">
              {Math.round(totals.calories)} kcal
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Journal() {
  const navigate = useNavigate()
  const { userNeeds, getDayTotals, getDayWater, addWater, removeWater, removeFoodFromMeal, loadDayJournal, loadDayWater } = useApp()
  const [date] = useState(todayKey())
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [targetMeal, setTargetMeal] = useState(null)

  useEffect(() => {
    loadDayJournal(date)
    loadDayWater(date)
  }, [date])

  const totals = getDayTotals(date)
  const water = getDayWater(date)
  const waterGoal = 2500 // ml
  const waterCups = Math.round(water / 250) // glasses of 250ml
  const waterGoalCups = Math.round(waterGoal / 250)

  const weekNum = Math.ceil(
    (new Date() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)
  )

  const handleOpenAdd = (mealId) => {
    setTargetMeal(mealId)
    setAddModalOpen(true)
  }

  return (
    <div className="bg-surface min-h-screen pb-28 font-body text-on-surface antialiased">
      {/* Header */}
      <header className="w-full top-0 sticky bg-surface z-40">
        <div className="flex justify-between items-center px-6 py-4 w-full">
          <div className="flex flex-col">
            <h1 className="font-headline font-extrabold tracking-tight text-2xl text-primary">
              Aujourd'hui
            </h1>
            <span className="text-xs font-semibold text-outline tracking-wider uppercase">
              Semaine {weekNum}
            </span>
          </div>
          <div className="flex gap-4">
            <button className="hover:opacity-80 transition-opacity active:scale-95 text-primary">
              <span className="material-symbols-outlined">local_fire_department</span>
            </button>
            <button
              onClick={() => navigate('/journal/historique')}
              className="hover:opacity-80 transition-opacity active:scale-95 text-on-surface"
            >
              <span className="material-symbols-outlined">calendar_today</span>
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-8 max-w-2xl mx-auto">
        {/* Summary Hero Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-[0px_4px_32px_rgba(25,28,29,0.04)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Mangées</p>
              <p className="text-xl font-headline font-extrabold text-on-surface">
                {Math.round(totals.calories)}
              </p>
            </div>
            <CalorieRing
              consumed={totals.calories}
              total={userNeeds?.dailyCalories || 2000}
            />
            <div className="text-center">
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Objectif</p>
              <p className="text-xl font-headline font-extrabold text-primary">
                {userNeeds?.dailyCalories || '—'}
              </p>
            </div>
          </div>

          {/* Macro bars */}
          <div className="mt-10 grid grid-cols-3 gap-6">
            <MacroBar
              label="Glucides"
              value={totals.carbs}
              total={userNeeds?.carbs || 1}
              color="bg-primary"
            />
            <MacroBar
              label="Protéines"
              value={totals.protein}
              total={userNeeds?.protein || 1}
              color="bg-secondary"
            />
            <MacroBar
              label="Lipides"
              value={totals.fat}
              total={userNeeds?.fat || 1}
              color="bg-tertiary"
            />
          </div>
        </section>

        {/* Meal list */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-extrabold text-xl tracking-tight">Alimentation</h2>
          </div>
          <div className="space-y-4">
            {MEAL_CONFIG.map(meal => (
              <MealSection
                key={meal.id}
                meal={meal}
                date={date}
                onAdd={handleOpenAdd}
                onRemove={removeFoodFromMeal}
              />
            ))}
          </div>
        </section>

        {/* Hydration widget */}
        <section className="bg-tertiary/10 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-tertiary/20 rounded-xl flex items-center justify-center text-tertiary">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                water_drop
              </span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm">Hydratation</h3>
              <p className="text-xs text-on-surface/70">{(water / 1000).toFixed(1)}L / {(waterGoal / 1000).toFixed(1)}L</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: waterGoalCups }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-6 rounded-full transition-all ${
                    i < waterCups ? 'bg-tertiary' : 'bg-tertiary/20'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-1 ml-2">
              <button
                onClick={() => removeWater(date, 250)}
                className="w-8 h-8 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center hover:bg-tertiary/30 transition-colors"
              >
                <span className="material-symbols-outlined text-base">remove</span>
              </button>
              <button
                onClick={() => addWater(date, 250)}
                className="w-8 h-8 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined text-base">add</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Add food modal */}
      {addModalOpen && (
        <AddFoodModal
          mealId={targetMeal}
          date={date}
          onClose={() => setAddModalOpen(false)}
        />
      )}
    </div>
  )
}
