import { useState } from 'react'
import { useApp } from '../contexts/AppContext'

export default function Login() {
  const { login, register } = useApp()
  const [mode, setMode]         = useState('login') // 'login' | 'register'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [name, setName]         = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  const switchMode = (next) => {
    setMode(next)
    setError(null)
    setConfirm('')
  }

  const validate = () => {
    if (!email.trim()) return 'Veuillez saisir votre adresse e-mail.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return 'Adresse e-mail invalide.'
    if (!password) return 'Veuillez saisir votre mot de passe.'
    if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.'
    if (mode === 'register' && password !== confirm)
      return 'Les mots de passe ne correspondent pas.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email.trim(), password)
      } else {
        await register(email.trim(), password, name.trim() || undefined)
      }
    } catch (err) {
      const msg = err.message || 'Une erreur est survenue.'
      // 409 = email already taken — offer to switch to login
      if (msg.includes('déjà utilisé')) {
        setError('__409__')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      {/* Logo / Brand */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
          <span className="material-symbols-outlined text-white" style={{ fontSize: '2rem' }}>nutrition</span>
        </div>
        <h1 className="font-headline font-extrabold text-3xl tracking-tight text-on-surface">Mealytics</h1>
        <p className="text-on-surface-variant text-sm font-medium mt-1">Votre journal nutritionnel</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-[0_32px_64px_-12px_rgba(25,28,29,0.08)] p-8">
        {/* Tab switcher */}
        <div className="flex rounded-xl bg-surface-container-low p-1 mb-8">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'login'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant'
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'register'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant'
            }`}
          >
            Créer un compte
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Prénom</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex : Léa"
                className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-2">Adresse e-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.fr"
              autoComplete="email"
              className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            {mode === 'register' && (
              <p className="text-xs text-on-surface-variant mt-1.5 ml-1">Minimum 6 caractères</p>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          )}

          {/* Error block */}
          {error && error !== '__409__' && (
            <div className="bg-secondary/10 text-secondary rounded-xl px-4 py-3 text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Special 409 block — email already taken */}
          {error === '__409__' && (
            <div className="bg-secondary/10 rounded-xl px-4 py-3 space-y-2">
              <p className="text-secondary text-sm font-semibold">
                Cette adresse e-mail est déjà associée à un compte.
              </p>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-primary text-sm font-bold underline underline-offset-2"
              >
                Se connecter à la place →
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Chargement…'
              : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>
      </div>

      <p className="mt-8 text-xs text-on-surface-variant text-center max-w-xs">
        Vos données sont stockées en toute sécurité sur nos serveurs.
      </p>
    </div>
  )
}
