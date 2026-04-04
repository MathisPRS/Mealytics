import { useState, useEffect, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import foods, { getFoodById, searchFoods, calcNutritionFull } from '../data/foods'
import BarcodeScannerModal from './BarcodeScannerModal'
import { api } from '../utils/api'

// ── Fetch product from Open Food Facts ────────────────────────────
async function fetchProductByBarcode(barcode) {
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
    { signal: AbortSignal.timeout(10000) }
  )
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (data.status !== 1) return null

  const p = data.product
  const n = p.nutriments || {}
  const name = p.product_name_fr || p.product_name || p.abbreviated_product_name || ''
  if (!name) return null

  const calories = parseFloat(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0)
  const protein  = parseFloat(n['proteins_100g']    ?? n['proteins']    ?? 0)
  const carbs    = parseFloat(n['carbohydrates_100g']?? n['carbohydrates']?? 0)
  const fat      = parseFloat(n['fat_100g']          ?? n['fat']          ?? 0)

  return {
    id:          `barcode_${barcode}`,
    name,
    emoji:       '🛒',
    defaultQty:  100,
    defaultUnit: 'g',
    calories:    Math.round(calories * 10) / 10,
    protein:     Math.round(protein  * 10) / 10,
    carbs:       Math.round(carbs    * 10) / 10,
    fat:         Math.round(fat      * 10) / 10,
    category:    'Scanné',
    barcode,
    incomplete:  calories === 0 && protein === 0 && carbs === 0 && fat === 0,
  }
}

// Tab indices
const TAB_RECENTS   = 0
const TAB_FAVORIS   = 1
const TAB_RECETTES  = 2
const TAB_SCANNES   = 3

const TABS = [
  { id: TAB_RECENTS,  label: 'Récents'      },
  { id: TAB_FAVORIS,  label: 'Favoris'      },
  { id: TAB_RECETTES, label: 'Mes Recettes' },
  { id: TAB_SCANNES,  label: 'Scannés'      },
]

// ── Helpers ────────────────────────────────────────────────────────
function calcKcal(food) {
  return Math.round(
    food.calories * (food.defaultUnit === 'pcs'
      ? food.defaultQty * 55 / 100
      : food.defaultQty / 100)
  )
}

// ── FoodItem ───────────────────────────────────────────────────────
function FoodItem({ food, onSelect, isFavorite, onToggleFav }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors duration-200">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-container flex items-center justify-center text-3xl flex-shrink-0">
          {food.emoji}
        </div>
        <div className="min-w-0">
          <p className="font-body font-bold text-on-surface truncate">{food.name}</p>
          <p className="text-xs text-outline font-medium">
            {food.defaultQty}{food.defaultUnit} • {calcKcal(food)} kcal
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {onToggleFav && (
          <button
            onClick={() => onToggleFav(food.id)}
            className="p-2 text-outline hover:text-secondary transition-colors"
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
            >
              star
            </span>
          </button>
        )}
        <button
          onClick={() => onSelect(food)}
          className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
    </div>
  )
}

