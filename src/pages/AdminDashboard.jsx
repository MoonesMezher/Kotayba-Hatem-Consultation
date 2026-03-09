import { useState, useEffect, useMemo } from 'react'
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore'
import { useFirebase } from '../context/FirebaseContext.jsx'
import { useLocale } from '../context/LocaleContext.jsx'
import { copy } from '../data/content.js'
import LoadingCube from '../components/LoadingCube.jsx'

function serializeDoc(docSnap) {
  const d = docSnap.data()
  const created = d.created_at?.toDate?.()
  return {
    id: docSnap.id,
    ...d,
    created_at: created ? created.toISOString() : (d.created_at ?? null),
  }
}

function formatCreatedAt(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function getOptionLabel(locale, optionsKey, value) {
  const opts = copy[locale]?.[optionsKey] ?? copy.en[optionsKey]
  if (typeof opts === 'object' && opts[value] != null) return opts[value]
  return value ?? '—'
}

function formatPlatforms(locale, platforms) {
  if (!Array.isArray(platforms) || platforms.length === 0) return '—'
  return platforms.map((p) => getOptionLabel(locale, 'form.platformOptions', p)).join(', ')
}

function whatsappLink(phone) {
  if (!phone || typeof phone !== 'string') return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 8) return null
  return `https://wa.me/${digits}`
}

