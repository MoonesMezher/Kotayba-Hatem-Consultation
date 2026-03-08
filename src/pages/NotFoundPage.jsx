import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleContext.jsx'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { logoUrl } from '../data/content.js'

export default function NotFoundPage() {
  const { t, dir } = useLocale()
  const homePath = dir === 'rtl' ? '/ar' : '/en'

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-dark)] text-white" dir={dir}>
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,89,0,0.08)_0%,transparent_70%)]" aria-hidden="true" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="container mx-auto max-w-2xl flex-1 px-4 pb-16 pt-8 md:pt-12 flex flex-col items-center justify-center text-center">
          <div className="mt-4 flex justify-center">
            <img
              src={logoUrl}
              alt=""
              className="h-20 w-20 rounded-full object-cover ring-2 ring-[var(--color-border)] opacity-90 md:h-24 md:w-24"
            />
          </div>
          <p className="font-display mt-8 text-8xl font-black tracking-tight text-[var(--color-primary)] md:text-9xl">
            404
          </p>
          <h1 className="mt-4 text-xl font-bold text-white md:text-2xl">
            {t('notFound.title')}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-[var(--color-text-muted)] leading-relaxed">
            {t('notFound.message')}
          </p>
          <Link
            to={homePath}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-primary)] px-6 py-3.5 text-sm font-bold text-black transition hover:bg-[var(--color-primary)]/90 hover:border-[var(--color-primary)]"
          >
            {t('notFound.backHome')}
          </Link>
        </main>
        <Footer />
      </div>
    </div>
  )
}
