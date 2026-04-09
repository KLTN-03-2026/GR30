import { useState, useEffect } from "react";

const REMEMBER_KEY = "gopark_remembered_auth";
const REMEMBER_ENABLED_KEY = "gopark_remember_enabled";

export const useRememberLogin = () => {
  const [rememberedData, setRememberedData] = useState<{email: string, password: string} | null>(null);
  const [isRememberEnabled, setIsRememberEnabled] = useState(false);
  const [hasRemembered, setHasRemembered] = useState(false);

  useEffect(() => {
    // Load từ localStorage ở phía client
    if (typeof window !== "undefined") {
      const enabled = localStorage.getItem(REMEMBER_ENABLED_KEY) === "true";
      setIsRememberEnabled(enabled);

      if (enabled) {
        const stored = localStorage.getItem(REMEMBER_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setRememberedData(parsed);
            setHasRemembered(true);
          } catch (e) {
            console.error("Failed to parse remembered login data", e);
          }
        }
      }
    }
  }, []);

  const saveLogin = (email: string, password: string) => {
    if (isRememberEnabled) {
      localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email, password }));
      setRememberedData({ email, password });
      setHasRemembered(true);
    }
  };

  const clearLogin = () => {
    localStorage.removeItem(REMEMBER_KEY);
    setRememberedData(null);
    setHasRemembered(false);
  };

  const toggleRemember = (enabled: boolean) => {
    setIsRememberEnabled(enabled);
    localStorage.setItem(REMEMBER_ENABLED_KEY, String(enabled));
    if (!enabled) {
      clearLogin();
    }
  };

  return {
    rememberedData,
    isRememberEnabled,
    saveLogin,
    clearLogin,
    toggleRemember,
    hasRemembered,
  };
};
