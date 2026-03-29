import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { JOB_ACTIVITY_LEVELS, SPORT_ACTIVITY_LEVELS, METABOLISM_TYPES } from '../utils/nutrition'

export default function MesActivites() {
  const navigate = useNavigate()
  const { user, updateUser } = useApp()

  const [jobActivity, setJobActivity]     = useState(user?.job_activity || '')
  const [sportActivity, setSportActivity] = useState(user?.sport_activity || '')
  const [metabolism, setMetabolism]       = useState(user?.metabolism || '')
  const [saving, setSaving]               = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateUser({ job_activity: jobActivity, sport_activity: sportActivity, metabolism })
      navigate('/profil')
    } finally {
      setSaving(false)
    }
  }

  const SelectorCard = ({ options, value, onChange }) => (
    <div className="space-y-3">
      {options.map(opt => {
        const isSelected = value === opt.id
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border-2 text-left ${
              isSelected
                ? 'bg-primary/5 border-primary'
                : 'bg-surface-container-lowest border-transparent hover:border-primary/20'
            }`}
          >
            <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
            <div className="flex-1">
              <p className="font-headline font-bold text-sm text-on-surface">{opt.label}</p>
              <p className="text-outline text-xs">{opt.description}</p>
            </div>
            {isSelected && (
              <span className="material-symbols-outlined text-primary">check_circle</span>
            )}
          </button>
        )
      })}
    </div>
  )

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
              Mes activités
            </h1>
          </div>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-4 space-y-8">

        {/* Hero */}
        <section className="relative h-36 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container" />
          <div className="absolute inset-0 flex items-end p-6">
            <div className="text-white">
              <h2 className="font-headline text-xl font-extrabold mb-1">Affinez votre profil</h2>
              <p className="text-sm opacity-90 font-medium">
                Un calcul précis pour des objectifs réels.
              </p>
            </div>
          </div>
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </section>

        {/* Job Activity */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)] space-y-4">
          <h3 className="font-label text-sm font-semibold text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">work</span>
            Activité au quotidien
          </h3>
          <SelectorCard
            options={JOB_ACTIVITY_LEVELS}
            value={jobActivity}
            onChange={setJobActivity}
          />
        </section>

        {/* Sport Activity */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)] space-y-4">
          <h3 className="font-label text-sm font-semibold text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-xl">sports</span>
            Pratique sportive
          </h3>
          <SelectorCard
            options={SPORT_ACTIVITY_LEVELS}
            value={sportActivity}
            onChange={setSportActivity}
          />
        </section>

        {/* Metabolism */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_32px_64px_-12px_rgba(25,28,29,0.06)] space-y-4">
          <h3 className="font-label text-sm font-semibold text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">bolt</span>
            Métabolisme
          </h3>
          <SelectorCard
            options={METABOLISM_TYPES}
            value={metabolism}
            onChange={setMetabolism}
          />
        </section>

        {/* Save */}
        <div className="pt-2 pb-8">
          <button
            onClick={handleSave}
            disabled={saving || !jobActivity || !sportActivity || !metabolism}
            className="w-full bg-primary text-on-primary font-headline font-bold py-5 rounded-full shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">{saving ? 'hourglass_empty' : 'check_circle'}</span>
            {saving ? 'Sauvegarde…' : 'Enregistrer'}
          </button>
        </div>
      </main>
    </div>
  )
}
