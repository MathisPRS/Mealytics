import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import foods, { getFoodById, searchFoods, calcNutritionFull } from '../data/foods'

export default function CreateRecette() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { addRecipe, updateRecipe, recipes } = useApp()

  const existing = id ? recipes.find(r => r.id === parseInt(id)) : null

  const [name, setName] = useState(existing?.name || '')
  const [ingredients, setIngredients] = useState(existing?.ingredients || [])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      setSearchResults(searchFoods(searchQuery).slice(0, 8))
      setShowSearch(true)
    } else {
      setSearchResults([])
      setShowSearch(false)
    }
  }, [searchQuery])

  const addIngredient = (food) => {
    setIngredients(prev => [
      ...prev,
      { foodId: food.id, quantity: food.defaultQty, unit: food.defaultUnit },
    ])
    setSearchQuery('')
    setShowSearch(false)
  }

  const removeIngredient = (idx) => {
    setIngredients(prev => prev.filter((_, i) => i !== idx))
  }

  const updateQty = (idx, qty) => {
    setIngredients(prev => prev.map((ing, i) => i === idx ? { ...ing, quantity: parseFloat(qty) || 0 } : ing))
  }

  const totalNutrition = ingredients.reduce((acc, ing) => {
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

  const canSave = name.trim().length > 0 && ingredients.length > 0
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const handleSave = async () => {
    if (!canSave || saving) return
    setSaving(true)
    setSaveError(null)
    try {
      if (existing) {
        await updateRecipe(existing.id, { name: name.trim(), ingredients })
      } else {
        await addRecipe({ name: name.trim(), ingredients })
      }
      navigate('/recettes')
    } catch (err) {
      setSaveError(err.message || 'Erreur lors de la sauvegarde')
      setSaving(false)
    }
  }

  return (
    <div className="bg-surface min-h-screen font-body text-on-surface antialiased">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-screen-xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </button>
          <h1 className="font-headline font-bold tracking-tight text-on-surface text-lg">
            {existing ? 'Modifier la recette' : 'Créer une recette'}
          </h1>
          <div className="w-10 h-10" />
        </div>
        <div className="bg-outline-variant/15 h-px w-full" />
      </header>

      <main className="pt-20 pb-32 px-6 max-w-2xl mx-auto">
        {/* Recipe name */}
        <section className="mb-8 mt-4">
          <label className="block font-headline text-xs font-bold mb-3 text-outline uppercase tracking-wider">
            Nom de la recette
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex : Salade de Quinoa au Citron"
            className="w-full bg-surface-container-low border-none rounded-2xl p-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant font-body outline-none"
          />
        </section>

        {/* Ingredients */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-xl font-bold">Ingrédients</h2>
            {ingredients.length > 0 && (
              <span className="text-primary font-label font-bold text-sm">{ingredients.length} ajouté{ingredients.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher un ingrédient..."
              className="w-full bg-surface-container-low border-none rounded-full py-4 pl-12 pr-6 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all font-body outline-none"
            />
            {/* Search results dropdown */}
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/10 overflow-hidden z-10">
                {searchResults.map(food => (
                  <button
                    key={food.id}
                    onClick={() => addIngredient(food)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors text-left"
                  >
                    <span className="text-xl">{food.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-on-surface truncate">{food.name}</p>
                      <p className="text-xs text-outline">{food.category}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary flex-shrink-0">
                      {food.calories} kcal/100{food.defaultUnit === 'pcs' ? 'pcs' : 'g'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ingredient list */}
          <div className="space-y-3">
            {ingredients.length === 0 && (
              <p className="text-center text-outline text-sm py-6">Recherchez un ingrédient à ajouter</p>
            )}
            {ingredients.map((ing, idx) => {
              const food = getFoodById(ing.foodId)
              if (!food) return null
              const n = calcNutritionFull(food, ing.quantity, ing.unit || food.defaultUnit)
              return (
                <div key={idx} className="flex items-center p-4 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-xl flex-shrink-0">
                    {food.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-bold text-sm text-on-surface truncate">{food.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        value={ing.quantity}
                        onChange={e => updateQty(idx, e.target.value)}
                        min="0"
                        className="w-16 text-center text-sm font-semibold bg-surface-container-low border-none rounded-lg py-1 focus:ring-1 focus:ring-primary/20 outline-none"
                      />
                      <span className="text-xs text-outline">{ing.unit}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 mr-2">
                    <span className="block font-headline font-bold text-primary text-sm">{Math.round(n.calories)}</span>
                    <span className="block font-label text-[10px] text-outline uppercase">kcal</span>
                  </div>
                  <button
                    onClick={() => removeIngredient(idx)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary/10 text-outline hover:text-secondary transition-colors flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        {/* Nutrition summary */}
        {ingredients.length > 0 && (
          <section className="bg-surface-container-low rounded-3xl p-6 mb-6">
            <h2 className="font-headline text-xs font-bold mb-6 text-outline uppercase tracking-wider text-center">
              Estimation Nutritionnelle
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {/* Calories big */}
              <div className="col-span-2 bg-surface-container-lowest rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="block font-label text-xs text-outline mb-1 font-bold uppercase">Total Calories</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline text-4xl font-extrabold text-primary">
                      {Math.round(totalNutrition.calories)}
                    </span>
                    <span className="font-body text-outline font-semibold text-sm">kcal / port.</span>
                  </div>
                </div>
              </div>
              {[
                { label: 'Protéines', value: totalNutrition.protein, color: 'text-secondary' },
                { label: 'Glucides', value: totalNutrition.carbs, color: 'text-tertiary' },
                { label: 'Lipides', value: totalNutrition.fat, color: 'text-on-surface' },
              ].map(m => (
                <div key={m.label} className={`bg-surface-container-lowest rounded-2xl p-4 ${m.label === 'Lipides' ? 'col-span-2' : ''}`}>
                  <span className="block font-label text-[10px] text-outline font-bold uppercase mb-1">{m.label}</span>
                  <span className={`font-headline text-lg font-bold ${m.color}`}>{Math.round(m.value)}g</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer CTA */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-2xl p-6 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
        <div className="max-w-2xl mx-auto">
          {saveError && (
            <p className="text-secondary text-sm font-semibold text-center mb-3">{saveError}</p>
          )}
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className={`w-full py-4 px-6 rounded-full font-headline font-bold text-base transition-all active:scale-[0.98] ${
              canSave && !saving
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 hover:bg-primary-container'
                : 'bg-surface-container text-outline cursor-not-allowed'
            }`}
          >
            {saving ? 'Sauvegarde...' : existing ? 'Enregistrer les modifications' : 'Sauvegarder la recette'}
          </button>
        </div>
      </footer>
    </div>
  )
}
