import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleContext.jsx'
import { useFirebase } from '../context/FirebaseContext.jsx'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import ConsultationForm from '../components/ConsultationForm.jsx'
import LoadingCube from '../components/LoadingCube.jsx'
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore'

const ADMIN_EMAIL = 'kotaybaehatem@gmail.com';

function sendEmail(payload) {
  const userId = import.meta.env.VITE_EMAILJS_USER_ID
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  if (!userId || !serviceId || !templateId) return
  const body = [
    `New consultation request (${payload.locale || 'en'})`,
    '',
    `Name: ${payload.full_name ?? '—'}`,
    `Email: ${payload.email ?? '—'}`,
    `Phone: ${payload.phone ?? '—'}`,
    `Niche: ${payload.niche ?? '—'}${payload.niche_other ? ` (${payload.niche_other})` : ''}`,
    `Platforms: ${Array.isArray(payload.platforms) ? payload.platforms.join(', ') : '—'}`,
    payload.platform_links && Object.keys(payload.platform_links).length ? `Platform links: ${JSON.stringify(payload.platform_links)}` : null,
    `Followers: ${payload.followers ?? '—'}`,
    `Goal: ${payload.goal ?? '—'}`,
    '',
    `Problem: ${payload.problem ?? '—'}`,
    '',
    payload.previous_experience ? `Previous experience: ${payload.previous_experience}` : '',
  ].filter(Boolean).join('\n')
  fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: userId,
      template_params: {
        to_email: ADMIN_EMAIL,
        subject: `[Kotayba] New consultation: ${payload.full_name ?? 'Unknown'}`,
        body,
        full_name: payload.full_name ?? '',
        email: payload.email ?? '',
        phone: payload.phone ?? '',
        niche: payload.niche ?? '',
        platforms: Array.isArray(payload.platforms) ? payload.platforms.join(', ') : '',
        followers: payload.followers ?? '',
        goal: payload.goal ?? '',
        problem: payload.problem ?? '',
        previous_experience: payload.previous_experience ?? '',
        locale: payload.locale ?? 'en',
      },
    }),
  }).catch(() => {})
}

export default function ConsultationPage() {
  const { locale, t, dir } = useLocale()
  const { db, isConfigured } = useFirebase()
  const homePath = locale === 'en' ? '/en' : '/ar'
  const [consultationPrice, setConsultationPrice] = useState(null)
  const [priceLoading, setPriceLoading] = useState(false)

  useEffect(() => {
    if (!db || !isConfigured) {
      setPriceLoading(false)
      return
    }
    setPriceLoading(true)
    getDocs(collection(db, 'services'))
      .then((snap) => {
        const doc = snap.docs.find((d) => d.id === 'consultation')
        const price = doc?.data()?.price_usd
        setConsultationPrice(price != null && typeof price === 'number' ? price : 145)
      })
      .catch(() => setConsultationPrice(145))
      .finally(() => setPriceLoading(false))
  }, [db, isConfigured])

  const handleSubmit = async (values) => {
    if (!isConfigured || !db) throw new Error('Server Error.')
    const full_name = values.full_name?.trim() ?? ''
    const email = values.email?.trim() || null
    const phone = values.phone?.trim() || null
    const niche = values.niche ?? ''
    const niche_other = values.niche_other?.trim() || null
    const platforms = Array.isArray(values.platforms) ? values.platforms : []
    const platform_links = values.platform_links && typeof values.platform_links === 'object' ? values.platform_links : {}
    const followers = values.followers ?? ''
    const problem = values.problem?.trim() ?? ''
    const goal = values.goal ?? ''
    const previous_experience = values.previous_experience?.trim() || null
    const row = {
      full_name,
      email,
      phone,
      niche,
      niche_other,
      platforms,
      platform_links,
      followers,
      problem,
      goal,
      previous_experience,
      locale,
      created_at: serverTimestamp(),
    }
    addDoc(collection(db, 'consultations'), row).then(() => {
      sendEmail({ full_name, email, phone, niche, niche_other, platforms, platform_links, followers, problem, goal, previous_experience, locale })
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-dark)] text-white" dir={dir}>
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,89,0,0.08)_0%,transparent_70%)]" aria-hidden="true" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="container mx-auto max-w-xl flex-1 px-4 pb-16 pt-8">
          <Link
            to={homePath}
            className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
          >
            <span className="inline-block" style={locale === 'ar' ? { transform: 'scaleX(-1)' } : undefined} aria-hidden>←</span>
            {t('nav.home')}
          </Link>

          <section className="mb-6 text-center">
            <span className="inline-block rounded-full border border-[var(--color-border)] bg-[var(--color-primary-dim)] px-3 py-1 text-xs font-medium uppercase text-[var(--color-primary)]">
              {t('main.heroBadge')}
            </span>
            <h1 className="font-display mt-3 text-2xl font-bold">{t('main.consultation')}</h1>
          </section>

          {(priceLoading || consultationPrice != null) && (
            <div className="mb-6 flex justify-center">
              {priceLoading ? (
                <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[#1a1a1a] to-[#252525] px-12 shadow-lg ring-1 ring-[var(--color-primary)]/20">
                  <LoadingCube size="lg" />
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[#1a1a1a] to-[#252525] p-6 text-center shadow-lg ring-1 ring-[var(--color-primary)]/20">
                  <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-[var(--color-primary)]/10" aria-hidden />
                  <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                    {t('price.from')}
                  </p>
                  <p className="mt-1 font-display text-4xl font-black text-[var(--color-primary)]">
                    ${consultationPrice}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{t('price.usd')}</p>
                  <p className="mt-2 text-sm font-medium text-white">{t('price.consultation')}</p>
                </div>
              )}
            </div>
          )}

          <div className="mb-6 rounded-xl border border-[var(--color-border)] border-r-4 border-r-[var(--color-primary)] bg-[var(--color-primary-dim)] p-5">
            <h2 className="text-sm font-bold text-[var(--color-primary)]">⚠️ {t('notice.title')}</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)] leading-relaxed">
              {t('notice.body')}
            </p>
          </div>

          <ConsultationForm onSubmit={handleSubmit} />
        </main>
        <Footer />
      </div>
    </div>
  )
}
