import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom'
import { LocaleProvider } from './context/LocaleContext.jsx'
import { FirebaseProvider } from './context/FirebaseContext.jsx'
import HomePage from './pages/HomePage.jsx'
import ConsultationPage from './pages/ConsultationPage.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminAnalytics from './pages/AdminAnalytics.jsx'
import AdminPrices from './pages/AdminPrices.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import AdminLayout from './components/AdminLayout.jsx'

const RootLayout = () => (
  <LocaleProvider>
    <Outlet />
  </LocaleProvider>
)

const router = createBrowserRouter([
  {
    element: <FirebaseProvider><RootLayout /></FirebaseProvider>,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'en', element: <HomePage /> },
      { path: 'ar', element: <HomePage /> },
      { path: 'consultation', element: <Navigate to="/en/consultation" replace /> },
      { path: 'en/consultation', element: <ConsultationPage /> },
      { path: 'ar/consultation', element: <ConsultationPage /> },
      {
        path: 'admin',
        element: <Outlet />,
        children: [
          { index: true, element: <AdminLogin /> },
          { path: 'dashboard', element: <AdminLayout />, children: [{ index: true, element: <AdminDashboard /> }] },
          { path: 'analytics', element: <AdminLayout />, children: [{ index: true, element: <AdminAnalytics /> }] },
          { path: 'prices', element: <AdminLayout />, children: [{ index: true, element: <AdminPrices /> }] },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
