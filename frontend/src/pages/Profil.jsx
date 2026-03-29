import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, todayKey } from '../contexts/AppContext'
import { GOALS } from '../utils/nutrition'

export default function Profil() {
  const navigate = useNavigate()
  const { user, logout, weightLog, journal, userNeeds } = useApp()
  const [showCalInfo, setShowCalInfo] = useState(false)

  // --- Computed stats ---
  // Calories consumed today only (from cache for today's date)
  const todayJournal = journal[todayKey()] || {}
  const todayCalories = Math.round(
    [
      ...(todayJournal.petit_dejeuner || []),
      ...(todayJournal.dejeuner || []),
      ...(todayJournal.diner || []),
      ...(todayJournal.collation || []),
    ].reduce((s, e) => s + (parseFloat(e.calories) || 0), 0)
  )

  // Weight delta (latest vs initial)
  const startingWeight = user?.weight || null
  const latestWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].weight : startingWeight
  const weightDelta = startingWeight && latestWeight ? (latestWeight - startingWeight).toFixed(1) : null

  // Goal label — DB stores snake_case goal id
  const goalObj = GOALS.find(g => g.id === user?.goal)

  // Member since
  const memberSince = user?.member_since || new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-surface pb-32">
      {/* Header */}
      <header className="w-full top-0 sticky z-40 bg-surface flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">person</span>
          <h1 className="font-headline font-extrabold tracking-tight text-2xl text-on-surface">Profil</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-4">
        {/* User Identity */}
        <section className="flex flex-col items-center mb-10">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center border-4 border-surface-container-lowest shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)]">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '3.5rem' }}>person</span>
            </div>
          </div>
          <h2 className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">
            {user?.name || 'Utilisateur'}
          </h2>
          <p className="text-on-surface-variant font-medium text-sm">Membre depuis {memberSince}</p>
          {userNeeds && (
            <span className="mt-2 text-xs font-bold text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
              {goalObj?.label || 'Objectif défini'}
            </span>
          )}
        </section>

        {/* Bento Grid Stats */}
        <section className="grid grid-cols-2 gap-4 mb-10">
          {/* Calories consumed */}
          <div className="col-span-1 bg-surface-container-lowest rounded-2xl p-5 shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)]">
            <div className="mb-4">
              <span className="material-symbols-outlined text-secondary">local_fire_department</span>
            </div>
            <div className="text-2xl font-headline font-bold text-on-surface">
              {todayCalories >= 1000
                ? `${(todayCalories / 1000).toFixed(1)}k`
                : todayCalories}
            </div>
            <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Kcal aujourd'hui</div>
          </div>

          {/* Water drunk — total across journal water log not cached here, show weight entry count instead */}
          <div className="col-span-1 bg-surface-container-lowest rounded-2xl p-5 shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)]">
            <div className="mb-4">
              <span className="material-symbols-outlined text-tertiary">water_drop</span>
            </div>
            <div className="text-2xl font-headline font-bold text-on-surface">{weightLog.length}</div>
            <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Pesées</div>
          </div>

          {/* Weight delta — full width */}
          <div className="col-span-2 bg-primary-container text-on-primary-container rounded-2xl p-5 shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)]">
            <div className="mb-4">
              <span className="material-symbols-outlined">
                {weightDelta !== null && parseFloat(weightDelta) < 0 ? 'trending_down' : 'trending_up'}
              </span>
            </div>
            <div className="text-2xl font-headline font-bold">
              {weightDelta !== null
                ? `${parseFloat(weightDelta) > 0 ? '+' : ''}${weightDelta} kg`
                : '—'}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider opacity-90">
              {weightDelta !== null
                ? parseFloat(weightDelta) < 0 ? 'Poids perdu' : 'Poids pris'
                : 'Évolution du poids'}
            </div>
          </div>
        </section>

        {/* User Stats row */}
        {user && (
          <>
          <section className="grid grid-cols-3 gap-3 mb-10">
            <div className="bg-surface-container-low rounded-2xl p-4 text-center">
              <div className="text-xl font-headline font-bold text-on-surface">{latestWeight ?? '—'}</div>
              <div className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mt-1">Poids (kg)</div>
            </div>
            <div className="bg-surface-container-low rounded-2xl p-4 text-center">
              <div className="text-xl font-headline font-bold text-on-surface">{user.height ?? '—'}</div>
              <div className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mt-1">Taille (cm)</div>
            </div>
            <div className="bg-surface-container-low rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <div className="text-xl font-headline font-bold text-on-surface">{userNeeds?.dailyCalories ?? '—'}</div>
                {userNeeds?.dailyCalories && (
                  <button
                    onClick={() => setShowCalInfo(v => !v)}
                    className="text-outline hover:text-primary transition-colors"
                    aria-label="Détails du calcul calorique"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>info</span>
                  </button>
                )}
              </div>
              <div className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mt-1">Kcal/jour</div>
            </div>
          </section>

          {/* Cal info panel */}
          {showCalInfo && userNeeds && (
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 space-y-3 text-sm mb-6">
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
          </>
        )}

        {/* Settings List */}
        <section className="space-y-3 mb-12">
          <h3 className="font-headline font-bold text-lg px-2 mb-4">Préférences</h3>

          <button
            onClick={() => navigate('/profil/objectif')}
            className="group w-full flex items-center justify-between p-4 bg-surface-container-low rounded-2xl hover:bg-surface-container transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">track_changes</span>
              </div>
              <div className="text-left">
                <span className="font-semibold text-on-surface block">Mon objectif</span>
                <span className="text-xs text-on-surface-variant">{goalObj?.label || 'Définir un objectif'}</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
          </button>

          <button
            onClick={() => navigate('/profil/activites')}
            className="group w-full flex items-center justify-between p-4 bg-surface-container-low rounded-2xl hover:bg-surface-container transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">directions_run</span>
              </div>
              <div className="text-left">
                <span className="font-semibold text-on-surface block">Mes activités</span>
                <span className="text-xs text-on-surface-variant">Travail, sport & métabolisme</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
          </button>

          <button
            onClick={() => navigate('/profil/reglages')}
            className="group w-full flex items-center justify-between p-4 bg-surface-container-low rounded-2xl hover:bg-surface-container transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">settings</span>
              </div>
              <div className="text-left">
                <span className="font-semibold text-on-surface block">Mes réglages</span>
                <span className="text-xs text-on-surface-variant">Compte &amp; notifications</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
          </button>

          <div className="group flex items-center justify-between p-4 bg-surface-container-low rounded-2xl opacity-60">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">health_and_safety</span>
              </div>
              <div className="text-left">
                <span className="font-semibold text-on-surface block">Connecter Apple Health</span>
                <span className="text-xs text-on-surface-variant">Bientôt disponible</span>
              </div>
            </div>
            <span className="text-xs font-bold text-on-surface-variant uppercase bg-surface-container px-2 py-0.5 rounded-full">Bientôt</span>
          </div>
        </section>

        {/* Logout */}
        <div className="flex justify-center pb-4">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-secondary font-bold px-8 py-3 rounded-full hover:bg-secondary/10 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            Déconnexion
          </button>
        </div>
      </main>
    </div>
  )
}
