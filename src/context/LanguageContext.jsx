import { createContext, useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { translations } from '../data/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'ka')
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname
    if (path.startsWith('/ru/') || path === '/ru') {
      setLang('ru')
    } else if (path.startsWith('/en/') || path === '/en') {
      setLang('en')
    } else if (path.startsWith('/ka/') || path === '/ka') {
      // Actually default is ka without prefix, but let's allow it just in case
      setLang('ka')
    } else if (!path.startsWith('/admin') && !path.startsWith('/portal')) {
      // Default to Georgian for root and other paths
      setLang('ka')
    }
  }, [location.pathname])

  useEffect(() => {
    localStorage.setItem('lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const t = (path) => {
    const keys = path.split('.')
    let result = translations[lang]
    for (const key of keys) {
      if (result[key]) {
        result = result[key]
      } else {
        return path
      }
    }
    return result
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
