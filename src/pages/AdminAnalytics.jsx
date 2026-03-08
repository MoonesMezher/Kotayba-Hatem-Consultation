import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { useFirebase } from '../context/FirebaseContext.jsx'
import { useLocale } from '../context/LocaleContext.jsx'

function serializeDoc(doc) {
  const d = doc.data()
  const created = d.created_at?.toDate?.()
  return {
    id: doc.id,
    ...d,
    created_at: created ? created.toISOString() : (d.created_at ?? null),
  }
}

function useConsultations(db, isConfigured) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!db || !isConfigured) return
    const q = query(collection(db, 'consultations'), orderBy('created_at', 'desc'))
    getDocs(q)
      .then((snap) => setRows(snap.docs.map(serializeDoc)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [db, isConfigured])

  return { rows, loading, error }
}

function countBy(rows, key) {
  const m = new Map()
  for (const r of rows) {
    const v = r[key] ?? '—'
    m.set(v, (m.get(v) || 0) + 1)
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

function countByDay(rows, days = 30) {
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - days)
  const m = new Map()
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    m.set(d.toISOString().slice(0, 10), 0)
  }
  for (const r of rows) {
    if (!r.created_at) continue
    const day = String(r.created_at).slice(0, 10)
    if (m.has(day)) m.set(day, m.get(day) + 1)
  }
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]))
}

export default function AdminAnalytics() {
  const { db, isConfigured } = useFirebase()
  const { t } = useLocale()
  const { rows, loading, error } = useConsultations(db, isConfigured)

  const byNiche = countBy(rows, 'niche')
  const byGoal = countBy(rows, 'goal')
  const byDay = countByDay(rows, 30)
  const maxCount = Math.max(1, ...byDay.map(([, n]) => n))

  return (
    <>
      {error && <p className="mb-4 text-red-400">{error}</p>}
      {loading ? (
        <p className="text-[var(--color-text-muted)]">Loading...</p>
      ) : (
        <div className="space-y-8">
          <div className="rounded-xl border border-[var(--color-border)] bg-[#1a1a1a] p-6">
            <h2 className="text-lg font-bold text-[var(--color-primary)]">{t('admin.total')}</h2>
            <p className="mt-2 text-4xl font-black text-white">{rows.length}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[var(--color-border)] bg-[#1a1a1a] p-6">
              <h2 className="text-lg font-bold text-[var(--color-primary)]">{t('admin.byNiche')}</h2>
              <ul className="mt-4 space-y-2">
                {byNiche.map(([label, count]) => (
                  <li key={label} className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">{label}</span>
                    <span className="font-medium">{count}</span>
                  </li>
                ))}
                {byNiche.length === 0 && <li className="text-sm text-[var(--color-text-muted)]">No data</li>}
              </ul>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[#1a1a1a] p-6">
              <h2 className="text-lg font-bold text-[var(--color-primary)]">{t('admin.byGoal')}</h2>
              <ul className="mt-4 space-y-2">
                {byGoal.map(([label, count]) => (
                  <li key={label} className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">{label}</span>
                    <span className="font-medium">{count}</span>
                  </li>
                ))}
                {byGoal.length === 0 && <li className="text-sm text-[var(--color-text-muted)]">No data</li>}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[#1a1a1a] p-6">
            <h2 className="text-lg font-bold text-[var(--color-primary)]">{t('admin.submissionsOverTime')}</h2>
            <div className="mt-4 flex items-end gap-0.5" style={{ minHeight: '120px' }}>
              {byDay.map(([day, count]) => (
                <div
                  key={day}
                  className="flex-1 rounded-t bg-[var(--color-primary)] transition-opacity hover:opacity-90"
                  style={{ height: `${(count / maxCount) * 100}%`, minHeight: count ? '4px' : 0 }}
                  title={`${day}: ${count}`}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-[var(--color-text-muted)]">
              <span>{byDay[0]?.[0]}</span>
              <span>{byDay[byDay.length - 1]?.[0]}</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
