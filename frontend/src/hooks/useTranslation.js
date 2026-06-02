import { useCallback, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const useTranslation = () => {
  const { t, language, setLanguage, availableLanguages } = useLanguage();

  const translate = useCallback(
    (key, fallback, params) => {
      let value = t(key, fallback);
      if (params && typeof params === 'object') {
        Object.entries(params).forEach(([param, replacement]) => {
          value = value.replace(new RegExp(`{${param}}`, 'g'), String(replacement));
        });
      }
      return value;
    },
    [t]
  );

  const i18n = useMemo(
    () => ({ language }),
    [language]
  );

  return {
    t,
    translate,
    language,
    i18n,
    setLanguage,
    availableLanguages
  };
};

export default useTranslation;
