import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Schedule from './pages/Schedule'
import Payment from './pages/Payment'
import Success from './pages/Success'
import NotFound from './pages/NotFound'
import Register from './pages/Register'
import CustomFormView from './pages/CustomFormView'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import PortalLogin from './pages/portal/PortalLogin'
import StudentDashboard from './pages/portal/StudentDashboard'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="about" element={<About />} />
    <Route path="schedule" element={<Schedule />} />
    <Route path="payment" element={<Payment />} />
    <Route path="success" element={<Success />} />
    <Route path="contact" element={<Contact />} />
    <Route path="register" element={<Register />} />
    <Route path="privacy" element={<Privacy />} />
    <Route path="terms" element={<Terms />} />
    <Route path="f/:slug" element={<CustomFormView />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
)

export default function App() {
  const { pathname } = useLocation()
  const isStandalone = pathname.startsWith('/admin') || pathname.startsWith('/portal')

  return (
    <>
      <ScrollToTop />
      {isStandalone ? (
        <Routes>
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/portal" element={<PortalLogin />} />
          <Route path="/portal/dashboard" element={<StudentDashboard />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/ru/*" element={<AppRoutes />} />
            <Route path="/en/*" element={<AppRoutes />} />
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </Layout>
      )}
    </>
  )
}