// ── QuantityModal ──────────────────────────────────────────────────
function QuantityModal({ food, onConfirm, onCancel }) {
  const [qty, setQty] = useState(food.defaultQty)
  const nutrition = calcNutritionFull(food, qty, food.defaultUnit)

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-surface-container-lowest rounded-t-3xl w-full max-w-md p-6 pb-28 space-y-6 shadow-2xl">
        <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto" />

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-3xl">
            {food.emoji}
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg">{food.name}</h3>
            <p className="text-outline text-sm">{food.category}</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-outline uppercase tracking-wider">
            Quantité ({food.defaultUnit})
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty(q => Math.max(food.defaultUnit === 'pcs' ? 0.5 : 10, q - (food.defaultUnit === 'pcs' ? 1 : 10)))}
              className="size-12 min-w-[3rem] rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 hover:bg-surface-container-high transition-colors active:scale-90"
            >
              <span className="material-symbols-outlined text-[22px]">remove</span>
            </button>
            <input
              type="number"
              value={qty}
              onChange={e => setQty(parseFloat(e.target.value) || 0)}
              min={food.defaultUnit === 'pcs' ? 0.5 : 5}
              step={food.defaultUnit === 'pcs' ? 1 : 10}
              className="flex-1 min-w-0 text-center text-3xl font-headline font-extrabold bg-surface-container-low border-none rounded-2xl py-3 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest outline-none"
            />
            <button
              onClick={() => setQty(q => q + (food.defaultUnit === 'pcs' ? 1 : 10))}
              className="size-12 min-w-[3rem] rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 hover:bg-surface-container-high transition-colors active:scale-90"
            >
              <span className="material-symbols-outlined text-[22px]">add</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Kcal', value: nutrition.calories,         color: 'text-primary'   },
            { label: 'Prot', value: `${nutrition.protein}g`,    color: 'text-secondary' },
            { label: 'Gluc', value: `${nutrition.carbs}g`,      color: 'text-primary'   },
            { label: 'Lip',  value: `${nutrition.fat}g`,        color: 'text-outline'   },
          ].map(n => (
            <div key={n.label} className="bg-surface-container-low rounded-xl p-3 text-center">
              <p className={`font-headline font-bold text-sm ${n.color}`}>{n.value}</p>
              <p className="text-[10px] text-outline font-bold uppercase">{n.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => onConfirm(food, qty)}
          className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all"
        >
          Ajouter au repas
        </button>
      </div>
    </div>
  )
}

