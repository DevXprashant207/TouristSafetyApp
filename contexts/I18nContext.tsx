import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import   {translations} from '@/constants/translations';

type Language = 'en' | 'es';
type translations = keyof typeof translations; 
interface I18nContextValue {
  currentLanguage: Language;
  t: (key: string) => string;
  changeLanguage: (language: Language) => Promise<void>;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const LANGUAGE_KEY = 'app_language';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  // Load saved language preference on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
          setCurrentLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };

    loadLanguage();
  }, []);

  const t = (key: string): string => {
  const translation =
    (translations[currentLanguage] as Record<string, string>)[key];
    if (translation === undefined) {
      console.warn(`Translation missing for key: ${key} in language: ${currentLanguage}`);
      return key;
    }
    return translation;
};

  const changeLanguage = async (language: Language) => {
    try {
      setCurrentLanguage(language);
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  return (
    <I18nContext.Provider
      value={{
        currentLanguage,
        t,
        changeLanguage,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export { I18nContext }