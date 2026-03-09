import { useState, useEffect } from 'react'
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore'
import { useFirebase } from '../context/FirebaseContext.jsx'
import { useLocale } from '../context/LocaleContext.jsx'
import LoadingCube from '../components/LoadingCube.jsx'

const DEFAULT_SERVICES = [{ key: 'consultation', price_usd: 145 }]

export default function AdminPrices() {
  const { db, isConfigured } = useFirebase()
  const { t } = useLocale()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState({})
  const [saving, setSaving] = useState(null)

  const fetchServices = async () => {
    if (!db || !isConfigured) return
    setLoading(true)
    setError(null)
    try {
      const snap = await getDocs(collection(db, 'services'))
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      if (list.length === 0) {
        for (const s of DEFAULT_SERVICES) {
          await setDoc(doc(db, 'services', s.key), { price_usd: s.price_usd })
        }
        const snap2 = await getDocs(collection(db, 'services'))
        setServices(snap2.docs.map((d) => ({ id: d.id, ...d.data() })))
      } else {
        setServices(list)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [db, isConfigured])

  const startEdit = (id, currentPrice) => {
    setEditing((prev) => ({ ...prev, [id]: currentPrice ?? '' }))
  }

  const setEditValue = (id, value) => {
    const num = value === '' ? '' : Number(value)
    if (num !== '' && (Number.isNaN(num) || num < 0)) return
    setEditing((prev) => ({ ...prev, [id]: value }))
  }

  const savePrice = async (id) => {
    const raw = editing[id]
    if (raw === undefined) return
    const price = raw === '' ? 0 : Number(raw)
    if (Number.isNaN(price) || price < 0) return
    if (!db) return
    setSaving(id)
    setError(null)
    try {
      const ref = doc(db, 'services', id)
      const existing = services.find((s) => s.id === id)
      if (existing) {
        await updateDoc(ref, { price_usd: price })
      } else {
        await setDoc(ref, { price_usd: price })
      }
      setServices((prev) => prev.map((s) => (s.id === id ? { ...s, price_usd: price } : s)))
      setEditing((prev => { const next = { ...prev }; delete next[id]; return next }))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingCube size="lg" />
      </div>
    )
  }

  return (
    <>
      {error && <p className="mb-4 text-red-400">{error}</p>}
      <div className="rounded-xl border border-[var(--color-border)] bg-[#1a1a1a] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[#222]">
              <th className="p-3 text-left font-medium text-[var(--color-primary)]">{t('admin.serviceKey')}</th>
              <th className="p-3 text-left font-medium text-[var(--color-primary)]">{t('admin.priceUsd')}</th>
              <th className="p-3 w-24" />
            </tr>
          </thead>
          <tbody>
            {services.map((s) => {
              const isEditing = editing[s.id] !== undefined
              const value = isEditing ? editing[s.id] : (s.price_usd ?? '')
              return (
                <tr key={s.id} className="border-b border-[var(--color-border)]/50">
                  <td className="p-3 capitalize">{s.id}</td>
                  <td className="p-3">
                    {isEditing ? (
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={value}
                        onChange={(e) => setEditValue(s.id, e.target.value)}
                        className="w-24 rounded border border-[var(--color-border)] bg-[#222] px-2 py-1.5 text-white"
                      />
                    ) : (
                      <span>${s.price_usd ?? '—'}</span>
                    )}
                  </td>
                  <td className="p-3">
                    {isEditing ? (
                      <button
                        type="button"
                        onClick={() => savePrice(s.id)}
                        disabled={saving === s.id}
                        className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-black disabled:opacity-50"
                      >
                        {saving === s.id ? '…' : t('admin.savePrice')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(s.id, s.price_usd)}
                        className="text-[var(--color-primary)] hover:underline text-xs"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {services.length === 0 && !loading && (
          <div className="p-6 text-center text-[var(--color-text-muted)]">No services. Add one in Firestore with id &quot;consultation&quot; and price_usd.</div>
        )}
      </div>
    </>
  )
}
