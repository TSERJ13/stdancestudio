import { createContext, useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { translations } from '../data/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    // 1. Saved preference
    try {
      const saved = localStorage.getItem('lang');
      if (saved && ['ka', 'en', 'ru'].includes(saved)) return saved;
    } catch (e) {}

    // 2. URL path check
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/ru/') || path === '/ru') return 'ru';
      if (path.startsWith('/en/') || path === '/en') return 'en';
      if (path.startsWith('/ka/') || path === '/ka') return 'ka';

      // 3. Telegram WebApp user language
      try {
        const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
        if (tgLang) {
          const l = tgLang.toLowerCase();
          if (l.startsWith('ru')) return 'ru';
          if (l.startsWith('en')) return 'en';
          if (l.startsWith('ka')) return 'ka';
        }
      } catch (e) {}

      // 4. Browser language
      try {
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang) {
          const bl = browserLang.toLowerCase();
          if (bl.startsWith('ru')) return 'ru';
          if (bl.startsWith('en')) return 'en';
        }
      } catch (e) {}
    }

    return 'ka';
  });

  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/ru/') || path === '/ru') {
      setLangState('ru');
    } else if (path.startsWith('/en/') || path === '/en') {
      setLangState('en');
    } else if (path.startsWith('/ka/') || path === '/ka') {
      setLangState('ka');
    }
    // Note: Do NOT override user-selected language on /game or root paths!
  }, [location.pathname]);

  const setLang = (newLang) => {
    if (['ka', 'en', 'ru'].includes(newLang)) {
      setLangState(newLang);
      try {
        localStorage.setItem('lang', newLang);
      } catch (e) {}
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('lang', lang);
    } catch (e) {}
    document.documentElement.lang = lang;
  }, [lang]);

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
