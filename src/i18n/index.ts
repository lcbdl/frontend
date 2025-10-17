import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./ness-portal-en.ts";
import fr from "./ness-portal-fr.ts";
const options = {
  order: ["cookie", "querystring", "path", "navigator"],
  lookupQuerystring: "lang",
  lookupCookie: "lang",
  lookupFromPathIndex: 0,
};

i18next.use(LanguageDetector).init({
  supportedLngs: ["en", "fr"],
  detection: options,
  debug: true,
  interpolation: {
    escapeValue: false,
  },
  fallbackLng: "en",
  ns: "ness-portal",
  resources: { en, fr },
});

export default i18next;
