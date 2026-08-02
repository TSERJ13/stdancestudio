import Header from './Header'
import Footer from './Footer'
import AIChatWidget from './AIChatWidget'

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <AIChatWidget />
    </>
  )
}