// ── AddFoodModal ───────────────────────────────────────────────────
export default function AddFoodModal({ mealId, date, onClose }) {
  const { recents, favorites, recipes, addFoodToMeal, toggleFavorite, isFavorite, getDayJournalSync, removeFoodFromMeal } = useApp()
  const [tab, setTab]               = useState(TAB_RECENTS)
  const [query, setQuery]           = useState('')
  const [selectedFood, setSelectedFood] = useState(null)
  const [scanned, setScanned]           = useState([])
  const [scannedLoading, setScannedLoading] = useState(false)

  // ── Scanner state ──────────────────────────────────────────────
  // null = closed ; object { phase, product, barcode, errorMessage, prefillName } = open
  const [scannerResult, setScannerResult] = useState(null)
  const [scanLoading,   setScanLoading]   = useState(false)

  const fileInputRef = useRef(null)
  const inputRef     = useRef(null)

  // Load scanned foods from backend on mount
  useEffect(() => {
    setScannedLoading(true)
    api.scannedFoods.getAll()
      .then(rows => {
        setScanned(rows.map(row => ({
          id:          row.food_id,
          dbId:        row.id,
          name:        row.name,
          emoji:       '🛒',
          defaultQty:  parseFloat(row.default_qty),
          defaultUnit: row.default_unit,
          calories:    parseFloat(row.calories),
          protein:     parseFloat(row.protein),
          carbs:       parseFloat(row.carbs),
          fat:         parseFloat(row.fat),
          category:    'Scanné',
          barcode:     row.barcode,
        })))
      })
      .catch(() => {})
      .finally(() => setScannedLoading(false))
  }, [])

  useEffect(() => { inputRef.current?.focus() }, [])

  const mealLabels = {
    petit_dejeuner: 'Petit déjeuner',
    dejeuner:       'Déjeuner',
    diner:          'Dîner',
    collation:      'Collation',
  }

  const dayJournal      = getDayJournalSync(date)
  const currentEntries  = dayJournal[mealId] || []
  const mealTotal       = currentEntries.reduce((s, e) => s + (parseFloat(e.calories) || 0), 0)

  // ── Foods to display ──────────────────────────────────────────
  const getDisplayFoods = () => {
    if (query.trim()) return searchFoods(query)
    if (tab === TAB_RECENTS) {
      const r = recents.map(id => getFoodById(id)).filter(Boolean)
      return r.length > 0 ? r : foods.slice(0, 10)
    }
    if (tab === TAB_FAVORIS)  return favorites.map(id => getFoodById(id)).filter(Boolean)
    if (tab === TAB_SCANNES)  return scanned
    return []
  }
  const displayFoods = getDisplayFoods()

  // ── Scanner ───────────────────────────────────────────────────
  const triggerScanner = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setScanLoading(true)
    try {
      const { barcode } = await api.scan.fromImage(file)
      const prod = await fetchProductByBarcode(barcode)
      if (!prod) {
        setScannerResult({ phase: 'not_found', barcode, product: null })
      } else if (prod.incomplete) {
        setScannerResult({ phase: 'incomplete', barcode, product: prod, prefillName: prod.name })
      } else {
        setScannerResult({ phase: 'found', barcode, product: prod })
      }
    } catch (err) {
      const isNotFound = err.message?.includes('404') || err.message?.includes('Aucun code-barres')
      if (isNotFound) {
        setScannerResult({ phase: 'not_found', barcode: null, product: null })
      } else {
        setScannerResult({ phase: 'error', barcode: null, product: null, errorMessage: err.message })
      }
    } finally {
      setScanLoading(false)
    }
  }

  // Called by BarcodeScannerModal when user confirms a product
  const handleProductFound = async (product) => {
    setScannerResult(null)
    setTab(TAB_SCANNES)

    try {
      const saved = await api.scannedFoods.save(product)
      const normalized = {
        id:          saved.food_id,
        dbId:        saved.id,
        name:        saved.name,
        emoji:       '🛒',
        defaultQty:  parseFloat(saved.default_qty),
        defaultUnit: saved.default_unit,
        calories:    parseFloat(saved.calories),
        protein:     parseFloat(saved.protein),
        carbs:       parseFloat(saved.carbs),
        fat:         parseFloat(saved.fat),
        category:    'Scanné',
        barcode:     saved.barcode,
      }
      setScanned(prev => {
        const filtered = prev.filter(p => p.id !== normalized.id)
        return [normalized, ...filtered]
      })
      setSelectedFood(normalized)
    } catch {
      const local = { ...product, dbId: null }
      setScanned(prev => {
        const filtered = prev.filter(p => p.id !== product.id)
        return [local, ...filtered]
      })
      setSelectedFood(local)
    }
  }

  // ── Other handlers ────────────────────────────────────────────
  const handleConfirm = (food, qty) => {
    const nutrition = calcNutritionFull(food, qty, food.defaultUnit)
    addFoodToMeal(date, mealId, {
      foodId:   food.id,
      name:     food.name,
      quantity: qty,
      unit:     food.defaultUnit,
      ...nutrition,
    })
    setSelectedFood(null)
    setQuery('')
  }

  const handleAddRecipe = (recipe) => {
    const totalNutrition = recipe.ingredients.reduce((acc, ing) => {
      const food = getFoodById(ing.foodId)
      if (!food) return acc
      const n = calcNutritionFull(food, ing.quantity, ing.unit || food.defaultUnit)
      return { calories: acc.calories + n.calories, protein: acc.protein + n.protein, carbs: acc.carbs + n.carbs, fat: acc.fat + n.fat }
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
    addFoodToMeal(date, mealId, {
      foodId: `recipe_${recipe.id}`, name: recipe.name, quantity: 1, unit: 'portion', ...totalNutrition,
    })
  }

  const handleDeleteScanned = async (food) => {
    if (food.dbId) {
      try { await api.scannedFoods.remove(food.dbId) } catch {}
    }
    setScanned(prev => prev.filter(p => p.id !== food.id))
  }

  const sectionTitle = () => {
    if (query.trim()) return 'Résultats'
    if (tab === TAB_RECENTS)  return 'Aliments Récents'
    if (tab === TAB_FAVORIS)  return 'Mes Favoris'
    if (tab === TAB_RECETTES) return 'Mes Recettes'
    if (tab === TAB_SCANNES)  return 'Produits Scannés'
    return null
  }

  return (
    <>
      {/* Hidden file input — triggers native camera directly */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="fixed inset-0 z-50 flex flex-col bg-surface">

        {/* ── Header ───────────────────────────────────────────── */}
        <header className="w-full sticky top-0 z-10 bg-surface flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="active:scale-95 duration-200 text-primary p-1"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-headline font-bold tracking-tight text-2xl text-on-surface">
              Ajouter un aliment
            </h1>
          </div>
          <button
            onClick={triggerScanner}
            className="active:scale-95 duration-200 text-primary p-1"
          >
            <span className="material-symbols-outlined">barcode_scanner</span>
          </button>
        </header>

        {/* ── Scrollable content ───────────────────────────────── */}
        <div className="flex-1 overflow-y-auto pb-8">
          <main className="px-6 space-y-8 max-w-2xl mx-auto">

            {/* ── Search bar ─────────────────────────────────── */}
            <section className="mt-2">
              <div className="relative flex items-center">
                <div className="absolute left-4 text-outline pointer-events-none">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Rechercher un aliment..."
                  className="w-full h-14 pl-12 pr-14 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest font-body transition-all outline-none placeholder:text-outline"
                />
                <button
                  onClick={triggerScanner}
                  className="absolute right-4 text-primary active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined">barcode_scanner</span>
                </button>
              </div>
            </section>

            {/* ── Tabs ─────────────────────────────────────────── */}
            {!query.trim() && (
              <nav className="flex space-x-8 border-none overflow-x-auto no-scrollbar -mb-2">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`pb-2 whitespace-nowrap font-headline font-bold transition-all ${
                      tab === t.id
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-slate-500 hover:text-on-surface'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </nav>
            )}

            {/* ── Dans ce repas ────────────────────────────────── */}
            {currentEntries.length > 0 && !query.trim() && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline font-bold text-lg tracking-tight">Dans ce repas</h2>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                    {currentEntries.length} aliment{currentEntries.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] space-y-4">
                  {currentEntries.map(entry => {
                    const food = getFoodById(entry.foodId || entry.food_id)
                    const emoji = food?.emoji ?? '🍽️'
                    return (
                      <div key={entry.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container flex items-center justify-center text-2xl flex-shrink-0">
                            {emoji}
                          </div>
                          <div className="min-w-0">
                            <p className="font-body font-bold text-on-surface truncate">
                              {entry.food_name || entry.name}
                            </p>
                            <p className="text-xs text-outline font-medium">
                              {entry.quantity}{entry.unit} • {Math.round(entry.calories)} kcal
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFoodFromMeal(date, mealId, entry.id)}
                          className="text-secondary active:scale-95 transition-transform p-2 flex-shrink-0"
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    )
                  })}

                  <div className="pt-4 mt-2 border-t border-outline-variant/15 flex justify-between items-center">
                    <span className="font-headline font-bold text-on-surface">Total</span>
                    <span className="font-headline font-extrabold text-primary text-xl">
                      {Math.round(mealTotal)} kcal
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* ── Food list ────────────────────────────────────── */}
            <section className="space-y-4">
              {sectionTitle() && (
                <h2 className="font-headline font-bold text-lg tracking-tight">
                  {sectionTitle()}
                </h2>
              )}

              <div className="space-y-4">

                {/* Recettes tab */}
                {tab === TAB_RECETTES && !query.trim() && (
                  recipes.length === 0
                    ? (
                      <p className="text-center text-outline py-8">
                        Aucune recette créée pour l'instant.
                      </p>
                    )
                    : recipes.map(recipe => {
                        const totalCals = recipe.ingredients?.reduce((acc, ing) => {
                          const food = getFoodById(ing.foodId)
                          if (!food) return acc
                          return acc + calcNutritionFull(food, ing.quantity, ing.unit || food.defaultUnit).calories
                        }, 0) || 0
                        return (
                          <div
                            key={recipe.id}
                            className="bg-surface-container-lowest rounded-2xl p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors duration-200"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-3xl flex-shrink-0">
                                🍽️
                              </div>
                              <div className="min-w-0">
                                <p className="font-body font-bold text-on-surface truncate">{recipe.name}</p>
                                <p className="text-xs text-outline font-medium">
                                  1 portion • {Math.round(totalCals)} kcal
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddRecipe(recipe)}
                              className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
                            >
                              <span className="material-symbols-outlined">add</span>
                            </button>
                          </div>
                        )
                      })
                )}

                {/* Scannés — empty state */}
                {tab === TAB_SCANNES && !query.trim() && !scannedLoading && scanned.length === 0 && (
                  <div className="flex flex-col items-center py-12 gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-outline text-3xl">barcode_scanner</span>
                    </div>
                    <div>
                      <p className="font-headline font-bold text-on-surface">Aucun produit scanné</p>
                      <p className="text-sm text-outline mt-1">
                        Utilise le bouton scanner pour lire un code-barres
                      </p>
                    </div>
                    <button
                      onClick={triggerScanner}
                      className="bg-primary text-on-primary font-semibold text-sm px-6 py-3 rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                    >
                      Scanner un produit
                    </button>
                  </div>
                )}

                {/* Scannés — loading */}
                {tab === TAB_SCANNES && !query.trim() && scannedLoading && (
                  <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}

                {/* Regular food items */}
                {(tab !== TAB_RECETTES || query.trim()) &&
                  !(tab === TAB_SCANNES && !query.trim() && (scanned.length === 0 || scannedLoading)) && (
                    displayFoods.length === 0
                      ? (
                        <p className="text-center text-outline py-8">
                          {query.trim() ? 'Aucun résultat' : 'Aucun aliment dans cette liste'}
                        </p>
                      )
                      : displayFoods.map(food => (
                          <div key={food.id} className="relative group">
                            <FoodItem
                              food={food}
                              onSelect={setSelectedFood}
                              isFavorite={isFavorite(food.id)}
                              onToggleFav={food.id.startsWith('barcode_') ? null : toggleFavorite}
                            />
                            {tab === TAB_SCANNES && !query.trim() && (
                              <button
                                onClick={() => handleDeleteScanned(food)}
                                className="absolute top-2 right-14 p-1.5 rounded-full bg-surface-container text-outline hover:text-error hover:bg-error/10 transition-colors opacity-0 group-hover:opacity-100"
                                title="Supprimer"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            )}
                          </div>
                        ))
                  )}
              </div>
            </section>

          </main>
        </div>

        {/* Quantity modal */}
        {selectedFood && (
          <QuantityModal
            food={selectedFood}
            onConfirm={handleConfirm}
            onCancel={() => setSelectedFood(null)}
          />
        )}

        {/* Scanning spinner overlay */}
        {scanLoading && (
          <div className="absolute inset-0 z-[60] bg-black/50 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white animate-spin" />
            <p className="text-white font-medium text-sm">Analyse du code-barres...</p>
          </div>
        )}
      </div>

      {/* Scanner result modal */}
      {scannerResult && (
        <BarcodeScannerModal
          phase={scannerResult.phase}
          product={scannerResult.product}
          barcode={scannerResult.barcode}
          errorMessage={scannerResult.errorMessage}
          prefillName={scannerResult.prefillName}
          onProductFound={handleProductFound}
          onRetry={() => { setScannerResult(null); triggerScanner() }}
          onClose={() => setScannerResult(null)}
        />
      )}
    </>
  )
}
