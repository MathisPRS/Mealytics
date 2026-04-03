import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

// ── Fetch product from Open Food Facts ─────────────────────────────
async function fetchProductByBarcode(barcode) {
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
    { signal: AbortSignal.timeout(10000) }
  )
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (data.status !== 1) return null

  const p = data.product
  const n = p.nutriments || {}

  const name = p.product_name_fr || p.product_name || p.abbreviated_product_name || ''
  if (!name) return null

  const calories = parseFloat(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0)
  const protein  = parseFloat(n['proteins_100g']    ?? n['proteins']    ?? 0)
  const carbs    = parseFloat(n['carbohydrates_100g']?? n['carbohydrates']?? 0)
  const fat      = parseFloat(n['fat_100g']          ?? n['fat']          ?? 0)

  return {
    id:          `barcode_${barcode}`,
    name,
    emoji:       '🛒',
    defaultQty:  100,
    defaultUnit: 'g',
    calories:    Math.round(calories * 10) / 10,
    protein:     Math.round(protein  * 10) / 10,
    carbs:       Math.round(carbs    * 10) / 10,
    fat:         Math.round(fat      * 10) / 10,
    category:    'Scanné',
    barcode,
    incomplete:  calories === 0 && protein === 0 && carbs === 0 && fat === 0,
  }
}

// ── Manual entry form ──────────────────────────────────────────────
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

// ── Main scanner modal ──────────────────────────────────────────────
const SCANNER_ID = 'html5qr-scanner-region'

