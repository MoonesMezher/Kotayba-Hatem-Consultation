import { createContext, useContext, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { copy } from '../data/content.js'

function getLocaleFromPath(pathname) {
  if (pathname.startsWith('/ar')) return 'ar'
  return 'en'
}

const LocaleContext = createContext(null)

export function LocaleProvider({ children }) {
  const location = useLocation()
  const locale = getLocaleFromPath(location.pathname)
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = locale === 'ar' ? 'ar' : 'en'
    document.documentElement.dir = dir
  }, [locale, dir])

  const value = useMemo(() => {
    const strings = copy[locale] || copy.en
    return {
      locale,
      dir,
      t(key) {
        return strings[key] ?? key
      },
      pathForLocale(newLocale) {
        const base = location.pathname.replace(/^\/(en|ar)(\/|$)/, '$2') || '/'
        const path = base === '/' ? '' : base
        return newLocale === 'en' ? (path ? `/en${path}` : '/en') : (path ? `/ar${path}` : '/ar')
      },
    }
  }, [locale, dir, location.pathname])

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
