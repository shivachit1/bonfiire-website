import { createContext, useContext, useEffect, useState } from "react";

// Every folder in src/content/ (en, fi, sv…) is a language. To add one, copy
// src/content/en to a new folder named with the language code, translate the
// files and set the name in its language.json. It then appears in the navbar.
// Any file a language doesn't have falls back to English.
const files = require.context("../content", true, /^\.\/[a-z-]+\/[\w-]+\.json$/);

const locales = {};
files.keys().forEach((key) => {
  const [, code, name] = key.match(/^\.\/([a-z-]+)\/([\w-]+)\.json$/);
  locales[code] = { ...locales[code], [name]: files(key) };
});

const DEFAULT_LANGUAGE = "en";
const STORAGE_KEY = "bonfiire-language";

export const languages = Object.entries(locales).map(([code, content]) => ({
  code,
  name: content.language?.name || code,
}));

// A saved choice wins, then the browser's language if we have it, then English.
const initialLanguage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && locales[saved]) return saved;
  } catch {
    // Storage can be blocked (private mode); fall through.
  }
  const browser = (navigator.language || "").slice(0, 2).toLowerCase();
  return locales[browser] ? browser : DEFAULT_LANGUAGE;
};

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Not saved; the choice still applies for this visit.
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

// One content file (e.g. "home", "faq", "ui") in the current language.
export const useContent = (name) => {
  const { language } = useLanguage();
  return locales[language]?.[name] ?? locales[DEFAULT_LANGUAGE][name];
};
