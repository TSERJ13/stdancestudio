import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
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
import Bio from './pages/Bio'
import Plan from './pages/Plan'
import CoachPlan from './pages/CoachPlan'
import FaqPage from './pages/FaqPage'
import NewsPage from './pages/NewsPage'
import NewsSinglePage from './pages/NewsSinglePage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import PortalLogin from './pages/portal/PortalLogin'
import StudentDashboard from './pages/portal/StudentDashboard'
import PublicExamView from './pages/PublicExamView'

import Promo from './pages/Promo'
import Game from './pages/Game'

import { trackPageView } from './utils/analytics'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' })
        }
      }, 100)
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    trackPageView(pathname)
  }, [pathname, hash])
  return null
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="about" element={<About />} />
    <Route path="schedule" element={<Schedule />} />
    <Route path="news" element={<NewsPage />} />
    <Route path="news/:slug" element={<NewsSinglePage />} />
    <Route path="plan" element={<Plan />} />
    <Route path="coachplan" element={<CoachPlan />} />
    <Route path="coach-plan" element={<CoachPlan />} />
    <Route path="faq" element={<FaqPage />} />
    <Route path="payment" element={<Payment />} />
    <Route path="success" element={<Success />} />
    <Route path="contact" element={<Contact />} />
    <Route path="register" element={<Register />} />
    <Route path="promo" element={<Promo />} />
    <Route path="privacy" element={<Privacy />} />
    <Route path="terms" element={<Terms />} />
    <Route path="bio" element={<Bio />} />
    <Route path="link" element={<Bio />} />
    <Route path="f/:slug" element={<CustomFormView />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
)

export default function App() {
  const { pathname } = useLocation()
  const isStandalone = pathname.startsWith('/admin') || pathname.startsWith('/portal') || pathname.includes('/bio') || pathname.includes('/link') || pathname.includes('/game') || pathname.includes('/dancing-bricks') || pathname.startsWith('/exam')

  return (
    <>
      <ScrollToTop />
      {isStandalone ? (
        <ErrorBoundary>
          <Routes>
            <Route path="/exam" element={<PublicExamView />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/portal" element={<PortalLogin />} />
            <Route path="/portal/dashboard" element={<StudentDashboard />} />
            <Route path="/bio" element={<Bio />} />
            <Route path="/link" element={<Bio />} />
            <Route path="/en/bio" element={<Bio />} />
            <Route path="/en/link" element={<Bio />} />
            <Route path="/ru/bio" element={<Bio />} />
            <Route path="/ru/link" element={<Bio />} />
            <Route path="/game" element={<Game />} />
            <Route path="/dancing-bricks" element={<Game />} />
          </Routes>
        </ErrorBoundary>
      ) : (
        <Layout>
          <ErrorBoundary>
            <Routes>
              <Route path="/ru/*" element={<AppRoutes />} />
              <Route path="/en/*" element={<AppRoutes />} />
              <Route path="/*" element={<AppRoutes />} />
            </Routes>
          </ErrorBoundary>
        </Layout>
      )}
    </>
  )
}
