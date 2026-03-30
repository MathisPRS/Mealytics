import { useState, useEffect, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import foods, { getFoodById, searchFoods, calcNutritionFull } from '../data/foods'

const TABS = ['Récents', 'Favoris', 'Mes recettes']

function FoodItem({ food, onSelect, isFavorite, onToggleFav }) {
  return (
    <div className="group bg-surface-container-lowest p-5 rounded-xl flex items-center justify-between transition-all hover:translate-x-1 duration-300">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-2xl flex-shrink-0">
          {food.emoji}
        </div>
        <div className="min-w-0">
          <h3 className="font-headline font-bold text-base text-on-surface truncate">{food.name}</h3>
          <div className="flex items-center gap-2">
            <span className="font-body text-sm text-outline">
              {food.defaultQty}{food.defaultUnit}
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant" />
            <span className="font-label text-sm font-semibold text-primary">
              {Math.round(food.calories * (food.defaultUnit === 'pcs' ? food.defaultQty * 55 / 100 : food.defaultQty / 100))} kcal
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onToggleFav(food.id)}
          className="p-2 text-outline hover:text-secondary transition-colors"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
          >
            star
          </span>
        </button>
        <button
          onClick={() => onSelect(food)}
          className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-90 transition-transform shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
    </div>
  )
}

