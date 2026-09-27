import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { loadLang, t as translate, Lang } from "./index";
import { adapter } from "../store/StorageAdapter";

interface I18nContextType {
  lang: Lang;
  setLanguage: (newLang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLanguage: () => {},
  t: translate,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    let isMounted = true;
    adapter.loadProfile().then((p) => {
      if (!isMounted || !p?.lang) return;
      const validLangs: Lang[] = ["en", "sv", "nl", "vi"];
      if (validLangs.includes(p.lang as Lang)) {
        setLangState(p.lang as Lang);
        loadLang(p.lang as Lang);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const setLanguage = useCallback((newLang: Lang) => {
    setLangState(newLang);
    loadLang(newLang);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      return translate(key, vars);
    },
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
