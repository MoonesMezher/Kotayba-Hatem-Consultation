import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleContext.jsx'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { mainPageLinks, logoUrl } from '../data/content.js'

export default function HomePage() {
  const { locale, t, dir } = useLocale()
  const base = locale === 'en' ? '/en' : '/ar'

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-dark)] text-white" dir={dir}>
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,89,0,0.08)_0%,transparent_70%)]" aria-hidden="true" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="container mx-auto max-w-2xl flex-1 px-4 pb-16 pt-8 md:pt-12">
          <section className="mb-10 text-center">
            <span className="inline-block rounded-full border border-[var(--color-border)] bg-[var(--color-primary-dim)] px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-primary)]">
              {t('main.heroBadge')}
            </span>
            <div className="mt-4 flex justify-center">
              <img
                src={logoUrl}
                alt=""
                className="h-24 w-24 rounded-full object-cover ring-2 ring-[var(--color-border)] md:h-28 md:w-28"
              />
            </div>
            <h1 className="font-display mt-4 text-4xl font-black tracking-tight md:text-5xl">
              {t('main.heroTitle')}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-[var(--color-text-muted)] leading-relaxed">
              {t('main.heroSub')}
            </p>
          </section>

          <section className="flex flex-col gap-3">
            {mainPageLinks.map((item) => {
              const href = item.href ?? `${base}/consultation`
              return (
                <Link
                  key={item.id}
                  to={href}
                  className="flex flex-col gap-1 rounded-2xl border border-[var(--color-border)] bg-[#1a1a1a] p-5 text-start transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-dim)]"
                >
                  <span className="font-bold text-white">
                    {t(item.pathKey)}
                  </span>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {t(item.descKey)}
                  </span>
                </Link>
              )
            })}
          </section>
        </main>
        <Footer />
      </div>
    </div>
  )
}
