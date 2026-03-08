import { useState, useCallback } from 'react'
import { useLocale } from '../context/LocaleContext.jsx'
import { formConfig, copy, whatsappNumber } from '../data/content.js'

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
    return o
  })
  const [status, setStatus] = useState('idle')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const progress = getProgressPercent(values, progressFieldIds)

  const setField = useCallback((id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }))
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
          ) : field.type === 'checkboxes' ? (
            <div className="grid grid-cols-2 gap-2">
              {getOptions(field.optionsKey).map(([val, label]) => (
                <label
                  key={val}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition ${
                    (values[field.id] || []).includes(val)
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-dim)] text-white'
                      : 'border-[var(--color-border)]/30 bg-[#222] text-[var(--color-text-muted)]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(values[field.id] || []).includes(val)}
                    onChange={(e) => {
                      const arr = values[field.id] || []
                      if (e.target.checked) setField(field.id, [...arr, val])
                      else setField(field.id, arr.filter((x) => x !== val))
                    }}
                    className="h-4 w-4 accent-[var(--color-primary)]"
                  />
                  {label}
                </label>
              ))}
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
