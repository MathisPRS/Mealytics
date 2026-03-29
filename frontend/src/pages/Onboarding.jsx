import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { JOB_ACTIVITY_LEVELS, SPORT_ACTIVITY_LEVELS, METABOLISM_TYPES, GOALS, calcUserNeeds } from '../utils/nutrition'

const STEPS = ['genre', 'poids', 'taille', 'age', 'job_activity', 'sport_activity', 'metabolism', 'objectif', 'resume']

const MEAL_EMOJIS = ['🍎', '🥑', '🥗', '💪', '⚖️']

export default function Onboarding() {
  const { completeOnboarding } = useApp()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    gender: '',
    weight: '',
    height: '',
    age: '',
    jobActivity: '',
    sportActivity: '',
    metabolism: '',
    goal: '',
  })

  const current = STEPS[step]
  const progress = ((step) / (STEPS.length - 1)) * 100

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const canNext = () => {
    if (current === 'genre') return !!form.gender
    if (current === 'poids') return form.weight > 0
    if (current === 'taille') return form.height > 0
    if (current === 'age') return form.age > 0
    if (current === 'job_activity') return !!form.jobActivity
    if (current === 'sport_activity') return !!form.sportActivity
    if (current === 'metabolism') return !!form.metabolism
    if (current === 'objectif') return !!form.goal
    return true
  }

  const [finishing, setFinishing] = useState(false)
  const [finishError, setFinishError] = useState(null)
  const [showCalInfo, setShowCalInfo] = useState(false)

  const handleFinish = async () => {
    setFinishing(true)
    setFinishError(null)
    try {
      await completeOnboarding({
        gender:        form.gender,
        weight:        parseFloat(form.weight),
        height:        parseFloat(form.height),
        age:           parseInt(form.age),
        job_activity:  form.jobActivity,
        sport_activity: form.sportActivity,
        metabolism:    form.metabolism,
        goal:          form.goal,
        onboarded:     true,
      })
    } catch (err) {
      setFinishError(err.message || 'Erreur lors de la sauvegarde. Réessayez.')
      setFinishing(false)
    }
  }

  const needs = current === 'resume' ? calcUserNeeds({
    gender: form.gender,
    weight: parseFloat(form.weight),
    height: parseFloat(form.height),
    age: parseInt(form.age),
    jobActivity: form.jobActivity,
    sportActivity: form.sportActivity,
    metabolism: form.metabolism,
    goal: form.goal,
  }) : null

  const goalLabel = GOALS.find(g => g.id === form.goal)?.label || ''
  const jobLabel = JOB_ACTIVITY_LEVELS.find(j => j.id === form.jobActivity)?.label || ''
  const sportLabel = SPORT_ACTIVITY_LEVELS.find(s => s.id === form.sportActivity)?.label || ''
  const metaLabel = METABOLISM_TYPES.find(m => m.id === form.metabolism)?.label || ''

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body text-on-surface antialiased">
      {/* Progress bar */}
      {step > 0 && step < STEPS.length - 1 && (
        <div className="fixed top-0 left-0 w-full h-1 bg-surface-container-high z-50">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Back button */}
      {step > 0 && step < STEPS.length - 1 && (
        <button
          onClick={() => setStep(s => s - 1)}
          className="fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </button>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-md mx-auto w-full">

        {/* WELCOME */}
        {current === 'genre' && step === 0 && (
          <div className="w-full space-y-10 text-center">
            <div className="space-y-3">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-4xl">
                🥗
              </div>
              <h1 className="font-headline font-extrabold text-3xl tracking-tight text-on-surface">
                Bienvenue sur<br /><span className="text-primary">Mealytics</span>
              </h1>
              <p className="text-outline font-medium text-base">
                Votre journal nutritionnel intelligent. Commençons par quelques questions.
              </p>
            </div>
            <div className="space-y-3">
              <p className="font-headline font-bold text-lg text-on-surface">Vous êtes ?</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'homme', label: 'Homme', icon: '👨' },
                  { id: 'femme', label: 'Femme', icon: '👩' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => set('gender', opt.id)}
                    className={`p-6 rounded-2xl flex flex-col items-center gap-3 transition-all border-2 ${
                      form.gender === opt.id
                        ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20'
                        : 'bg-surface-container-lowest border-transparent hover:border-primary/30'
                    }`}
                  >
                    <span className="text-3xl">{opt.icon}</span>
                    <span className="font-headline font-bold">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* POIDS */}
        {current === 'poids' && (
          <div className="w-full space-y-8 text-center">
            <div className="space-y-2">
              <div className="text-5xl mb-4">⚖️</div>
              <h2 className="font-headline font-extrabold text-3xl tracking-tight">Votre poids actuel</h2>
              <p className="text-outline text-sm">En kilogrammes</p>
            </div>
            <div className="flex items-end justify-center gap-3">
              <input
                type="number"
                value={form.weight}
                onChange={e => set('weight', e.target.value)}
                placeholder="70"
                min="30" max="300"
                className="w-40 text-center text-5xl font-headline font-extrabold bg-surface-container-low border-none rounded-2xl py-6 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-surface-dim outline-none"
              />
              <span className="text-2xl font-bold text-outline mb-4">kg</span>
            </div>
          </div>
        )}

        {/* TAILLE */}
        {current === 'taille' && (
          <div className="w-full space-y-8 text-center">
            <div className="space-y-2">
              <div className="text-5xl mb-4">📏</div>
              <h2 className="font-headline font-extrabold text-3xl tracking-tight">Votre taille</h2>
              <p className="text-outline text-sm">En centimètres</p>
            </div>
            <div className="flex items-end justify-center gap-3">
              <input
                type="number"
                value={form.height}
                onChange={e => set('height', e.target.value)}
                placeholder="170"
                min="100" max="250"
                className="w-40 text-center text-5xl font-headline font-extrabold bg-surface-container-low border-none rounded-2xl py-6 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-surface-dim outline-none"
              />
              <span className="text-2xl font-bold text-outline mb-4">cm</span>
            </div>
          </div>
        )}

        {/* AGE */}
        {current === 'age' && (
          <div className="w-full space-y-8 text-center">
            <div className="space-y-2">
              <div className="text-5xl mb-4">🎂</div>
              <h2 className="font-headline font-extrabold text-3xl tracking-tight">Votre âge</h2>
              <p className="text-outline text-sm">En années</p>
            </div>
            <div className="flex items-end justify-center gap-3">
              <input
                type="number"
                value={form.age}
                onChange={e => set('age', e.target.value)}
                placeholder="25"
                min="10" max="100"
                className="w-40 text-center text-5xl font-headline font-extrabold bg-surface-container-low border-none rounded-2xl py-6 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-surface-dim outline-none"
              />
              <span className="text-2xl font-bold text-outline mb-4">ans</span>
            </div>
          </div>
        )}

        {/* JOB ACTIVITY */}
        {current === 'job_activity' && (
          <div className="w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl mb-4">🪑</div>
              <h2 className="font-headline font-extrabold text-3xl tracking-tight">Votre activité au quotidien</h2>
              <p className="text-outline text-sm">Comment se passe votre journée type ?</p>
            </div>
            <div className="space-y-3">
              {JOB_ACTIVITY_LEVELS.map(act => (
                <button
                  key={act.id}
                  onClick={() => set('jobActivity', act.id)}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border-2 text-left ${
                    form.jobActivity === act.id
                      ? 'bg-primary/5 border-primary'
                      : 'bg-surface-container-lowest border-transparent hover:border-primary/20'
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{act.emoji}</span>
                  <div className="flex-1">
                    <p className="font-headline font-bold text-sm">{act.label}</p>
                    <p className="text-outline text-xs">{act.description}</p>
                  </div>
                  {form.jobActivity === act.id && (
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SPORT ACTIVITY */}
        {current === 'sport_activity' && (
          <div className="w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl mb-4">🏃</div>
              <h2 className="font-headline font-extrabold text-3xl tracking-tight">Votre pratique sportive</h2>
              <p className="text-outline text-sm">Combien de fois par semaine ?</p>
            </div>
            <div className="space-y-3">
              {SPORT_ACTIVITY_LEVELS.map(act => (
                <button
                  key={act.id}
                  onClick={() => set('sportActivity', act.id)}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border-2 text-left ${
                    form.sportActivity === act.id
                      ? 'bg-primary/5 border-primary'
                      : 'bg-surface-container-lowest border-transparent hover:border-primary/20'
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{act.emoji}</span>
                  <div className="flex-1">
                    <p className="font-headline font-bold text-sm">{act.label}</p>
                    <p className="text-outline text-xs">{act.description}</p>
                  </div>
                  {form.sportActivity === act.id && (
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* METABOLISM */}
        {current === 'metabolism' && (
          <div className="w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl mb-4">⚡</div>
              <h2 className="font-headline font-extrabold text-3xl tracking-tight">Votre métabolisme</h2>
              <p className="text-outline text-sm">Comment décririez-vous votre morphologie ?</p>
            </div>
            <div className="space-y-3">
              {METABOLISM_TYPES.map(meta => (
                <button
                  key={meta.id}
                  onClick={() => set('metabolism', meta.id)}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border-2 text-left ${
                    form.metabolism === meta.id
                      ? 'bg-primary/5 border-primary'
                      : 'bg-surface-container-lowest border-transparent hover:border-primary/20'
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{meta.emoji}</span>
                  <div className="flex-1">
                    <p className="font-headline font-bold text-sm">{meta.label}</p>
                    <p className="text-outline text-xs">{meta.description}</p>
                  </div>
                  {form.metabolism === meta.id && (
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* OBJECTIF */}
        {current === 'objectif' && (
          <div className="w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="font-headline font-extrabold text-3xl tracking-tight">Votre objectif</h2>
              <p className="text-outline text-sm">Qu'est-ce qui vous motive ?</p>
            </div>
            <div className="space-y-3">
              {GOALS.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => set('goal', goal.id)}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border-2 text-left ${
                    form.goal === goal.id
                      ? 'bg-primary/5 border-primary'
                      : 'bg-surface-container-lowest border-transparent hover:border-primary/20'
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{goal.emoji}</span>
                  <div className="flex-1">
                    <p className="font-headline font-bold text-sm">{goal.label}</p>
                    <p className="text-outline text-xs">{goal.description}</p>
                  </div>
                  {form.goal === goal.id && (
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RESUME */}
        {current === 'resume' && needs && (
          <div className="w-full space-y-8">
            <div className="text-center space-y-2">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="font-headline font-extrabold text-3xl tracking-tight text-primary">Votre plan est prêt !</h2>
              <p className="text-outline text-sm">Voici vos besoins nutritionnels quotidiens</p>
            </div>

            {/* Big calorie hero */}
            <div className="bg-primary rounded-3xl p-8 text-on-primary text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
              <p className="text-on-primary/70 text-sm font-semibold uppercase tracking-widest mb-2">Objectif calorique</p>
              <div className="flex items-center justify-center gap-2">
                <p className="font-headline font-extrabold text-6xl">{needs.dailyCalories}</p>
                <button
                  onClick={() => setShowCalInfo(v => !v)}
                  className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0 mt-2"
                  aria-label="Comment est calculé cet objectif ?"
                >
                  <span className="material-symbols-outlined text-white text-base">info</span>
                </button>
              </div>
              <p className="text-on-primary/70 font-semibold mt-1">kcal / jour</p>
            </div>

            {/* Info panel */}
            {showCalInfo && (
              <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 space-y-3 text-sm">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <span className="material-symbols-outlined text-base">science</span>
                  Comment est calculé cet objectif ?
                </div>
                <ul className="space-y-2 text-on-surface-variant leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <span><strong className="text-on-surface">BMR</strong> calculé avec la formule <strong className="text-on-surface">Mifflin-St Jeor (1990)</strong> à partir de votre poids, taille, âge et genre.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <span><strong className="text-on-surface">PAL</strong> (niveau d'activité) combinant votre activité journalière et sportive — méthode FAO/WHO/UNU 2001.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <span>Ajustement de <strong className="text-on-surface">±5%</strong> selon votre métabolisme, puis ajustement de l'objectif (déficit ou surplus).</span>
                  </li>
                </ul>
                <p className="text-xs text-on-surface-variant border-t border-outline-variant/20 pt-3">
                  Ces estimations sont des moyennes statistiques. Consultez un professionnel de santé pour un suivi personnalisé.
                </p>
              </div>
            )}

            {/* Macros bento */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Protéines', value: needs.protein, unit: 'g', color: 'text-primary' },
                { label: 'Glucides', value: needs.carbs, unit: 'g', color: 'text-tertiary' },
                { label: 'Lipides', value: needs.fat, unit: 'g', color: 'text-secondary' },
              ].map(m => (
                <div key={m.label} className="bg-surface-container-lowest rounded-2xl p-4 text-center shadow-sm">
                  <p className={`font-headline font-extrabold text-2xl ${m.color}`}>{m.value}{m.unit}</p>
                  <p className="text-outline text-[10px] font-bold uppercase tracking-wider mt-1">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Profile summary */}
            <div className="bg-surface-container-low rounded-2xl p-4 space-y-2">
              {[
                { label: 'Objectif', value: goalLabel },
                { label: 'Activité quotidienne', value: jobLabel },
                { label: 'Sport', value: sportLabel },
                { label: 'Métabolisme', value: metaLabel },
                { label: 'Poids', value: `${form.weight} kg` },
                { label: 'Taille', value: `${form.height} cm` },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-outline text-xs font-semibold uppercase tracking-wider">{row.label}</span>
                  <span className="font-semibold text-sm text-on-surface">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA button */}
        <div className="w-full mt-10">
          {current === 'resume' ? (
            <>
              {finishError && (
                <p className="text-secondary text-sm font-semibold text-center mb-3">{finishError}</p>
              )}
              <button
                onClick={handleFinish}
                disabled={finishing}
                className="w-full bg-primary text-on-primary font-headline font-bold py-5 rounded-full shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">{finishing ? 'hourglass_empty' : 'rocket_launch'}</span>
                {finishing ? 'Sauvegarde…' : 'Commencer mon journal'}
              </button>
            </>
          ) : (
            <button
              onClick={() => canNext() && setStep(s => s + 1)}
              disabled={!canNext()}
              className={`w-full font-headline font-bold py-5 rounded-full transition-all flex items-center justify-center gap-2 ${
                canNext()
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98]'
                  : 'bg-surface-container text-outline cursor-not-allowed'
              }`}
            >
              Continuer
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
