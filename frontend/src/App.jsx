import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './contexts/AppContext'
import BottomNav from './components/BottomNav'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Journal from './pages/Journal'
import Recettes from './pages/Recettes'
import CreateRecette from './pages/CreateRecette'
import Poids from './pages/Poids'
import Profil from './pages/Profil'
import MesReglages from './pages/MesReglages'
import MonObjectif from './pages/MonObjectif'
import MesActivites from './pages/MesActivites'
import JournalHistorique from './pages/JournalHistorique'

/**
 * ProtectedRoute — redirects to /login if no token.
 * Once logged in, redirects to /onboarding if user hasn't completed onboarding.
 */
function ProtectedRoute({ children }) {
  const { token, authLoading, user } = useApp()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined text-primary animate-spin" style={{ fontSize: '2.5rem' }}>
          refresh
        </span>
      </div>
    )
  }

  if (!token) return <Navigate to="/login" replace />
  if (user && !user.onboarded) return <Navigate to="/onboarding" replace />

  return children
}

export default function App() {
  const { token, authLoading, user } = useApp()

  // Show nothing while verifying token
  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined text-primary animate-spin" style={{ fontSize: '2.5rem' }}>
          refresh
        </span>
      </div>
    )
  }

  return (
    <div className="bg-surface min-h-screen font-body text-on-surface antialiased">
      <Routes>
        {/* Public */}
        <Route path="/login" element={
          !token
            ? <Login />
            : user?.onboarded
              ? <Navigate to="/journal" replace />
              : <Navigate to="/onboarding" replace />
        } />

        {/* Onboarding — requires token, but not yet onboarded */}
        <Route path="/onboarding" element={
          !token
            ? <Navigate to="/login" replace />
            : user?.onboarded
              ? <Navigate to="/journal" replace />
              : <Onboarding />
        } />

        {/* Protected app routes */}
        <Route path="/" element={<ProtectedRoute><Navigate to="/journal" replace /></ProtectedRoute>} />
        <Route path="/journal"              element={<ProtectedRoute><Journal /></ProtectedRoute>} />
        <Route path="/journal/historique"   element={<ProtectedRoute><JournalHistorique /></ProtectedRoute>} />
        <Route path="/recettes"             element={<ProtectedRoute><Recettes /></ProtectedRoute>} />
        <Route path="/recettes/creer"       element={<ProtectedRoute><CreateRecette /></ProtectedRoute>} />
        <Route path="/recettes/modifier/:id" element={<ProtectedRoute><CreateRecette /></ProtectedRoute>} />
        <Route path="/poids"                element={<ProtectedRoute><Poids /></ProtectedRoute>} />
        <Route path="/profil"               element={<ProtectedRoute><Profil /></ProtectedRoute>} />
        <Route path="/profil/reglages"      element={<ProtectedRoute><MesReglages /></ProtectedRoute>} />
        <Route path="/profil/objectif"      element={<ProtectedRoute><MonObjectif /></ProtectedRoute>} />
        <Route path="/profil/activites"     element={<ProtectedRoute><MesActivites /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={token ? '/journal' : '/login'} replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}
