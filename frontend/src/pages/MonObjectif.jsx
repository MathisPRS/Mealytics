import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { calcUserNeeds } from '../utils/nutrition'

const PACE_OPTIONS = [
  {
    id: 'maintien',
    label: 'Maintenir le poids',
    description: 'Équilibre parfait pour rester en forme.',
    goalId: 'maintien',
  },
  {
    id: 'perte_douce',
    label: 'Perdre du poids doucement',
    description: 'Approche durable (approx. 0.25 kg / semaine).',
    goalId: 'perte_poids_douce',
  },
  {
    id: 'perte_active',
    label: 'Perdre du poids activement',
    description: 'Objectif soutenu (approx. 0.5 kg / semaine).',
    goalId: 'perte_poids',
  },
  {
    id: 'prise_muscle',
    label: 'Prendre du muscle',
    description: 'Surplus contrôlé pour la masse musculaire.',
    goalId: 'prise_muscle',
  },
  {
    id: 'prise_poids',
    label: 'Prendre du poids',
    description: 'Surplus calorique pour la prise de masse.',
    goalId: 'prise_poids',
  },
]

export default function MonObjectif() {
  const navigate = useNavigate()
  const { user, updateUser, userNeeds } = useApp()

  // Derive initial pace from user goal (DB uses snake_case goal id)
  const initialPace = PACE_OPTIONS.find(p => p.goalId === user?.goal) || PACE_OPTIONS[0]

  const [targetWeight, setTargetWeight] = useState(user?.target_weight ?? '')
  const [customCalories, setCustomCalories] = useState(user?.custom_calories ?? '')
  const [selectedPace, setSelectedPace] = useState(initialPace.id)

  // Computed suggestion from selected pace
  const selectedPaceObj = PACE_OPTIONS.find(p => p.id === selectedPace)
  const suggestedCalories = selectedPaceObj
    ? calcUserNeeds({
        gender:        user?.gender,
        weight:        user?.weight,
        height:        user?.height,
        age:           user?.age,
        jobActivity:   user?.job_activity,
        sportActivity: user?.sport_activity,
        metabolism:    user?.metabolism,
        activityLevel: user?.activity_level, // fallback legacy
        goal:          selectedPaceObj.goalId,
      })?.dailyCalories
    : null

  const handleSave = () => {
    const paceGoalId = selectedPaceObj?.goalId || user?.goal
    updateUser({
      goal:          paceGoalId,
      targetWeight:  targetWeight !== '' ? parseFloat(targetWeight) : undefined,
      customCalories: customCalories !== '' ? parseInt(customCalories, 10) : undefined,
    })
    navigate('/profil')
  }

  return (
    <div className="min-h-screen bg-surface pb-32">
      {/* Header */}
      <header className="w-full top-0 sticky z-40 bg-surface">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/profil')}
              className="active:scale-95 duration-150 hover:opacity-80 transition-opacity text-primary"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-headline font-bold tracking-tight text-2xl text-primary">
              Mon objectif
            </h1>
          </div>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-8 space-y-8">
        {/* Hero Section */}
        <section className="relative h-44 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container" />
          <div className="absolute inset-0 flex items-end p-6">
            <div className="text-white">
              <h2 className="font-headline text-2xl font-extrabold mb-1">Tracez votre chemin</h2>
              <p className="text-sm opacity-90 font-medium">
                Définissez des cibles réalistes pour une santé durable.
              </p>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute top-4 right-16 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        </section>

        {/* Numeric Targets */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Target Weight */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)]">
            <label className="block font-label text-sm font-semibold text-on-surface-variant mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">monitor_weight</span>
              Poids cible
            </label>
            <div className="flex items-end gap-2">
              <input
                type="number"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder={user?.weight ?? '70'}
                className="w-full text-3xl font-headline font-bold bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all px-4 py-3 placeholder:text-surface-dim text-on-surface outline-none"
              />
              <span className="text-on-surface-variant font-bold mb-3 tracking-wider">kg</span>
            </div>
          </div>

          {/* Daily Calories */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)]">
            <label className="block font-label text-sm font-semibold text-on-surface-variant mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">local_fire_department</span>
              Objectif calorique quotidien
            </label>
            <div className="flex items-end gap-2">
              <input
                type="number"
                value={customCalories}
                onChange={(e) => setCustomCalories(e.target.value)}
                placeholder={suggestedCalories ?? userNeeds?.dailyCalories ?? '2000'}
                className="w-full text-3xl font-headline font-bold bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all px-4 py-3 placeholder:text-surface-dim text-on-surface outline-none"
              />
              <span className="text-on-surface-variant font-bold mb-3 tracking-wider">kcal</span>
            </div>
            {suggestedCalories && customCalories === '' && (
              <p className="text-xs text-on-surface-variant mt-2">
                Suggestion : <strong className="text-primary">{suggestedCalories} kcal</strong>
              </p>
            )}
          </div>
        </div>

        {/* Pace Selection */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)] space-y-5">
          <h3 className="font-label text-sm font-semibold text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-xl">speed</span>
            Rythme souhaité
          </h3>
          <div className="space-y-3">
            {PACE_OPTIONS.map((option) => {
              const isSelected = selectedPace === option.id
              return (
                <label
                  key={option.id}
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-outline-variant/10 hover:border-primary/20 bg-surface-container-low/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="pace"
                    checked={isSelected}
                    onChange={() => setSelectedPace(option.id)}
                    className="w-5 h-5 text-primary border-outline focus:ring-primary focus:ring-offset-0 accent-primary"
                  />
                  <div className="ml-4">
                    <span className="block font-semibold text-on-surface">{option.label}</span>
                    <span className="text-xs text-on-surface-variant">{option.description}</span>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2 pb-8">
          <button
            onClick={handleSave}
            className="w-full bg-primary text-on-primary font-headline font-bold py-5 rounded-full shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined">check_circle</span>
            Enregistrer mon objectif
          </button>
          <p className="text-center text-xs text-on-surface-variant mt-4 px-10 leading-relaxed">
            Ces objectifs peuvent être ajustés à tout moment. Nous recommandons de consulter
            un professionnel de santé pour des changements importants.
          </p>
        </div>
      </main>
    </div>
  )
}