function QuantityModal({ food, onConfirm, onCancel }) {
  const [qty, setQty] = useState(food.defaultQty)
  const nutrition = calcNutritionFull(food, qty, food.defaultUnit)

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-surface-container-lowest rounded-t-3xl w-full max-w-md p-6 pb-10 space-y-6 shadow-2xl">
        {/* Handle */}
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

        {/* Quantity input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-outline uppercase tracking-wider">
            Quantité ({food.defaultUnit})
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty(q => Math.max(food.defaultUnit === 'pcs' ? 0.5 : 10, q - (food.defaultUnit === 'pcs' ? 1 : 10)))}
              className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            <input
              type="number"
              value={qty}
              onChange={e => setQty(parseFloat(e.target.value) || 0)}
              min={food.defaultUnit === 'pcs' ? 0.5 : 5}
              step={food.defaultUnit === 'pcs' ? 1 : 10}
              className="flex-1 text-center text-3xl font-headline font-extrabold bg-surface-container-low border-none rounded-2xl py-3 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest outline-none"
            />
            <button
              onClick={() => setQty(q => q + (food.defaultUnit === 'pcs' ? 1 : 10))}
              className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>

        {/* Nutrition preview */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Kcal', value: nutrition.calories, color: 'text-primary' },
            { label: 'Prot', value: `${nutrition.protein}g`, color: 'text-secondary' },
            { label: 'Gluc', value: `${nutrition.carbs}g`, color: 'text-tertiary' },
            { label: 'Lip', value: `${nutrition.fat}g`, color: 'text-outline' },
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

export default function AddFoodModal({ mealId, date, onClose }) {
  const { recents, favorites, recipes, addFoodToMeal, toggleFavorite, isFavorite, getDayJournalSync, removeFoodFromMeal } = useApp()
  const [tab, setTab] = useState(0)
  const [query, setQuery] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const mealLabels = {
    petit_dejeuner: 'Petit déjeuner',
    dejeuner: 'Déjeuner',
    diner: 'Dîner',
    collation: 'Collation',
  }

  // Entrées déjà dans ce repas
  const dayJournal = getDayJournalSync(date)
  const currentEntries = dayJournal[mealId] || []
  const mealTotal = currentEntries.reduce((s, e) => s + (parseFloat(e.calories) || 0), 0)
  const mealProtein = currentEntries.reduce((s, e) => s + (parseFloat(e.protein) || 0), 0)
  const mealCarbs   = currentEntries.reduce((s, e) => s + (parseFloat(e.carbs)   || 0), 0)
  const mealFat     = currentEntries.reduce((s, e) => s + (parseFloat(e.fat)     || 0), 0)

  // Foods to show based on tab + search
  const getDisplayFoods = () => {
    if (query.trim()) {
      return searchFoods(query)
    }
    if (tab === 0) {
      // Récents
      const recentFoods = recents.map(id => getFoodById(id)).filter(Boolean)
      return recentFoods.length > 0 ? recentFoods : foods.slice(0, 10)
    }
    if (tab === 1) {
      // Favoris
      return favorites.map(id => getFoodById(id)).filter(Boolean)
    }
    // Tab 2: Mes recettes — show recipe cards separately
    return []
  }

  const displayFoods = getDisplayFoods()

  const handleSelect = (food) => {
    setSelectedFood(food)
  }

  const handleConfirm = (food, qty) => {
    const nutrition = calcNutritionFull(food, qty, food.defaultUnit)
    addFoodToMeal(date, mealId, {
      foodId: food.id,
      name: food.name,
      quantity: qty,
      unit: food.defaultUnit,
      ...nutrition,
    })
    // Stay on the modal so the user can add more foods
    setSelectedFood(null)
  }

  // Add recipe as food
  const handleAddRecipe = (recipe) => {
    // Sum all ingredients
    const totalNutrition = recipe.ingredients.reduce((acc, ing) => {
      const food = getFoodById(ing.foodId)
      if (!food) return acc
      const n = calcNutritionFull(food, ing.quantity, ing.unit || food.defaultUnit)
      return {
        calories: acc.calories + n.calories,
        protein: acc.protein + n.protein,
        carbs: acc.carbs + n.carbs,
        fat: acc.fat + n.fat,
      }
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })

    addFoodToMeal(date, mealId, {
      foodId: `recipe_${recipe.id}`,
      name: recipe.name,
      quantity: 1,
      unit: 'portion',
      ...totalNutrition,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface">
      {/* Header */}
      <header className="bg-surface flex items-center justify-between px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="hover:bg-surface-container transition-colors p-2 rounded-full"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <div>
            <h1 className="font-headline font-bold text-xl text-on-surface">Ajouter un aliment</h1>
            <p className="text-xs text-outline">{mealLabels[mealId]}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-8">
        {/* Search */}
        <div className="flex items-center gap-3 pt-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline">search</span>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un aliment..."
              className="w-full bg-surface-container-low border-none rounded-full py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline outline-none text-sm"
            />
          </div>
        </div>

        {/* Dans ce repas */}
        {currentEntries.length > 0 && (
          <div className="bg-surface-container-low rounded-2xl overflow-hidden">
            {/* Header de la section */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-container">
              <span className="text-xs font-bold text-outline uppercase tracking-wider">
                Dans ce repas
              </span>
              <div className="flex items-center gap-3 text-xs font-semibold text-outline">
                <span>P <span className="text-on-surface">{Math.round(mealProtein)}g</span></span>
                <span>G <span className="text-on-surface">{Math.round(mealCarbs)}g</span></span>
                <span>L <span className="text-on-surface">{Math.round(mealFat)}g</span></span>
                <span className="font-headline font-extrabold text-primary text-sm ml-1">
                  {Math.round(mealTotal)} kcal
                </span>
              </div>
            </div>
            {/* Liste des entrées */}
            <div className="divide-y divide-surface-container">
              {currentEntries.map(entry => (
                <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-base flex-shrink-0">
                    🍽️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-on-surface truncate">
                      {entry.food_name || entry.name}
                    </p>
                    <p className="text-xs text-outline">
                      {entry.quantity}{entry.unit}
                    </p>
                  </div>
                  <span className="font-headline font-bold text-sm text-primary flex-shrink-0">
                    {Math.round(entry.calories)} kcal
                  </span>
                  <button
                    onClick={() => removeFoodFromMeal(date, mealId, entry.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary/10 text-outline hover:text-secondary transition-colors flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        {!query.trim() && (
          <nav className="flex items-center gap-2 p-1 bg-surface-container-low rounded-full">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                className={`flex-1 py-2.5 rounded-full font-label text-sm font-semibold transition-all ${
                  tab === i
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                {t}
              </button>
            ))}
          </nav>
        )}

        {/* Title */}
        {!query.trim() && (
          <div className="flex justify-between items-end">
            <h2 className="font-headline font-bold text-xl tracking-tight text-on-surface">
              {tab === 0 ? 'Souvent consommés' : tab === 1 ? 'Mes favoris' : 'Mes recettes'}
            </h2>
          </div>
        )}

        {/* Food list */}
        <div className="space-y-3">
          {/* Recipes tab */}
          {tab === 2 && !query.trim() && (
            recipes.length === 0
              ? <p className="text-center text-outline py-8">Aucune recette créée pour l'instant.</p>
              : recipes.map(recipe => {
                  const totalCals = recipe.ingredients?.reduce((acc, ing) => {
                    const food = getFoodById(ing.foodId)
                    if (!food) return acc
                    const n = calcNutritionFull(food, ing.quantity, ing.unit || food.defaultUnit)
                    return acc + n.calories
                  }, 0) || 0
                  return (
                    <div key={recipe.id} className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-xl">🍽️</div>
                        <div className="min-w-0">
                          <p className="font-headline font-bold text-sm truncate">{recipe.name}</p>
                          <p className="text-xs text-outline">{Math.round(totalCals)} kcal / portion</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddRecipe(recipe)}
                        className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-90 transition-transform shadow-lg shadow-primary/20 flex-shrink-0"
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                  )
                })
          )}

          {/* Food items */}
          {(tab !== 2 || query.trim()) && (
            displayFoods.length === 0
              ? <p className="text-center text-outline py-8">
                  {query.trim() ? 'Aucun résultat' : 'Aucun aliment dans cette liste'}
                </p>
              : displayFoods.map(food => (
                  <FoodItem
                    key={food.id}
                    food={food}
                    onSelect={handleSelect}
                    isFavorite={isFavorite(food.id)}
                    onToggleFav={toggleFavorite}
                  />
                ))
          )}
        </div>
      </div>

      {/* Quantity modal */}
      {selectedFood && (
        <QuantityModal
          food={selectedFood}
          onConfirm={handleConfirm}
          onCancel={() => setSelectedFood(null)}
        />
      )}
    </div>
  )
}
