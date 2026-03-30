import { useLocation, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/journal',  label: 'Journal',  icon: 'menu_book'       },
  { path: '/recettes', label: 'Recettes', icon: 'restaurant_menu' },
  { path: '/poids',    label: 'Poids',    icon: 'monitor_weight'  },
  { path: '/profil',   label: 'Profil',   icon: 'person'          },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  // Hide bottom nav on sub-pages and auth/onboarding screens
  const hideOn = ['/recettes/creer', '/recettes/modifier', '/profil/reglages', '/profil/objectif', '/profil/activites', '/journal/historique', '/login', '/onboarding']
  if (hideOn.some(p => location.pathname.startsWith(p))) return null

  const activeTab = NAV_ITEMS.find(item => location.pathname.startsWith(item.path))?.path

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-xl shadow-[0px_-4px_32px_rgba(25,28,29,0.06)] rounded-t-[1.5rem] border-t border-slate-100/60">
      {NAV_ITEMS.map(item => {
        const isActive = activeTab === item.path
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-all duration-300 active:scale-90 ${
              isActive
                ? 'bg-primary/10 text-primary scale-110'
                : 'text-slate-400 hover:text-primary'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className="font-label font-semibold text-[11px] mt-0.5">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
