import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import translations from '../locales/translations';

const bundles = translations;
const supportedLanguages = Object.keys(bundles);
const STORAGE_KEY = 'agrifuture_language';

const normalizeLanguage = (language) => (
  supportedLanguages.includes(language) ? language : 'en'
);

const getByPath = (source, path) => {
  if (!source || !path) return undefined;
  return path.split('.').reduce((current, segment) => {
    return current && current[segment] !== undefined ? current[segment] : undefined;
  }, source);
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  availableLanguages: []
});

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    console.warn('useLanguage: LanguageContext is not available. Using fallback values.');
    const fallbackLanguages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
      { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
    ];
    return {
      language: 'en',
      lang: 'en',
      setLanguage: () => {},
      setLang: () => {},
      t: (key, fallback) => fallback || key,
      availableLanguages: fallbackLanguages
    };
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const savedLanguage =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem('selectedLanguage') ||
      localStorage.getItem('language') ||
      localStorage.getItem('lang') ||
      localStorage.getItem('weather_language');
    return normalizeLanguage(savedLanguage);
  });

  const setLanguage = useCallback((nextLanguage) => {
    setLanguageState((currentLanguage) => {
      const resolvedLanguage =
        typeof nextLanguage === 'function'
          ? nextLanguage(currentLanguage)
          : nextLanguage;
      return normalizeLanguage(resolvedLanguage);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    localStorage.setItem('selectedLanguage', language);
    localStorage.setItem('language', language);
    localStorage.setItem('lang', language);
    localStorage.setItem('weather_language', language);
    document.documentElement.lang = language;
    window.dispatchEvent(new CustomEvent('languageChange', { detail: language }));
    window.dispatchEvent(new CustomEvent('weatherLangChange', { detail: language }));
  }, [language]);

  const t = useMemo(() => {
    const translateFn = (key, fallback = '') => {
      const result = getByPath(bundles[language], key);
      if (result !== undefined) return result;
      const defaultValue = getByPath(bundles.en, key);
      return defaultValue !== undefined ? defaultValue : fallback || key;
    };
    Object.assign(translateFn, bundles[language] || {});
    return translateFn;
  }, [language]);

  const availableLanguages = useMemo(
    () => [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
      { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
    ],
    []
  );

  const contextValue = useMemo(
    () => ({
      language,
      lang: language,
      setLanguage,
      setLang: setLanguage,
      t,
      availableLanguages
    }),
    [language, setLanguage, t, availableLanguages]
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
};

export default LanguageContext;
