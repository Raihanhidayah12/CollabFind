import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import en from './en';
import id from './id';

const translations = { en, id };
const STORAGE_KEY = 'collabfind-lang';
const DEFAULT_LANG = 'en';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    } catch {
      return DEFAULT_LANG;
    }
  });

  const setLang = useCallback((newLang) => {
    if (translations[newLang]) {
      setLangState(newLang);
      try { localStorage.setItem(STORAGE_KEY, newLang); } catch {}
    }
  }, []);

  const t = useCallback((key, fallback) => {
    return translations[lang]?.[key] ?? translations.en[key] ?? fallback ?? key;
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
