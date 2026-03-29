import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { api } from '../utils/api'
import AddFoodModal from '../components/AddFoodModal'

const MEAL_CONFIG = [
  { id: 'petit_dejeuner', label: 'Petit déjeuner', icon: '🌅' },
  { id: 'dejeuner',       label: 'Déjeuner',       icon: '☀️' },
  { id: 'diner',          label: 'Dîner',          icon: '🌙' },
  { id: 'collation',      label: 'Collation',      icon: '🍎' },
]

const DAYS_FR   = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS_FR = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
]

function weekDay(date) { return (date.getDay() + 6) % 7 }

function toKey(y, m, d) {
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}

function dotColor(calories, goal) {
  if (!calories || calories === 0) return null
  const ratio = goal > 0 ? calories / goal : 0
  if (ratio < 0.5)  return 'bg-tertiary/60'
  if (ratio < 0.85) return 'bg-primary/70'
  if (ratio < 1.15) return 'bg-primary'
  return 'bg-secondary'
}

// ── Composant repas (extrait pour respecter les règles des hooks) ──────────
function MealRow({ meal, entries, editMode, selectedDate, onAdd, onRemove }) {
  const [expanded, setExpanded] = useState(false)
  const mealCals = entries.reduce((s, e) => s + (parseFloat(e.calories) || 0), 0)

  if (entries.length === 0 && !editMode) return null

  return (
    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0px_4px_32px_rgba(25,28,29,0.04)]">
      <div
        className="p-4 flex items-center gap-3 cursor-pointer"
        onClick={() => entries.length > 0 && setExpanded(e => !e)}
      >
        <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-xl flex-shrink-0">
          {meal.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-headline font-bold text-sm">{meal.label}</p>
          <p className="text-xs text-outline mt-0.5">
            {entries.length === 0
              ? 'Aucun aliment'
              : `${Math.round(mealCals)} kcal · ${entries.length} aliment${entries.length > 1 ? 's' : ''}`
            }
          </p>
        </div>
        {editMode && (
          <button
            onClick={e => { e.stopPropagation(); onAdd(meal.id) }}
            className="w-9 h-9 rounded-full bg-on-surface text-surface-container-lowest flex items-center justify-center hover:scale-105 transition-transform active:scale-90 flex-shrink-0"
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
        )}
        {entries.length > 0 && !editMode && (
          <span className="material-symbols-outlined text-outline text-base">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
        )}
      </div>

      {(expanded || editMode) && entries.length > 0 && (
        <div className="px-4 pb-4 space-y-2 border-t border-surface-container">
          {entries.map(entry => (
            <div key={entry.id} className="flex items-center justify-between py-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-on-surface truncate">{entry.food_name || entry.name}</p>
                <p className="text-xs text-outline">
                  {entry.quantity}{entry.unit} · {Math.round(entry.calories)} kcal
                  {entry.protein ? ` · P: ${Math.round(entry.protein)}g` : ''}
                </p>
              </div>
              {editMode && (
                <button
                  onClick={() => onRemove(selectedDate, meal.id, entry.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary/10 text-outline hover:text-secondary transition-colors ml-2 flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Page principale ────────────────────────────────────────────────────────
export default function JournalHistorique() {
  const navigate = useNavigate()
  const { userNeeds, loadDayJournal, getDayJournalSync, removeFoodFromMeal } = useApp()

  const today = new Date()
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1)

  const [summaryMap, setSummaryMap]       = useState({})
  const [summaryLoading, setSummaryLoading] = useState(false)

  const [selectedDate, setSelectedDate] = useState(null)
  const [dayLoading,   setDayLoading]   = useState(false)
  const [editMode,     setEditMode]     = useState(false)
  const [addModal,     setAddModal]     = useState(false)
  const [targetMeal,   setTargetMeal]   = useState(null)

  // Chargement du résumé mensuel
  useEffect(() => {
    setSummaryLoading(true)
    api.journal.summary(viewYear, viewMonth)
      .then(rows => {
        const map = {}
        for (const r of rows) map[r.date] = r
        setSummaryMap(map)
      })
      .catch(console.error)
      .finally(() => setSummaryLoading(false))
  }, [viewYear, viewMonth])

  // Chargement du détail d'un jour
  useEffect(() => {
    if (!selectedDate) return
    setEditMode(false)
    setDayLoading(true)
    loadDayJournal(selectedDate).finally(() => setDayLoading(false))
  }, [selectedDate])

  const refreshSummary = useCallback(() => {
    api.journal.summary(viewYear, viewMonth)
      .then(rows => {
        const map = {}
        for (const r of rows) map[r.date] = r
        setSummaryMap(map)
      })
      .catch(console.error)
  }, [viewYear, viewMonth])

  const handleRemove = async (date, mealId, entryId) => {
    await removeFoodFromMeal(date, mealId, entryId)
    await loadDayJournal(date)
    refreshSummary()
  }

  const handleAddClose = () => {
    setAddModal(false)
    if (selectedDate) loadDayJournal(selectedDate).catch(console.error)
    refreshSummary()
  }

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12) }
    else setViewMonth(m => m - 1)
    setSelectedDate(null)
  }
  const nextMonth = () => {
    const ny = viewMonth === 12 ? viewYear + 1 : viewYear
    const nm = viewMonth === 12 ? 1 : viewMonth + 1
    if (ny > today.getFullYear() || (ny === today.getFullYear() && nm > today.getMonth() + 1)) return
    setViewYear(ny); setViewMonth(nm)
    setSelectedDate(null)
  }
  const isNextDisabled =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth >= today.getMonth() + 1)

  // Grille calendrier
  const firstDay    = new Date(viewYear, viewMonth - 1, 1)
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate()
  const startOffset = weekDay(firstDay)
  const todayKey    = toKey(today.getFullYear(), today.getMonth() + 1, today.getDate())

  // Données du jour sélectionné
  const dayJournal = selectedDate ? getDayJournalSync(selectedDate) : null
  const daySummary = selectedDate ? summaryMap[selectedDate] : null

  const allEntries = dayJournal
    ? [...dayJournal.petit_dejeuner, ...dayJournal.dejeuner, ...dayJournal.diner, ...dayJournal.collation]
    : []

  const dayTotals = allEntries.reduce(
    (acc, e) => ({
      calories: acc.calories + (parseFloat(e.calories) || 0),
      protein:  acc.protein  + (parseFloat(e.protein)  || 0),
      carbs:    acc.carbs    + (parseFloat(e.carbs)    || 0),
      fat:      acc.fat      + (parseFloat(e.fat)      || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const goal = userNeeds?.dailyCalories || 0

  return (
    <div className="min-h-screen bg-surface pb-32 font-body text-on-surface antialiased">
      {/* Header */}
      <header className="w-full top-0 sticky z-40 bg-surface">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/journal')}
              className="active:scale-95 duration-150 hover:opacity-80 transition-opacity text-primary"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-headline font-bold tracking-tight text-2xl text-primary">
              Historique
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 space-y-6 pt-2">

        {/* Navigateur de mois */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors active:scale-90"
          >
            <span className="material-symbols-outlined text-on-surface">chevron_left</span>
          </button>
          <h2 className="font-headline font-extrabold text-xl tracking-tight">
            {MONTHS_FR[viewMonth - 1]} {viewYear}
          </h2>
          <button
            onClick={nextMonth}
            disabled={isNextDisabled}
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors active:scale-90 disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-on-surface">chevron_right</span>
          </button>
        </div>

        {/* Grille calendrier */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0px_4px_32px_rgba(25,28,29,0.04)]">
          {/* En-têtes jours */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_FR.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-outline uppercase tracking-wider py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Cellules */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`off-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day  = i + 1
              const key  = toKey(viewYear, viewMonth, day)
              const data = summaryMap[key]
              const isToday    = key === todayKey
              const isSelected = key === selectedDate
              const isFuture   = key > todayKey
              const color      = dotColor(data?.calories, goal)

              return (
                <button
                  key={key}
                  disabled={isFuture}
                  onClick={() => setSelectedDate(isSelected ? null : key)}
                  className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl transition-all active:scale-90
                    ${isSelected  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                    : isToday     ? 'bg-primary/10 text-primary'
                    : isFuture    ? 'opacity-25 cursor-not-allowed'
                    : data        ? 'hover:bg-surface-container'
                    :               'hover:bg-surface-container opacity-50'}
                  `}
                >
                  <span className={`font-headline font-bold text-sm leading-none
                    ${isSelected ? 'text-on-primary' : isToday ? 'text-primary' : 'text-on-surface'}
                  `}>
                    {day}
                  </span>
                  {data && !isSelected && (
                    <span className={`mt-1 w-1.5 h-1.5 rounded-full ${color}`} />
                  )}
                  {data && isSelected && (
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-on-primary/60" />
                  )}
                  {!data && !isFuture && (
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-transparent" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Légende */}
          {!summaryLoading ? (
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-surface-container justify-center flex-wrap">
              {[
                { color: 'bg-tertiary/60', label: '< 50% objectif' },
                { color: 'bg-primary/70',  label: '50–85%' },
                { color: 'bg-primary',     label: '85–115%' },
                { color: 'bg-secondary',   label: '> 115%' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${l.color}`} />
                  <span className="text-[10px] text-outline font-semibold">{l.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3">
              <span className="material-symbols-outlined text-outline animate-spin text-base">refresh</span>
            </div>
          )}
        </div>

        {/* Détail du jour sélectionné */}
        {selectedDate && (
          <div className="space-y-4">
            {/* En-tête détail */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline font-extrabold text-lg capitalize">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', {
                    weekday: 'long', day: 'numeric', month: 'long',
                  })}
                </h3>
                {daySummary ? (
                  <p className="text-sm text-outline font-medium">
                    {Math.round(daySummary.calories)} kcal &middot; {daySummary.entry_count} aliment{daySummary.entry_count > 1 ? 's' : ''}
                  </p>
                ) : !dayLoading ? (
                  <p className="text-sm text-outline font-medium">Aucun aliment enregistré</p>
                ) : null}
              </div>
              <button
                onClick={() => setEditMode(e => !e)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                  editMode
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {editMode ? 'close' : 'edit'}
                </span>
                {editMode ? 'Terminer' : 'Modifier'}
              </button>
            </div>

            {dayLoading ? (
              <div className="flex justify-center py-8">
                <span className="material-symbols-outlined text-outline animate-spin">refresh</span>
              </div>
            ) : (
              <>
                {/* Mini carte calories */}
                {allEntries.length > 0 && (
                  <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0px_4px_32px_rgba(25,28,29,0.04)]">
                    <div className="grid grid-cols-4 gap-3 text-center">
                      {[
                        { label: 'Calories',  value: Math.round(dayTotals.calories), unit: 'kcal', color: 'text-on-surface' },
                        { label: 'Glucides',  value: Math.round(dayTotals.carbs),    unit: 'g',    color: 'text-primary'    },
                        { label: 'Protéines', value: Math.round(dayTotals.protein),  unit: 'g',    color: 'text-secondary'  },
                        { label: 'Lipides',   value: Math.round(dayTotals.fat),      unit: 'g',    color: 'text-tertiary'   },
                      ].map(m => (
                        <div key={m.label}>
                          <p className={`font-headline font-extrabold text-lg ${m.color}`}>
                            {m.value}<span className="text-xs font-bold ml-0.5">{m.unit}</span>
                          </p>
                          <p className="text-[10px] font-bold text-outline uppercase tracking-wider mt-0.5">{m.label}</p>
                        </div>
                      ))}
                    </div>
                    {goal > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                          <span>Progression</span>
                          <span>{Math.round((dayTotals.calories / goal) * 100)}% de l'objectif</span>
                        </div>
                        <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              dayTotals.calories / goal > 1.15 ? 'bg-secondary'
                              : dayTotals.calories / goal > 0.85 ? 'bg-primary'
                              : 'bg-primary/60'
                            }`}
                            style={{ width: `${Math.min((dayTotals.calories / goal) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sections repas */}
                <div className="space-y-3">
                  {MEAL_CONFIG.map(meal => (
                    <MealRow
                      key={meal.id}
                      meal={meal}
                      entries={dayJournal?.[meal.id] || []}
                      editMode={editMode}
                      selectedDate={selectedDate}
                      onAdd={(mealId) => { setTargetMeal(mealId); setAddModal(true) }}
                      onRemove={handleRemove}
                    />
                  ))}

                  {/* État vide */}
                  {allEntries.length === 0 && !editMode && (
                    <div className="text-center py-8 space-y-3">
                      <div className="text-4xl">📭</div>
                      <p className="text-outline font-medium text-sm">Aucun repas enregistré ce jour-là.</p>
                      <button
                        onClick={() => setEditMode(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-bold"
                      >
                        <span className="material-symbols-outlined text-base">add</span>
                        Ajouter des repas
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Placeholder aucun jour sélectionné */}
        {!selectedDate && (
          <div className="text-center py-10 text-outline">
            <span
              className="material-symbols-outlined text-4xl mb-3 block"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              calendar_today
            </span>
            <p className="font-medium text-sm">Sélectionne un jour pour voir le détail</p>
          </div>
        )}
      </main>

      {addModal && selectedDate && (
        <AddFoodModal
          mealId={targetMeal}
          date={selectedDate}
          onClose={handleAddClose}
        />
      )}
    </div>
  )
}
