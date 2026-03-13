import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useUserNeed() {
  const [userNeed, setUserNeed] = useState("peace");

  useEffect(() => {
    const loadNeed = async () => {
      try {
        const stored = await AsyncStorage.getItem("iqama_user_need");
        if (stored) setUserNeed(stored);
      } catch (e) {
        console.error("Failed to load user need:", e);
      }
    };
    loadNeed();
  }, []);

  return userNeed;
}
