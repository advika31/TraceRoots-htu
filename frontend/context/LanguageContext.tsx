import { createContext, useContext, useState } from "react";

type Language = "EN" | "HI" | "PA";

const translations: Record<Language, Record<string, string>> = {
  EN: {
    login_title: "TraceRoots Login",
    login_username: "Username",
    login_password: "Password",
    login_button: "Login",
    signup_title: "Join TraceRoots",
    signup_subtitle: "Create your profile",
  },
  HI: {
    login_title: "TraceRoots लॉगिन",
    login_username: "यूज़रनेम",
    login_password: "पासवर्ड",
    login_button: "लॉगिन",
    signup_title: "TraceRoots से जुड़ें",
    signup_subtitle: "अपनी प्रोफ़ाइल बनाएं",
  },
  PA: {
    login_title: "TraceRoots ਲੌਗਇਨ",
    login_username: "ਯੂਜ਼ਰਨੇਮ",
    login_password: "ਪਾਸਵਰਡ",
    login_button: "ਲੌਗਇਨ",
    signup_title: "TraceRoots ਨਾਲ ਜੁੜੋ",
    signup_subtitle: "ਆਪਣਾ ਪ੍ਰੋਫ਼ਾਈਲ ਬਣਾਓ",
  },
};

const LanguageContext = createContext<any>(null);

export function LanguageProvider({ children }: any) {
  const [language, setLanguage] = useState<Language>("EN");

  const t = (key: string) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
