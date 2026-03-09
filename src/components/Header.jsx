import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleContext.jsx'
import { logoUrl } from '../data/content.js'

export default function Header() {
  const { locale, t, pathForLocale } = useLocale()
  const homePath = locale === 'en' ? '/en' : '/ar'

  return (
    <header dir="ltr" className="relative z-10 flex items-center justify-between px-4 py-4 md:px-8">
      <Link to={homePath} className="flex items-center gap-2">
        <img
          src={logoUrl}
          alt="Kotayba"
          className="h-10 w-10 rounded-full object-cover md:h-12 md:w-12"
          onError={(e) => {
            e.target.style.display = 'none'
            const next = e.target.nextElementSibling
            if (next) next.classList.remove('hidden')
          }}
        />
        <span className="hidden text-lg font-bold text-white" aria-hidden="true">Kotayba</span>
      </Link>
      <nav className="flex items-center gap-3">
        <Link
          to={pathForLocale('en')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${locale === 'en' ? 'bg-[var(--color-primary)] text-black' : 'text-[var(--color-text-muted)] hover:text-white'}`}
        >
          {t('nav.langEn')}
        </Link>
        <Link
          to={pathForLocale('ar')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${locale === 'ar' ? 'bg-[var(--color-primary)] text-black' : 'text-[var(--color-text-muted)] hover:text-white'}`}
        >
          {t('nav.langAr')}
        </Link>
      </nav>
    </header>
  )
}
