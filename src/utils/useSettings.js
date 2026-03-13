import { useState, useEffect, useCallback, createContext, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "iqama_app_settings";

const DEFAULT_SETTINGS = {
  calculationMethod: "ISNA",
  madhab: "Hanafi",
  hijriAdjustment: 0,
  reminderMinutes: 10,
  focusModeEnabled: true,
  duaNotification: true,
  streakReminders: false,
  whiteTheme: false,
  userName: "",
  userEmail: "",
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_KEY);
        if (stored) {
          setSettingsState({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
        }
        setIsLoaded(true);
      } catch (e) {
        console.error("Failed to load settings:", e);
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  const updateSetting = useCallback(async (key, value) => {
    setSettingsState((prev) => {
      const updated = { ...prev, [key]: value };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated)).catch((e) =>
        console.error("Failed to save setting:", e)
      );
      return updated;
    });
  }, []);

  const updateSettings = useCallback(async (updates) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated)).catch((e) =>
        console.error("Failed to save settings:", e)
      );
      return updated;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, updateSettings, isLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (ctx) return ctx;

  // Fallback for screens outside provider (shouldn't happen but safe)
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_KEY);
        if (stored) {
          setSettingsState({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
        }
        setIsLoaded(true);
      } catch (e) {
        console.error("Failed to load settings:", e);
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  const updateSetting = useCallback(async (key, value) => {
    try {
      const updated = { ...settings, [key]: value };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      setSettingsState(updated);
    } catch (e) {
      console.error("Failed to save setting:", e);
    }
  }, [settings]);

  const updateSettings = useCallback(async (updates) => {
    try {
      const updated = { ...settings, ...updates };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      setSettingsState(updated);
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }, [settings]);

  return { settings, updateSetting, updateSettings, isLoaded };
}

export { DEFAULT_SETTINGS, SETTINGS_KEY };
