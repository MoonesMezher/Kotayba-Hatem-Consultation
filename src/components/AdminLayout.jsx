import { useState, useEffect } from 'react'
import { Link, Navigate, useLocation, Outlet } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useFirebase } from '../context/FirebaseContext.jsx'
import { useLocale } from '../context/LocaleContext.jsx'
import LoadingCube from './LoadingCube.jsx'

const ADMIN_EMAIL = 'kotaybaehatem@gmail.com'

export default function AdminLayout() {
  const { auth, isConfigured } = useFirebase()
  const { t } = useLocale()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const userEmail = user?.email ?? ''
  const isAdminEmail = userEmail && userEmail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase()

  const isDashboard = location.pathname === '/admin/dashboard'
  const isAnalytics = location.pathname === '/admin/analytics'
  const isPrices = location.pathname === '/admin/prices'
  const pageTitle = isDashboard ? t('admin.consultations') : isAnalytics ? t('admin.analytics') : isPrices ? t('admin.prices') : null

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [auth])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-dark)] text-white">
        <LoadingCube size="lg" />
      </div>
    )
  }
  if (!isConfigured || !auth || !user) {
    return <Navigate to="/admin" state={{ from: location }} replace />
  }

  const handleLogoutClick = (e) => {
    e.preventDefault()
    setShowLogoutConfirm(true)
  }

  const handleLogoutConfirm = async () => {
    await signOut(auth)
    setShowLogoutConfirm(false)
  }

  return (
    <div className="min-h-screen bg-[var(--color-dark)] text-white" dir="ltr">
      <header className="border-b border-[var(--color-border)] px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            {pageTitle && (
              <h1 className="truncate text-lg font-bold text-white">
                {pageTitle}
              </h1>
            )}
            <span className="hidden shrink-0 text-xs text-[var(--color-text-muted)] sm:inline" title={isAdminEmail ? 'Admin access' : `Login as ${ADMIN_EMAIL} to see data`}>
              {userEmail ? `Logged in as ${userEmail}` : '—'}
              {!isAdminEmail && userEmail && ' (not admin)'}
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-4">
            <Link
              to="/admin/dashboard"
              className={`text-sm font-medium ${isDashboard ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'}`}
            >
              {t('admin.consultations')}
            </Link>
            <Link
              to="/admin/analytics"
              className={`text-sm font-medium ${isAnalytics ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'}`}
            >
              {t('admin.analytics')}
            </Link>
            <Link
              to="/admin/prices"
              className={`text-sm font-medium ${isPrices ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'}`}
            >
              {t('admin.prices')}
            </Link>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
            >
              {t('admin.logout')}
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowLogoutConfirm(false)} aria-hidden="true" />
          <div className="relative w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[#1a1a1a] p-6 shadow-xl">
            <h2 id="logout-title" className="text-lg font-bold text-white">{t('admin.logout')}</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{t('admin.logoutConfirm')}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-xl border border-[var(--color-border)] bg-[#222] px-4 py-2.5 text-sm font-medium hover:bg-[#333]"
              >
                {t('admin.cancel')}
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-black hover:opacity-90"
              >
                {t('admin.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
