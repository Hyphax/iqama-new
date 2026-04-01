import { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { dbUpdate, dbGetOne, IS_SUPABASE_READY } from "./supabaseClient";

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

export function SettingsProvider({ children, initialSettings, initialWhiteTheme }) {
  const resolvedInitialSettings = {
    ...DEFAULT_SETTINGS,
    ...(initialWhiteTheme != null ? { whiteTheme: initialWhiteTheme } : {}),
    ...(initialSettings || {}),
  };

  const [settings, setSettingsState] = useState(resolvedInitialSettings);
  const [isLoaded, setIsLoaded] = useState(Boolean(initialSettings));

  useEffect(() => {
    if (initialSettings) {
      return;
    }

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
  }, [initialSettings]);

  // ── Sync settings to Supabase (debounced) ──────────────────────────────
  const syncTimerRef = useRef(null);

  const syncToSupabase = useCallback((updatedSettings) => {
    if (!IS_SUPABASE_READY) return;

    // Debounce: wait 2s after last change before syncing
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      try {
        const userId = await AsyncStorage.getItem("iqama_supabase_user_id");
        if (!userId) return;

        const keyMap = {
          calculationMethod: "calculation_method",
          madhab: "madhab",
          hijriAdjustment: "hijri_adjustment",
          reminderMinutes: "reminder_minutes",
          focusModeEnabled: "focus_mode",
          duaNotification: "dua_notification",
          streakReminders: "streak_reminders",
          whiteTheme: "white_theme",
        };

        const mapped = {};
        for (const [key, value] of Object.entries(updatedSettings)) {
          if (keyMap[key]) mapped[keyMap[key]] = value;
        }

        if (Object.keys(mapped).length > 0) {
          await dbUpdate("user_settings", `user_id=eq.${userId}`, mapped);
        }

        // Also sync userName/userEmail to users table
        const profileUpdates = {};
        if (updatedSettings.userName !== undefined) profileUpdates.display_name = updatedSettings.userName;
        if (updatedSettings.userEmail !== undefined) profileUpdates.email = updatedSettings.userEmail;

        if (Object.keys(profileUpdates).length > 0) {
          await dbUpdate("users", `id=eq.${userId}`, profileUpdates);
        }
      } catch (e) {
        console.warn("[Settings] Supabase sync error:", e?.message);
      }
    }, 2000);
  }, []);

  const updateSetting = useCallback(async (key, value) => {
    setSettingsState((prev) => {
      const updated = { ...prev, [key]: value };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated)).catch((e) =>
        console.error("Failed to save setting:", e)
      );
      // Sync to Supabase
      syncToSupabase(updated);
      return updated;
    });
  }, [syncToSupabase]);

  const updateSettings = useCallback(async (updates) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated)).catch((e) =>
        console.error("Failed to save settings:", e)
      );
      // Sync to Supabase
      syncToSupabase(updated);
      return updated;
    });
  }, [syncToSupabase]);

  const contextValue = useMemo(
    () => ({ settings, updateSetting, updateSettings, isLoaded }),
    [settings, updateSetting, updateSettings, isLoaded]
  );

  return (
    <SettingsContext.Provider value={contextValue}>
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