export default function BarcodeScannerModal({ onProductFound, onClose }) {
  // scanning | loading | found | not_found | error | incomplete | manual
  const [phase,    setPhase]    = useState('scanning')
  const [message,  setMessage]  = useState('')
  const [product,  setProduct]  = useState(null)
  const [barcode,  setBarcode]  = useState(null)
  const [prefill,  setPrefill]  = useState('')
  const [debugLog, setDebugLog] = useState(['Initialisation...'])

  const scannerRef = useRef(null)
  const stoppedRef = useRef(false)

  const addLog = (msg) => {
    console.log('[Scanner]', msg)
    setDebugLog(prev => [...prev.slice(-6), msg])
  }

  useEffect(() => {
    if (phase !== 'scanning') return

    stoppedRef.current = false
    addLog('Création du scanner html5-qrcode...')

    const scanner = new Html5Qrcode(SCANNER_ID, { verbose: false })
    scannerRef.current = scanner

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 150 },
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
      ],
      rememberLastUsedCamera: false,
      showTorchButtonIfSupported: false,
    }

    addLog('Demande accès caméra (facingMode: environment)...')

    scanner.start(
      { facingMode: 'environment' },
      config,
      async (decodedText) => {
        if (stoppedRef.current) return
        stoppedRef.current = true

        addLog(`Code détecté : ${decodedText}`)

        try { await scanner.stop() } catch (e) { addLog(`stop() err: ${e.message}`) }

        setBarcode(decodedText)
        setPhase('loading')

        addLog('Recherche sur Open Food Facts...')
        try {
          const prod = await fetchProductByBarcode(decodedText)
          if (!prod) {
            addLog('Produit non trouvé dans OFF')
            setPhase('not_found')
          } else if (prod.incomplete) {
            addLog(`Produit trouvé (incomplet) : ${prod.name}`)
            setPrefill(prod.name)
            setPhase('incomplete')
          } else {
            addLog(`Produit trouvé : ${prod.name}`)
            setProduct(prod)
            setPhase('found')
          }
        } catch (e) {
          addLog(`Erreur OFF : ${e.message}`)
          setMessage(`Impossible de contacter Open Food Facts : ${e.message}`)
          setPhase('error')
        }
      },
      (err) => {
        // Erreurs de scan frame par frame — on ignore "No MultiFormat Readers"
        if (!err?.includes('No MultiFormat')) {
          addLog(`Frame err: ${err}`)
        }
      }
    )
    .then(() => {
      addLog('Caméra démarrée avec succès')
    })
    .catch(err => {
      const msg = err?.message || String(err)
      addLog(`ERREUR démarrage: ${msg}`)
      let userMsg = `Erreur caméra : ${msg}`
      if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
        userMsg = 'Accès à la caméra refusé. Autorise la caméra dans les réglages du navigateur.'
      } else if (msg.includes('NotFoundError') || msg.includes('not found')) {
        userMsg = 'Aucune caméra détectée. Essaie de changer la caméra ou utilise la saisie manuelle.'
      }
      setMessage(userMsg)
      setPhase('error')
    })

    return () => {
      stoppedRef.current = true
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Phases UI ──────────────────────────────────────────────────

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

  // ── Vue caméra (scanning / loading / error) ────────────────────
  return (
    <div className="fixed inset-0 z-[70] bg-black flex flex-col overflow-hidden">

      {/*
        html5-qrcode injecte une <video> et un <canvas> directement dans ce div.
        On le laisse remplir tout l'écran sans Tailwind qui interfère.
        Le style inline évite les conflits avec les classes utilitaires.
      */}
      <div
        id={SCANNER_ID}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      />

      {/* Supprimer le style injecté par html5-qrcode (bordures, boutons) via CSS global */}
      <style>{`
        #${SCANNER_ID} > * { box-sizing: border-box; }
        #${SCANNER_ID} video {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        #${SCANNER_ID} canvas { display: none !important; }
        #${SCANNER_ID} img { display: none !important; }
        #${SCANNER_ID} #qr-shaded-region { display: none !important; }
        #${SCANNER_ID} button { display: none !important; }
        #${SCANNER_ID} select { display: none !important; }
        #${SCANNER_ID} span { display: none !important; }
      `}</style>

      {/* Overlay sombre + cadre visuel */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
        <div className="absolute top-0 left-0 right-0 h-[28%] bg-black/60" />
        <div className="absolute bottom-0 left-0 right-0 h-[38%] bg-black/60" />
        <div className="absolute left-0 top-[28%] bottom-[38%] w-[8%] bg-black/60" />
        <div className="absolute right-0 top-[28%] bottom-[38%] w-[8%] bg-black/60" />

        <div className="relative w-[84%] aspect-[3/2]">
          {['top-0 left-0 border-t-4 border-l-4 rounded-tl-lg',
            'top-0 right-0 border-t-4 border-r-4 rounded-tr-lg',
            'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg',
            'bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg',
          ].map((cls, i) => (
            <div key={i} className={`absolute w-8 h-8 border-white ${cls}`} />
          ))}

          {phase === 'scanning' && (
            <div
              className="absolute left-2 right-2 top-0 h-0.5 bg-primary/80"
              style={{ animation: 'scanline 2s ease-in-out infinite' }}
            />
          )}
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-white">close</span>
        </button>
        <h2 className="font-headline font-bold text-white text-lg">Scanner un produit</h2>
        <div className="w-10" />
      </div>

      {/* Bottom panel */}
      <div className="relative z-10 mt-auto px-5 pb-6 flex flex-col items-center gap-3">
        {phase === 'scanning' && (
          <>
            <p className="text-white/80 text-sm text-center font-medium">
              Pointe la caméra vers le code-barres du produit
            </p>
            <button
              onClick={() => { setPhase('manual'); setBarcode(null) }}
              className="bg-white/20 text-white font-semibold text-sm px-6 py-3 rounded-full border border-white/30 active:scale-95 transition-transform"
            >
              Saisir manuellement
            </button>
          </>
        )}

        {phase === 'loading' && (
          <div className="flex items-center gap-3 bg-black/50 rounded-2xl px-6 py-4">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white font-medium text-sm">Recherche du produit...</p>
          </div>
        )}

        {phase === 'error' && (
          <div className="bg-black/80 rounded-2xl px-5 py-4 space-y-3 w-full">
            <p className="text-red-400 text-sm text-center font-medium">{message}</p>
            <button
              onClick={() => { setPhase('manual'); setBarcode(null) }}
              className="w-full bg-primary text-on-primary font-semibold text-sm py-3 rounded-full active:scale-95 transition-transform"
            >
              Saisir manuellement
            </button>
          </div>
        )}

        {/* Debug log — visible à l'écran pour faciliter les tests */}
        <div className="w-full bg-black/70 rounded-xl px-4 py-3 font-mono text-[10px] text-green-400 space-y-0.5">
          {debugLog.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