export default function AdminDashboard() {
  const { db, isConfigured } = useFirebase()
  const { t, locale } = useLocale()
  const [allRows, setAllRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDesc, setSortDesc] = useState(true)
  const [filterNiche, setFilterNiche] = useState('')
  const [selectedRow, setSelectedRow] = useState(null)
  const [deleteConfirmRow, setDeleteConfirmRow] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchRows = () => {
    if (!db || !isConfigured) return
    setLoading(true)
    setError(null)
    const q = query(collection(db, 'consultations'), orderBy('created_at', 'desc'))
    getDocs(q)
      .then((snap) => {
        setAllRows(snap.docs.map(serializeDoc))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchRows()
  }, [db, isConfigured])

  const niches = useMemo(() => [...new Set(allRows.map((r) => r.niche).filter(Boolean))].sort(), [allRows])
  const rows = useMemo(() => {
    let list = filterNiche ? allRows.filter((r) => r.niche === filterNiche) : [...allRows]
    list.sort((a, b) => {
      const va = a[sortBy]
      const vb = b[sortBy]
      const cmp = va == null && vb == null ? 0 : String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sortDesc ? -cmp : cmp
    })
    return list
  }, [allRows, filterNiche, sortBy, sortDesc])

  const handleDelete = async (row) => {
    if (!db || !row?.id) return
    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'consultations', row.id))
      setDeleteConfirmRow(null)
      setSelectedRow(null)
      setAllRows((prev) => prev.filter((r) => r.id !== row.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const detailRow = selectedRow || deleteConfirmRow
  const showDetailModal = !!selectedRow
  const showDeleteModal = !!deleteConfirmRow

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-sm text-[var(--color-text-muted)]">
          {t('admin.byNiche')}:
          <select
            value={filterNiche}
            onChange={(e) => setFilterNiche(e.target.value)}
            className="ml-2 rounded border border-[var(--color-border)] bg-[#222] px-2 py-1 text-white"
          >
            <option value="">All</option>
            {niches.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <span className="text-sm text-[var(--color-text-muted)]">
          Sort: <button type="button" onClick={() => { setSortBy('created_at'); setSortDesc(!sortDesc); }} className="text-[var(--color-primary)] hover:underline">Date</button>
        </span>
      </div>
      {error && <p className="mb-4 text-red-400">{error}</p>}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingCube size="lg" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[#1a1a1a]">
                <th className="p-3 font-medium text-[var(--color-primary)]">Date</th>
                <th className="p-3 font-medium text-[var(--color-primary)]">Name</th>
                <th className="p-3 font-medium text-[var(--color-primary)]">Email</th>
                <th className="p-3 font-medium text-[var(--color-primary)]">Niche</th>
                <th className="p-3 font-medium text-[var(--color-primary)]">Goal</th>
                <th className="p-3 font-medium text-[var(--color-primary)]">Problem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedRow(r)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedRow(r); } }}
                  className="cursor-pointer border-b border-[var(--color-border)]/50 transition hover:bg-[#222]"
                >
                  <td className="p-3 text-[var(--color-text-muted)]">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-3">{r.full_name ?? '—'}</td>
                  <td className="p-3">{r.email ?? '—'}</td>
                  <td className="p-3">{r.niche ?? '—'}</td>
                  <td className="p-3">{r.goal ?? '—'}</td>
                  <td className="max-w-xs truncate p-3 text-[var(--color-text-muted)]" title={r.problem}>{r.problem ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="p-6 text-center text-[var(--color-text-muted)]">
              <p>No consultations yet.</p>
              <p className="mt-2 text-xs">Ensure you are logged in and Firestore rules allow read for authenticated users.</p>
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      {showDetailModal && detailRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="detail-title">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedRow(null)} aria-hidden="true" />
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-[var(--color-border)] bg-[#1a1a1a] shadow-xl">
            <div className="shrink-0 border-b border-[var(--color-border)] px-5 py-4 flex items-center justify-between">
              <h2 id="detail-title" className="text-lg font-bold text-[var(--color-primary)]">{t('admin.detailTitle')}</h2>
              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[#333] hover:text-white"
                aria-label={t('admin.close')}
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <p className="text-sm text-[var(--color-text-muted)]">
                <span className="font-medium text-white">{t('admin.createdAt')}:</span>{' '}
                {formatCreatedAt(detailRow.created_at)}
              </p>
              <DetailField label={t('form.fullName')} value={detailRow.full_name} />
              <DetailField label={t('form.email')} value={detailRow.email} />
              <DetailField label={t('form.phone')} value={detailRow.phone} />
              <DetailField label={t('form.niche')} value={getOptionLabel(locale, 'form.nicheOptions', detailRow.niche)} />
              {detailRow.niche_other && (
                <DetailField label={t('form.nicheOtherPlaceholder')} value={detailRow.niche_other} />
              )}
              <DetailField label={t('form.platforms')} value={formatPlatforms(locale, detailRow.platforms)} />
              {detailRow.platform_links && typeof detailRow.platform_links === 'object' && Object.keys(detailRow.platform_links).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-muted)]">{t('form.platformLinkPlaceholder')}</p>
                  <div className="mt-1 space-y-1.5">
                    {Object.entries(detailRow.platform_links)
                      .filter(([, url]) => url && String(url).trim())
                      .map(([platform, url]) => (
                        <p key={platform} className="text-sm">
                          <span className="text-[var(--color-text-muted)]">{getOptionLabel(locale, 'form.platformOptions', platform)}: </span>
                          <a
                            href={url.startsWith('http') ? url : `https://${url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--color-primary)] hover:underline break-all"
                            title={url}
                          >
                            {url.length > 30 ? `${url.slice(0, 30)}…` : url}
                          </a>
                        </p>
                      ))}
                  </div>
                </div>
              )}
              <DetailField label={t('form.followers')} value={getOptionLabel(locale, 'form.followerOptions', detailRow.followers)} />
              <DetailField label={t('form.goal')} value={getOptionLabel(locale, 'form.goalOptions', detailRow.goal)} />
              <DetailField label={t('form.problem')} value={detailRow.problem} multiline />
              <DetailField label={t('form.previous')} value={detailRow.previous_experience} multiline />
            </div>
            <div className="shrink-0 border-t border-[var(--color-border)] px-5 py-4 flex flex-wrap items-center gap-3 overflow-visible">
              {detailRow.email && (
                <a
                  href={`mailto:${detailRow.email}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#333] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#444]"
                >
                  {t('admin.sendEmail')}
                </a>
              )}
              {whatsappLink(detailRow.phone) && (
                <a
                  href={whatsappLink(detailRow.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#20bd5a]"
                >
                  {t('admin.whatsapp')}
                </a>
              )}
              <button
                type="button"
                onClick={() => { setSelectedRow(null); setDeleteConfirmRow(detailRow); }}
                className="shrink-0 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20"
              >
                {t('admin.delete')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="ml-auto shrink-0 rounded-xl border border-[var(--color-border)] bg-[#222] px-4 py-2.5 text-sm font-medium hover:bg-[#333]"
              >
                {t('admin.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && deleteConfirmRow && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDeleteConfirmRow(null)} aria-hidden="true" />
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[#1a1a1a] p-6 shadow-xl">
            <h2 id="delete-title" className="text-lg font-bold text-white">{t('admin.delete')}</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{t('admin.deleteConfirm')}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmRow(null)}
                className="rounded-xl border border-[var(--color-border)] bg-[#222] px-4 py-2.5 text-sm font-medium hover:bg-[#333]"
              >
                {t('admin.cancel')}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmRow)}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? '…' : t('admin.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function DetailField({ label, value, multiline }) {
  const display = value ?? '—'
  return (
    <div>
      <p className="text-xs font-medium text-[var(--color-text-muted)]">{label}</p>
      {multiline ? (
        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-white">{display}</p>
      ) : (
        <p className="mt-1 text-sm text-white">{display}</p>
      )}
    </div>
  )
}
