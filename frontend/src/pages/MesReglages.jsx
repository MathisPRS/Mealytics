import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'

export default function MesReglages() {
  const navigate = useNavigate()
  const { user, updateUser } = useApp()

  const [mealReminders, setMealReminders] = useState(
    user?.notifications?.mealReminders ?? true
  )
  const [nutritionTips, setNutritionTips] = useState(
    user?.notifications?.nutritionTips ?? false
  )

  // DB returns member_since (snake_case)
  const memberSince = user?.member_since || new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const handleSaveNotifications = (key, value) => {
    updateUser({
      notifications: {
        ...(user?.notifications || {}),
        [key]: value,
      },
    })
  }

  return (
    <div className="min-h-screen bg-surface pb-32">
      {/* Header */}
      <nav className="w-full top-0 sticky bg-surface z-50">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/profil')}
              className="text-primary hover:opacity-80 transition-opacity active:scale-95"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-headline font-bold tracking-tight text-2xl text-primary">
              Mes réglages
            </h1>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 mt-8 space-y-10">
        {/* Profile Header */}
        <section className="flex items-center gap-6 p-2">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)] shrink-0">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '2.5rem' }}>person</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-xl tracking-tight text-on-surface">
              {user?.name || 'Utilisateur'}
            </h2>
            <p className="font-body text-on-surface-variant text-sm">
              Membre depuis {memberSince}
            </p>
          </div>
        </section>

        {/* Account & Security */}
        <section className="space-y-4">
          <h3 className="font-headline font-bold text-xs uppercase tracking-[0.15em] text-outline px-2">
            Compte &amp; Sécurité
          </h3>
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)]">
            {/* Email */}
            <div className="flex items-center justify-between px-6 py-5 hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <p className="font-body font-semibold text-on-surface">Adresse e-mail</p>
                  <p className="font-body text-sm text-on-surface-variant">
                    {user?.email || 'Non renseignée'}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </div>

            {/* Divider */}
            <div className="mx-6 h-px bg-surface-container" />

            {/* Password */}
            <div className="flex items-center justify-between px-6 py-5 hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <div>
                  <p className="font-body font-semibold text-on-surface">Changer le mot de passe</p>
                  <p className="font-body text-sm text-on-surface-variant">Fonctionnalité à venir</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </div>
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="space-y-4">
          <h3 className="font-headline font-bold text-xs uppercase tracking-[0.15em] text-outline px-2">
            Préférences de notifications
          </h3>
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)]">
            {/* Meal Reminders */}
            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined">restaurant</span>
                </div>
                <div>
                  <p className="font-body font-semibold text-on-surface">Rappels de repas</p>
                  <p className="font-body text-sm text-on-surface-variant">Petit-déjeuner, déjeuner et dîner</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={mealReminders}
                  onChange={(e) => {
                    setMealReminders(e.target.checked)
                    handleSaveNotifications('mealReminders', e.target.checked)
                  }}
                />
                <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            {/* Divider */}
            <div className="mx-6 h-px bg-surface-container" />

            {/* Nutrition Tips */}
            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined">lightbulb</span>
                </div>
                <div>
                  <p className="font-body font-semibold text-on-surface">Conseils nutritionnels</p>
                  <p className="font-body text-sm text-on-surface-variant">Astuces quotidiennes et articles</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={nutritionTips}
                  onChange={(e) => {
                    setNutritionTips(e.target.checked)
                    handleSaveNotifications('nutritionTips', e.target.checked)
                  }}
                />
                <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          </div>
        </section>

        {/* Premium Banner */}
        <section className="p-6 bg-primary-container rounded-2xl text-on-primary-container relative overflow-hidden shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)]">
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h4 className="font-headline font-bold text-lg">Mealytics Premium</h4>
              <p className="font-body text-sm opacity-90">Fonctionnalités avancées &amp; analyses</p>
            </div>
            <button className="bg-white text-primary font-body font-bold text-sm px-6 py-2.5 rounded-full hover:opacity-90 active:scale-95 transition-all">
              Découvrir
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        </section>

        {/* App version */}
        <p className="text-center text-xs text-on-surface-variant pb-4">
          Mealytics v1.0 — Données synchronisées
        </p>
      </main>
    </div>
  )
}
