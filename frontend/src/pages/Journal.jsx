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

function CalorieRing({ consumed, total, burned = 0 }) {
  // Arc ouvert en bas : de 135° à 405° (270° de couverture, ouverture 90° en bas)
  const size = 180
  const stroke = 11
  const radius = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2

  // Angle de départ et de fin en radians (0° = droite, sens horaire)
  const startAngle = 135 * (Math.PI / 180)
  const endAngle   = 405 * (Math.PI / 180) // = 45° + 360°

  const arcLength = 270 * (Math.PI / 180) * radius // longueur totale de l'arc track
  const ratio = total > 0 ? Math.min(consumed / total, 1) : 0
  const progressLength = ratio * arcLength

  // Calcul des points de l'arc
  function polarToCartesian(angleDeg) {
    const rad = angleDeg * (Math.PI / 180)
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    }
  }

  function arcPath(startDeg, endDeg) {
    const s = polarToCartesian(startDeg)
    const e = polarToCartesian(endDeg)
    const sweep = endDeg - startDeg > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${sweep} 1 ${e.x} ${e.y}`
  }

  const trackPath    = arcPath(135, 405)
  // Pour la progression : interpoler l'angle de fin
  const progressEnd  = 135 + 270 * ratio
  const progressPath = arcPath(135, progressEnd)

  const remaining = Math.max(total - consumed, 0)

  return (
    <div className="flex items-center justify-between w-full gap-2">
      {/* Mangées — colonne gauche, centrée */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: '60px' }}>
        <p
          className="font-headline font-extrabold text-on-surface leading-none"
          style={{ fontSize: 'clamp(1.1rem, 5.5vw, 1.5rem)' }}
        >
          {Math.round(consumed)}
        </p>
        <p className="text-[9px] font-bold text-outline uppercase tracking-widest mt-0.5">Mangées</p>
      </div>

      {/* Arc SVG — centre */}
      <div
        className="relative flex items-center justify-center flex-1"
        style={{ maxWidth: 'min(52vw, 180px)', aspectRatio: '1' }}
      >
        <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <path
            d={trackPath}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            className="text-surface-container-high"
          />
          {/* Progress — seulement si ratio > 0 */}
          {ratio > 0 && (
            <path
              d={progressPath}
              fill="none"
              stroke="#006857"
              strokeWidth={stroke}
              strokeLinecap="round"
              style={{ transition: 'all 0.6s ease' }}
            />
          )}
        </svg>
        {/* Label centré dans l'arc */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className="font-headline font-extrabold text-on-surface leading-none"
            style={{ fontSize: 'clamp(1.5rem, 8vw, 2.25rem)' }}
          >
            {remaining}
          </span>
          <span className="text-[9px] font-bold text-outline uppercase tracking-wide mt-1">Restantes</span>
        </div>
      </div>

      {/* Brûlées — colonne droite, centrée */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: '60px' }}>
        <p
          className="font-headline font-extrabold text-secondary leading-none"
          style={{ fontSize: 'clamp(1.1rem, 5.5vw, 1.5rem)' }}
        >
          {Math.round(burned)}
        </p>
        <p className="text-[9px] font-bold text-outline uppercase tracking-widest mt-0.5">Brûlées</p>
      </div>
    </div>
  )
}

function MacroInline({ label, value, total, color }) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-[9px] font-bold text-outline uppercase tracking-wide">{label}</span>
      <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color.replace('text-', 'bg-')}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[10px] font-extrabold ${color}`}>{Math.round(value)} / {Math.round(total)}g</span>
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
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_2px_16px_rgba(25,28,29,0.04)]">
      {/* Header row */}
      <div
        className="px-3 py-2.5 flex items-center gap-3 cursor-pointer"
        onClick={() => entries.length > 0 && setExpanded(e => !e)}
      >
        <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-xl flex-shrink-0">
          {meal.icon}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-center">
            <h3 className="font-headline font-bold text-xs text-on-surface">{meal.label}</h3>
            <span className="text-[11px] font-semibold text-outline ml-2 flex-shrink-0">
              {Math.round(totals.calories)} / {mealTarget} kcal
            </span>
          </div>
          <p className="text-[11px] text-outline mt-0.5 line-clamp-1">
            {entries.length === 0
              ? meal.placeholder
              : entries.map(e => e.food_name || e.name).join(', ')
            }
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {entries.length > 0 && (
            <span className="material-symbols-outlined text-outline" style={{ fontSize: '16px' }}>
              {expanded ? 'expand_less' : 'expand_more'}
            </span>
          )}
          <button
            onClick={e => { e.stopPropagation(); onAdd(meal.id) }}
            className="w-8 h-8 rounded-full bg-on-surface text-surface-container-lowest flex items-center justify-center hover:scale-105 transition-transform active:scale-90"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          </button>
        </div>
      </div>

      {/* Expanded entries */}
      {expanded && entries.length > 0 && (
        <div className="border-t border-surface-container">
          <div className="px-3 pt-1.5 space-y-0.5">
            {entries.map(entry => (
              <div key={entry.id} className="flex items-center justify-between py-2 border-b border-surface-container last:border-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-sm flex-shrink-0">
                    🍽️
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs text-on-surface truncate">{entry.food_name || entry.name}</p>
                    <p className="text-[10px] text-outline">
                      {entry.quantity}{entry.unit}
                      {entry.protein ? ` · P ${Math.round(entry.protein)}g` : ''}
                      {entry.carbs   ? ` · G ${Math.round(entry.carbs)}g`   : ''}
                      {entry.fat     ? ` · L ${Math.round(entry.fat)}g`     : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <span className="font-headline font-bold text-xs text-primary">
                    {Math.round(entry.calories)} kcal
                  </span>
                  <button
                    onClick={() => onRemove(date, meal.id, entry.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-secondary/10 text-outline hover:text-secondary transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mx-3 mb-3 mt-1.5 bg-surface-container-low rounded-lg px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-semibold text-outline">
              <span>P <span className="text-on-surface">{Math.round(mealProtein)}g</span></span>
              <span>G <span className="text-on-surface">{Math.round(mealCarbs)}g</span></span>
              <span>L <span className="text-on-surface">{Math.round(mealFat)}g</span></span>
            </div>
            <span className="font-headline font-extrabold text-xs text-primary">
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
        <div className="flex justify-between items-center px-4 py-3 w-full">
          <div className="flex flex-col">
            <h1 className="font-headline font-extrabold tracking-tight text-xl text-primary">
              Aujourd'hui
            </h1>
            <span className="text-[10px] font-semibold text-outline tracking-wider uppercase">
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

      <main className="px-4 space-y-5 max-w-2xl mx-auto">
        {/* Summary Hero Card */}
        <section className="bg-surface-container-lowest rounded-2xl px-5 py-5 shadow-[0px_4px_32px_rgba(25,28,29,0.04)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-3xl" />

          {/* Ring with side stats */}
          <CalorieRing
            consumed={totals.calories}
            total={userNeeds?.dailyCalories || 2000}
            burned={0}
          />

          {/* Macro row */}
          <div className="mt-4 flex items-center gap-2">
            <MacroInline label="Glucides"  value={totals.carbs}   total={userNeeds?.carbs   || 1} color="text-primary"   />
            <div className="w-px h-6 bg-surface-container-high flex-shrink-0" />
            <MacroInline label="Protéines" value={totals.protein} total={userNeeds?.protein || 1} color="text-secondary" />
            <div className="w-px h-6 bg-surface-container-high flex-shrink-0" />
            <MacroInline label="Lipides"   value={totals.fat}     total={userNeeds?.fat     || 1} color="text-tertiary"  />
          </div>
        </section>

        {/* Meal list */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-extrabold text-base tracking-tight">Alimentation</h2>
          </div>
          <div className="space-y-2.5">
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
        <section className="bg-tertiary/10 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-tertiary/20 rounded-lg flex items-center justify-center text-tertiary">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: '18px' }}
              >
                water_drop
              </span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-xs">Hydratation</h3>
              <p className="text-[10px] text-on-surface/70">{(water / 1000).toFixed(1)}L / {(waterGoal / 1000).toFixed(1)}L</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: waterGoalCups }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-5 rounded-full transition-all ${
                    i < waterCups ? 'bg-tertiary' : 'bg-tertiary/20'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-1 ml-1">
              <button
                onClick={() => removeWater(date, 250)}
                className="w-7 h-7 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center hover:bg-tertiary/30 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>remove</span>
              </button>
              <button
                onClick={() => addWater(date, 250)}
                className="w-7 h-7 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
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
