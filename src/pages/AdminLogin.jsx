import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { useFirebase } from '../context/FirebaseContext.jsx'
import { useLocale } from '../context/LocaleContext.jsx'

export default function AdminLogin() {
  const { auth, isConfigured } = useFirebase()
  const { t } = useLocale()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!auth) return
    const unsub = onAuthStateChanged(auth, setUser)
    return () => unsub()
  }, [auth])

  useEffect(() => {
    if (user) navigate('/admin/dashboard', { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!auth) {
      setError('Firebase not configured.')
      return
    }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isConfigured || !auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-dark)] text-white">
        <p className="text-[var(--color-text-muted)]">Firebase not configured. Set VITE_FIREBASE_* in .env.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-dark)] px-4" dir="ltr">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[#1a1a1a] p-8"
      >
        <h1 className="text-xl font-bold text-white">{t('admin.login')}</h1>
        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">{t('admin.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-[var(--color-border)] bg-[#222] px-4 py-3 text-white focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">{t('admin.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-[var(--color-border)] bg-[#222] px-4 py-3 text-white focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-[var(--color-primary)] py-3 font-bold text-black disabled:opacity-60"
        >
          {t('admin.signIn')}
        </button>
      </form>
    </div>
  )
}
