import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useUserNeed() {
  const [userNeed, setUserNeed] = useState("peace");

  const refresh = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("iqama_user_need");
      if (stored) setUserNeed(stored);
      else setUserNeed("peace");
    } catch (e) {
      console.error("Failed to load user need:", e);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { userNeed, refresh };
}
