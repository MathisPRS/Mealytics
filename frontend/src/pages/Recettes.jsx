import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { getFoodById, calcNutritionFull } from '../data/foods'

function RecipeCard({ recipe, onDelete }) {
  const totalNutrition = recipe.ingredients?.reduce((acc, ing) => {
    const food = getFoodById(ing.foodId)
    if (!food) return acc
    const n = calcNutritionFull(food, ing.quantity, ing.unit || food.defaultUnit)
    return {
      calories: acc.calories + n.calories,
      protein: acc.protein + n.protein,
      carbs: acc.carbs + n.carbs,
      fat: acc.fat + n.fat,
    }
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 }) || { calories: 0, protein: 0, carbs: 0, fat: 0 }

  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-4 relative">
      <div className="w-24 h-24 flex-shrink-0 rounded-xl bg-surface-container flex items-center justify-center text-4xl">
        🍽️
      </div>
      <div className="flex-grow flex flex-col gap-1 min-w-0">
        <h3 className="font-headline text-on-surface font-bold text-base truncate">{recipe.name}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-secondary font-semibold bg-secondary-fixed/30 px-2 py-0.5 rounded-full">
            <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
            {Math.round(totalNutrition.calories)} kcal
          </span>
          <span className="text-on-surface-variant text-xs">
            {recipe.ingredients?.length || 0} ingrédient{recipe.ingredients?.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setMenuOpen(m => !m)}
          className="p-2 text-outline hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">more_vert</span>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-10 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/10 py-1 z-10 min-w-32">
            <button
              onClick={() => { navigate(`/recettes/modifier/${recipe.id}`); setMenuOpen(false) }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-surface-container transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Modifier
            </button>
            <button
              onClick={() => { onDelete(recipe.id); setMenuOpen(false) }}
              className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-secondary/5 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">delete</span>
              Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Recettes() {
  const { recipes, deleteRecipe } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0) // 0 = Mes recettes, 1 = Découvrir

  return (
    <div className="bg-surface min-h-screen pb-28 font-body text-on-surface antialiased">
      {/* Header */}
      <header className="w-full top-0 sticky z-40 bg-surface flex items-center justify-between px-6 py-4">
        <h1 className="font-headline font-extrabold tracking-tight text-xl text-primary">Recettes</h1>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-2">
        {/* Tab nav */}
        <nav className="flex gap-8 mb-8 border-b border-outline-variant/15">
          <button
            onClick={() => setTab(0)}
            className={`pb-4 font-bold transition-all border-b-2 ${
              tab === 0 ? 'text-primary border-primary' : 'text-outline border-transparent hover:text-on-surface'
            }`}
          >
            Mes Recettes
          </button>
          <button
            onClick={() => setTab(1)}
            className={`pb-4 font-medium transition-all border-b-2 ${
              tab === 1 ? 'text-primary border-primary' : 'text-outline border-transparent hover:text-on-surface'
            }`}
          >
            Découvrir
          </button>
        </nav>

        {tab === 0 && (
          <>
            {/* CTA */}
            <section className="mb-8">
              <button
                onClick={() => navigate('/recettes/creer')}
                className="w-full py-4 px-6 bg-primary text-on-primary rounded-xl flex items-center justify-center gap-3 shadow-[0px_12px_24px_rgba(0,104,87,0.15)] active:scale-[0.98] transition-all hover:bg-primary-container"
              >
                <span className="material-symbols-outlined">add_circle</span>
                <span className="font-headline font-bold tracking-tight">Créer une recette</span>
              </button>
            </section>

            {/* Recipe list */}
            {recipes.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-6xl">🍳</div>
                <h2 className="font-headline font-bold text-xl">Aucune recette</h2>
                <p className="text-outline text-sm">Créez votre première recette personnalisée</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="font-headline text-on-surface font-extrabold text-xl tracking-tight mb-2">
                  Mes créations
                </h2>
                {recipes.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onDelete={deleteRecipe}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === 1 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-24 h-24 bg-surface-container rounded-3xl flex items-center justify-center text-5xl">
              🔜
            </div>
            <h2 className="font-headline font-bold text-2xl tracking-tight">Bientôt disponible</h2>
            <p className="text-outline text-sm max-w-xs">
              La découverte de recettes communautaires arrive prochainement. Restez à l'affût !
            </p>
            <span className="px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
              En développement
            </span>
          </div>
        )}
      </main>
    </div>
  )
}
