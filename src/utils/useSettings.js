import { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { dbUpdate, dbGetOne, IS_SUPABASE_READY } from "./supabaseClient";

const SETTINGS_KEY = "iqama_app_settings";

const VALID_METHODS = ["ISNA", "MWL", "Egypt", "Makkah", "Karachi"];
const VALID_MADHABS = ["Hanafi", "Shafi"];
const VALID_REMINDERS = [5, 10, 15, 30];

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

function validateSetting(key, value) {
  switch (key) {
    case "calculationMethod":
      return VALID_METHODS.includes(value) ? value : DEFAULT_SETTINGS.calculationMethod;
    case "madhab":
      return VALID_MADHABS.includes(value) ? value : DEFAULT_SETTINGS.madhab;
    case "hijriAdjustment": {
      const n = Number(value);
      return Number.isInteger(n) && n >= -2 && n <= 2 ? n : DEFAULT_SETTINGS.hijriAdjustment;
    }
    case "reminderMinutes":
      return VALID_REMINDERS.includes(Number(value)) ? Number(value) : DEFAULT_SETTINGS.reminderMinutes;
    case "whiteTheme":
      return typeof value === "boolean" ? value : DEFAULT_SETTINGS.whiteTheme;
    default:
      return value;
  }
}

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

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, []);

  // Ref to capture the result of functional setState for side effects
  const pendingSettingsRef = useRef(null);

  const updateSetting = useCallback((key, value) => {
    const validated = validateSetting(key, value);
    setSettingsState((prev) => {
      const updated = { ...prev, [key]: validated };
      pendingSettingsRef.current = updated;
      return updated;
    });
    // Side effects outside the updater, using the ref to get the computed value
    const updated = pendingSettingsRef.current;
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated)).catch((e) =>
      console.error("Failed to save setting:", e)
    );
    syncToSupabase(updated);
  }, [syncToSupabase]);

  const updateSettings = useCallback((updates) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...updates };
      pendingSettingsRef.current = updated;
      return updated;
    });
    // Side effects outside the updater, using the ref to get the computed value
    const updated = pendingSettingsRef.current;
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated)).catch((e) =>
      console.error("Failed to save settings:", e)
    );
    syncToSupabase(updated);
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

  const pendingRef = useRef(null);

  const updateSetting = useCallback((key, value) => {
    const validated = validateSetting(key, value);
    setSettingsState((prev) => {
      const updated = { ...prev, [key]: validated };
      pendingRef.current = updated;
      return updated;
    });
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(pendingRef.current)).catch((e) =>
      console.error("Failed to save setting:", e)
    );
  }, []);

  const updateSettings = useCallback((updates) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...updates };
      pendingRef.current = updated;
      return updated;
    });
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(pendingRef.current)).catch((e) =>
      console.error("Failed to save settings:", e)
    );
  }, []);

  return { settings, updateSetting, updateSettings, isLoaded };
}

export { DEFAULT_SETTINGS, SETTINGS_KEY };
