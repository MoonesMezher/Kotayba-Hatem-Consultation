import { useState, useCallback } from 'react'
import { useLocale } from '../context/LocaleContext.jsx'
import { formConfig, copy, whatsappNumber } from '../data/content.js'

const platformIcons = {
  instagram: (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  tiktok: (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  ),
  youtube: (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  linkedin: (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
}

function getProgressPercent(values, progressFieldIds) {
  let filled = 0
  for (const id of progressFieldIds) {
    const v = values[id]
    if (id === 'platforms') {
      if (Array.isArray(v) && v.length > 0) filled++
    } else if (v !== undefined && v !== null && String(v).trim() !== '') {
      filled++
    }
  }
  return Math.round((filled / progressFieldIds.length) * 100)
}

export default function ConsultationForm({ onSubmit }) {
  const { locale, t } = useLocale()
  const { fields, rejectedNiches, progressFieldIds } = formConfig

  const [values, setValues] = useState(() => {
    const o = {}
    fields.forEach((f) => {
      if (f.type === 'checkboxes') o[f.id] = []
      else o[f.id] = ''
    })
    o.niche_other = ''
    o.platform_links = { instagram: '', tiktok: '', youtube: '', linkedin: '' }
    return o
  })
  const [status, setStatus] = useState('idle')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const progress = getProgressPercent(values, progressFieldIds)

  const setField = useCallback((id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }))
  }, [])

  const setPlatformLink = useCallback((platform, url) => {
    setValues((prev) => ({
      ...prev,
      platform_links: { ...(prev.platform_links || {}), [platform]: url },
    }))
  }, [])

  const getOptions = (optionsKey) => {
    const obj = copy[locale]?.[optionsKey] ?? copy.en[optionsKey]
    if (typeof obj !== 'object' || obj === null) return []
    return Object.entries(obj)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const required = fields.filter((f) => f.required)
    for (const f of required) {
      const v = values[f.id]
      if (f.id === 'platforms') {
        if (!Array.isArray(v) || v.length === 0) {
          setStatus('idle')
          return
        }
      } else if (v === undefined || v === null || String(v).trim() === '') {
        setStatus('idle')
        return
      }
    }

    if (rejectedNiches.includes(values.niche)) {
      setStatus('reject')
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      if (onSubmit) await onSubmit(values)
      setStatus('success')
    } catch (err) {
      setSubmitError(err?.message || 'Request failed')
      setStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'success') {
    const msg = encodeURIComponent(
      locale === 'ar'
        ? `السلام عليكم، أنا ${values.full_name} تقدمت عبر الموقع لطلب استشارة.`
        : `Hi, I'm ${values.full_name}. I just submitted a consultation request.`
    )
    return (
      <div className="rounded-2xl border border-[var(--color-primary)]/30 bg-[#1a1a1a] p-10 text-center">
        <span className="text-4xl" aria-hidden="true">✅</span>
        <h2 className="mt-4 text-xl font-bold text-[var(--color-primary)]">{t('success.title')}</h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)] leading-relaxed">
          {t('success.msg')}
        </p>
        <a
          href={`https://wa.me/${whatsappNumber}?text=${msg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 font-bold text-white shadow-lg transition hover:opacity-90"
        >
          {t('success.whatsapp')}
        </a>
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">{t('success.note')}</p>
      </div>
    )
  }

  if (status === 'reject') {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-[#1a1a1a] p-10 text-center">
        <span className="text-4xl" aria-hidden="true">🚫</span>
        <h2 className="mt-4 text-lg font-bold text-red-400">{t('reject.title')}</h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)] leading-relaxed">
          {t('reject.msg')}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--color-border)] bg-[#1a1a1a] p-8">
      <h2 className="text-lg font-bold text-white">{t('form.title')}</h2>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t('form.subtitle')}</p>

      <div className="my-6 h-1 overflow-hidden rounded bg-[#222]">
        <div
          className="h-full rounded bg-[var(--color-primary)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {fields.map((field) => (
        <div key={field.id} className="mb-5">
          <label className="mb-2 block text-xs font-semibold text-[var(--color-primary)]">
            {field.required && <span className="text-red-400">* </span>}
            {t(field.pathKey)}
          </label>
          {field.type === 'text' || field.type === 'email' || field.type === 'tel' ? (
            <input
              type={field.type}
              value={values[field.id] ?? ''}
              onChange={(e) => setField(field.id, e.target.value)}
              placeholder={t(field.placeholderKey)}
              className="w-full rounded-xl border border-[var(--color-border)]/50 bg-[#222] px-4 py-3 text-white placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          ) : field.type === 'textarea' ? (
            <textarea
              value={values[field.id] ?? ''}
              onChange={(e) => setField(field.id, e.target.value)}
              placeholder={t(field.placeholderKey)}
              rows={4}
              className="w-full rounded-xl border border-[var(--color-border)]/50 bg-[#222] px-4 py-3 text-white placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          ) : field.type === 'select' ? (
            <div className="space-y-2">
              <select
                value={values[field.id] ?? ''}
                onChange={(e) => setField(field.id, e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)]/50 bg-[#222] px-4 py-3 text-white focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              >
                {getOptions(field.optionsKey).map(([val, label]) => (
                  <option key={val} value={val} disabled={val === ''}>
                    {label}
                  </option>
                ))}
              </select>
              {field.id === 'niche' && values.niche === 'other' && (
                <input
                  type="text"
                  value={values.niche_other ?? ''}
                  onChange={(e) => setField('niche_other', e.target.value)}
                  placeholder={t('form.nicheOtherPlaceholder')}
                  className="w-full rounded-xl border border-[var(--color-border)]/50 bg-[#222] px-4 py-3 text-white placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              )}
            </div>
          ) : field.type === 'checkboxes' ? (
            <div className="space-y-2">
              {getOptions(field.optionsKey).map(([val, label]) => {
                const selected = (values[field.id] || []).includes(val)
                const links = values.platform_links || {}
                return (
                  <div key={val} className="rounded-lg border border-[var(--color-border)]/30 bg-[#222] p-2.5">
                    <label
                      className={`flex cursor-pointer items-center gap-2 text-sm transition ${
                        selected ? 'text-white' : 'text-[var(--color-text-muted)]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => {
                          const arr = values[field.id] || []
                          if (e.target.checked) setField(field.id, [...arr, val])
                          else {
                            setField(field.id, arr.filter((x) => x !== val))
                            setPlatformLink(val, '')
                          }
                        }}
                        className="h-4 w-4 accent-[var(--color-primary)]"
                      />
                      {field.id === 'platforms' && platformIcons[val]}
                      {label}
                    </label>
                    {selected && (
                      <input
                        type="url"
                        value={links[val] ?? ''}
                        onChange={(e) => setPlatformLink(val, e.target.value)}
                        placeholder={t('form.platformLinkPlaceholder')}
                        className="mt-2 w-full rounded-lg border border-[var(--color-border)]/50 bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      ))}

      {submitError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          <p>{submitError}</p>
          {submitError.toLowerCase().includes('firebase') && (
            <p className="mt-2 text-xs opacity-90">
              Set VITE_FIREBASE_* in .env (see .env.example). Restart the dev server.
            </p>
          )}
        </div>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-[var(--color-primary)] py-4 font-bold text-black transition hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? '...' : t('form.submit')}
      </button>
      <p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">{t('form.note')}</p>
    </form>
  )
}
