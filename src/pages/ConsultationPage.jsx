import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleContext.jsx'
import { useFirebase } from '../context/FirebaseContext.jsx'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import ConsultationForm from '../components/ConsultationForm.jsx'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

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
    `Niche: ${payload.niche ?? '—'}`,
    `Platforms: ${Array.isArray(payload.platforms) ? payload.platforms.join(', ') : '—'}`,
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

  const handleSubmit = async (values) => {
    if (!isConfigured || !db) throw new Error('Firebase not configured. Set VITE_FIREBASE_* in .env.')
    const full_name = values.full_name?.trim() ?? ''
    const email = values.email?.trim() || null
    const phone = values.phone?.trim() || null
    const niche = values.niche ?? ''
    const platforms = Array.isArray(values.platforms) ? values.platforms : []
    const followers = values.followers ?? ''
    const problem = values.problem?.trim() ?? ''
    const goal = values.goal ?? ''
    const previous_experience = values.previous_experience?.trim() || null
    const row = {
      full_name,
      email,
      phone,
      niche,
      platforms,
      followers,
      problem,
      goal,
      previous_experience,
      locale,
      created_at: serverTimestamp(),
    }
    addDoc(collection(db, 'consultations'), row).then(() => {
      sendEmail({ full_name, email, phone, niche, platforms, followers, problem, goal, previous_experience, locale })
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
