// ── Manual entry form ──────────────────────────────────────────────
import { useState } from 'react'

function ManualEntryForm({ barcode, prefillName, onConfirm, onCancel }) {
  const [name,     setName]     = useState(prefillName || '')
  const [calories, setCalories] = useState('')
  const [protein,  setProtein]  = useState('')
  const [carbs,    setCarbs]    = useState('')
  const [fat,      setFat]      = useState('')

  const valid = name.trim() && parseFloat(calories) >= 0

  const handleSubmit = () => {
    if (!valid) return
    onConfirm({
      id:          `barcode_${barcode || 'manual_' + Date.now()}`,
      name:        name.trim(),
      emoji:       '🛒',
      defaultQty:  100,
      defaultUnit: 'g',
      calories:    parseFloat(calories) || 0,
      protein:     parseFloat(protein)  || 0,
      carbs:       parseFloat(carbs)    || 0,
      fat:         parseFloat(fat)      || 0,
      category:    'Scanné',
      barcode,
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-container">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </button>
        <div>
          <h2 className="font-headline font-bold text-lg">Saisie manuelle</h2>
          {barcode && <p className="text-xs text-outline">Code : {barcode}</p>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <p className="text-sm text-outline">
          Renseigne les informations nutritionnelles <span className="font-semibold text-on-surface">pour 100g</span>.
        </p>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-outline uppercase tracking-wider">Nom du produit *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Yaourt nature Danone"
            className="w-full bg-surface-container-low rounded-2xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Calories (kcal)', key: 'calories', val: calories, set: setCalories, color: 'text-primary', required: true },
            { label: 'Protéines (g)',   key: 'protein',  val: protein,  set: setProtein,  color: 'text-secondary' },
            { label: 'Glucides (g)',    key: 'carbs',    val: carbs,    set: setCarbs,    color: 'text-primary' },
            { label: 'Lipides (g)',     key: 'fat',      val: fat,      set: setFat,      color: 'text-tertiary' },
          ].map(f => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-xs font-bold text-outline uppercase tracking-wider">
                {f.label}{f.required ? ' *' : ''}
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={f.val}
                onChange={e => f.set(e.target.value)}
                placeholder="0"
                className={`w-full bg-surface-container-low rounded-2xl py-3.5 px-4 text-sm font-bold ${f.color} outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-8 pt-3">
        <button
          onClick={handleSubmit}
          disabled={!valid}
          className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-full shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
        >
          Utiliser ce produit
        </button>
      </div>
    </div>
  )
}

// ── Result modal ────────────────────────────────────────────────────
// Props:
//   phase          : 'found' | 'not_found' | 'error' | 'incomplete' | 'manual'
//   product        : object (when phase === 'found')
//   barcode        : string | null
//   errorMessage   : string (when phase === 'error')
//   prefillName    : string (when phase === 'incomplete')
//   onProductFound : (product) => void
//   onRetry        : () => void   — re-triggers the camera
//   onClose        : () => void
export default function BarcodeScannerModal({
  phase: initialPhase,
  product: initialProduct,
  barcode,
  errorMessage,
  prefillName,
  onProductFound,
  onRetry,
  onClose,
}) {
  const [phase,   setPhase]   = useState(initialPhase)
  const [product, setProduct] = useState(initialProduct || null)
  const [prefill, setPrefill] = useState(prefillName || '')

  // ── Manual / not_found / incomplete → form ─────────────────────
  if (phase === 'manual' || phase === 'not_found' || phase === 'incomplete') {
    return (
      <div className="fixed inset-0 z-[70] flex flex-col bg-surface">
        <ManualEntryForm
          barcode={barcode}
          prefillName={prefill}
          onConfirm={prod => onProductFound(prod)}
          onCancel={onClose}
        />
      </div>
    )
  }

  // ── Found ───────────────────────────────────────────────────────
  if (phase === 'found' && product) {
    return (
      <div className="fixed inset-0 z-[70] flex flex-col bg-surface">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-container">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <h2 className="font-headline font-bold text-lg">Produit trouvé</h2>
        </div>

        <div className="flex-1 px-5 py-6 space-y-5 overflow-y-auto">
          <div className="bg-surface-container-low rounded-2xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-3xl flex-shrink-0">
              🛒
            </div>
            <div className="min-w-0">
              <h3 className="font-headline font-bold text-base text-on-surface leading-tight">{product.name}</h3>
              <p className="text-xs text-outline mt-0.5">Pour 100g · Code {barcode}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Kcal',  value: product.calories,      color: 'text-primary'   },
              { label: 'Prot.', value: `${product.protein}g`, color: 'text-secondary' },
              { label: 'Gluc.', value: `${product.carbs}g`,   color: 'text-primary'   },
              { label: 'Lip.',  value: `${product.fat}g`,     color: 'text-tertiary'  },
            ].map(n => (
              <div key={n.label} className="bg-surface-container-low rounded-xl p-3 text-center">
                <p className={`font-headline font-bold text-sm ${n.color}`}>{n.value}</p>
                <p className="text-[10px] text-outline font-bold uppercase mt-0.5">{n.label}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-outline text-center">
            Source : Open Food Facts · Valeurs pour 100g
          </p>
        </div>

        <div className="px-5 pb-8 pt-3 space-y-3">
          <button
            onClick={() => onProductFound(product)}
            className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-full shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
          >
            Ajouter ce produit
          </button>
          <button
            onClick={() => { setPrefill(product.name); setPhase('manual') }}
            className="w-full bg-surface-container text-on-surface font-headline font-semibold py-3.5 rounded-full active:scale-[0.98] transition-all"
          >
            Modifier les valeurs
          </button>
        </div>
      </div>
    )
  }

  // ── Error ───────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="fixed inset-0 z-[70] flex flex-col bg-surface">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-container">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <h2 className="font-headline font-bold text-lg">Erreur</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-400 text-3xl">error</span>
          </div>
          <div className="space-y-2">
            <p className="font-headline font-bold text-on-surface">Une erreur est survenue</p>
            <p className="text-sm text-outline">{errorMessage}</p>
          </div>
        </div>

        <div className="px-5 pb-8 pt-3 space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-full shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
          >
            Réessayer
          </button>
          <button
            onClick={() => setPhase('manual')}
            className="w-full bg-surface-container text-on-surface font-headline font-semibold py-3.5 rounded-full active:scale-[0.98] transition-all"
          >
            Saisir manuellement
          </button>
        </div>
      </div>
    )
  }

  return null
}
