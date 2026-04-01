import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderSection } from "@/components/HomeScreen/HeaderSection";
import { NextPrayerCard } from "@/components/HomeScreen/NextPrayerCard";
import { FocusButton } from "@/components/HomeScreen/FocusButton";
import { PrayersList } from "@/components/HomeScreen/PrayersList";
import { StreakCard } from "@/components/HomeScreen/StreakCard";
import { AfterPrayerDuaCard } from "@/components/HomeScreen/AfterPrayerDuaCard";
import { AskIslamModal } from "@/components/HomeScreen/AskIslamModal";
import { usePrayerStorage } from "@/utils/usePrayerStorage";
import { useSettings } from "@/utils/useSettings";
import { useNotificationScheduler } from "@/utils/useNotificationScheduler";
import { useUser } from "@/utils/auth/useUser";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { LayoutAnimationConfig } from "react-native-reanimated";
import { useSkipInitialEntering } from "@/utils/useSkipInitialEntering";
import { useLaunchOverlay } from "@/utils/useLaunchOverlay";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const skipInitialEntering = useSkipInitialEntering();
  const hideLaunchOverlay = useLaunchOverlay();
  const [minuteTick, setMinuteTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setMinuteTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const [location, setLocation] = useState(null);
  const [cityName, setCityName] = useState("Loading...");
  const [country, setCountry] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const {
    completedPrayers,
    streakData,
    togglePrayerComplete,
  } = usePrayerStorage();
  const { settings, updateSetting } = useSettings();
  const { user } = useUser();

  // Get user location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setCityName("Location denied");
          return;
        }
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation({ lat, lng });

        const addresses = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });
        if (addresses && addresses.length > 0) {
          const addr = addresses[0];
          const city = addr.city || addr.subregion || addr.region || "Unknown";
          setCityName(`${city}, ${addr.country || ""}`);
          setCountry(addr.country);
        }
      } catch (error) {
        console.error("Location error:", error);
        setCityName("Location unavailable");
      }
    })();
  }, []);

  // Fetch prayer times with Aladhan public API
  const {
    data: prayerData,
    isLoading: prayerLoading,
    isError: prayerError,
    refetch: refetchPrayers,
  } = useQuery({
    queryKey: [
      "prayer-times",
      location?.lat,
      location?.lng,
      settings.calculationMethod,
      settings.madhab,
      settings.hijriAdjustment,
    ],
    queryFn: async () => {
      if (!location) return null;

      // Map our method names to Aladhan method numbers
      const methodMap = {
        ISNA: 2,
        MWL: 3,
        Egypt: 5,
        Makkah: 4,
        Karachi: 1,
        Tehran: 7,
        Jafari: 0,
      };

      // Auto-adjust for Subcontinent if no specific setting is chosen
      const isSubcontinent = ["India", "Pakistan", "Bangladesh"].includes(
        country,
      );
      const defaultMethod = isSubcontinent ? 1 : 2; // Karachi for Subcontinent, ISNA otherwise
      const defaultAdjustment = isSubcontinent ? -1 : 0;

      const methodNum = methodMap[settings.calculationMethod] ?? defaultMethod;
      const schoolNum = settings.madhab?.toLowerCase() === "hanafi" ? 1 : 0;
      const currentAdjustment =
        settings.hijriAdjustment !== 0
          ? settings.hijriAdjustment
          : defaultAdjustment;

      const response = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${location.lat}&longitude=${location.lng}&method=${methodNum}&school=${schoolNum}&adjustment=${currentAdjustment}`,
      );
      if (!response.ok)
        throw new Error(`Aladhan fetch failed: ${response.status}`);
      const json = await response.json();
      const todayTimings = json.data.timings;
      const todayDate = json.data.date;

      // Check for Maghrib rollover
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [magH, magM] = todayTimings.Maghrib.split(":").map(Number);
      const maghribMinutes = magH * 60 + magM;

      let finalDate = todayDate;

      // If after Maghrib, fetch Hijri date for tomorrow
      if (currentMinutes >= maghribMinutes) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tDay = String(tomorrow.getDate()).padStart(2, "0");
        const tMonth = String(tomorrow.getMonth() + 1).padStart(2, "0");
        const tYear = tomorrow.getFullYear();

        try {
          const tomResponse = await fetch(
            `https://api.aladhan.com/v1/timings/${tDay}-${tMonth}-${tYear}?latitude=${location.lat}&longitude=${location.lng}&method=${methodNum}&school=${schoolNum}&adjustment=${currentAdjustment}`,
          );
          if (tomResponse.ok) {
            const tomJson = await tomResponse.json();
            finalDate = tomJson.data.date;
          }
        } catch (e) {
          console.error("Failed to fetch tomorrow's Hijri date:", e);
        }
      }

      // Helper: convert 24h "HH:MM" to "H:MM AM/PM"
      const to12h = (t24) => {
        const [h, m] = t24.split(":").map(Number);
        const period = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${h12}:${String(m).padStart(2, "0")} ${period}`;
      };

      const RAKATS = {
        Fajr: { sunnah: 2, fard: 2 },
        Dhuhr: { sunnah: 4, fard: 4, sunnahAfter: 2, nafl: 2 },
        Asr: { sunnah: 4, fard: 4 },
        Maghrib: { fard: 3, sunnahAfter: 2, nafl: 2 },
        Isha: {
          sunnah: 4,
          fard: 4,
          sunnahAfter: 2,
          nafl: 2,
          witr: 3,
          naflAfter: 2,
        },
      };
      const prayerNames = [
        "Fajr",
        "Sunrise",
        "Dhuhr",
        "Asr",
        "Maghrib",
        "Isha",
      ];

      const prayers = prayerNames.map((name) => ({
        name,
        time: to12h(todayTimings[name] || "00:00"),
        rakats: RAKATS[name] || null,
      }));

      // Ramadan special formatting
      let hijriDateStr = `${finalDate.hijri.day} ${finalDate.hijri.month.en} ${finalDate.hijri.year} AH`;
      if (finalDate.hijri.month.number === 9) {
        hijriDateStr = `Day ${finalDate.hijri.day} of Ramadan, ${finalDate.hijri.year} AH`;
      }

      return {
        prayers,
        gregorianDate: todayDate.readable,
        hijriDate: hijriDateStr,
      };
    },
    enabled: !!location,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 12,
  });

  // Schedule prayer reminder notifications
  useNotificationScheduler(prayerData, settings);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetchPrayers();
    setRefreshing(false);
  };

  const isWhite = settings.whiteTheme === true;

  // Filter out Sunrise for prayer list (not a prayer) — memoized to stabilize references
  const prayerTimesData = useMemo(
    () => (prayerData?.prayers || []).filter((p) => p.name !== "Sunrise"),
    [prayerData?.prayers],
  );

  const currentPrayerName = useMemo(
    () => getCurrentPrayer(prayerData?.prayers || []),
    [prayerData?.prayers, minuteTick],
  );

  const nextPrayerObj = useMemo(
    () => prayerTimesData.find((p) => p.name === currentPrayerName),
    [prayerTimesData, currentPrayerName],
  );

  // Enrich prayers with completion status — memoized to prevent PrayerRow re-renders
  const enrichedPrayers = useMemo(
    () =>
      prayerTimesData.map((p) => ({
        ...p,
        completed: completedPrayers[p.name] || false,
        current: p.name === currentPrayerName,
      })),
    [prayerTimesData, completedPrayers, currentPrayerName],
  );

  const currentPrayer = nextPrayerObj?.name || "Asr";
  const displayName = user?.name || settings.userName || "Friend";

  const dateString = useMemo(() => {
    if (prayerData) {
      return `${prayerData.gregorianDate} • ${prayerData.hijriDate}`;
    }
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [prayerData?.gregorianDate, prayerData?.hijriDate]);

  const handleToggleTheme = useCallback(() => {
    updateSetting("whiteTheme", !isWhite);
  }, [isWhite, updateSetting]);

  const isHomeStable =
    cityName !== "Loading..." &&
    (
      prayerLoading ||
      Boolean(prayerData) ||
      prayerError ||
      cityName === "Location denied" ||
      cityName === "Location unavailable"
    );

  useEffect(() => {
    if (!isHomeStable) {
      return;
    }

    const timer = setTimeout(() => {
      hideLaunchOverlay();
    }, prayerLoading ? 450 : 250);

    return () => clearTimeout(timer);
  }, [hideLaunchOverlay, isHomeStable, prayerLoading]);

  return (
    <LayoutAnimationConfig skipEntering={skipInitialEntering}>
      <View style={{ flex: 1, backgroundColor: isWhite ? '#F9F6F0' : '#050510' }}>
        <StatusBar style={isWhite ? "dark" : "light"} />

        <AskIslamModal />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isWhite ? "#050510" : "#D4AF37"}
              colors={[isWhite ? "#050510" : "#D4AF37"]}
            />
          }
        >
          <HeaderSection
            userName={displayName}
            location={cityName}
            isWhite={isWhite}
            onToggleTheme={handleToggleTheme}
            date={dateString}
            insets={insets}
            animateOnMount={false}
          />

          {prayerLoading ? (
            <View
              style={{
                paddingHorizontal: 20,
                marginBottom: 24,
                alignItems: "center",
                paddingVertical: 60,
              }}
            >
              <ActivityIndicator
                size="large"
                color={isWhite ? "#B8860B" : "#D4AF37"}
              />
              <Text
                style={{
                  fontFamily: "Montserrat_300Light",
                  fontSize: 13,
                  color: isWhite ? "rgba(5,5,16,0.3)" : "rgba(255,255,255,0.3)",
                  marginTop: 16,
                }}
              >
                Loading prayer times...
              </Text>
            </View>
          ) : prayerError ? (
            <View
              style={{
                paddingHorizontal: 20,
                marginBottom: 24,
                alignItems: "center",
                paddingVertical: 60,
              }}
            >
              <Text
                style={{
                  fontFamily: "Montserrat_400Regular",
                  fontSize: 14,
                  color: isWhite ? "rgba(5,5,16,0.5)" : "rgba(255,255,255,0.5)",
                  textAlign: "center",
                }}
              >
                Could not load prayer times.{"\n"}Pull down to retry.
              </Text>
            </View>
          ) : !location ? (
            <View
              style={{
                paddingHorizontal: 20,
                marginBottom: 24,
                alignItems: "center",
                paddingVertical: 60,
              }}
            >
              <Text
                style={{
                  fontFamily: "Montserrat_400Regular",
                  fontSize: 14,
                  color: isWhite ? "rgba(5,5,16,0.5)" : "rgba(255,255,255,0.5)",
                  textAlign: "center",
                }}
              >
                Location access is needed to show{"\n"}prayer times for your area.
              </Text>
            </View>
          ) : (
            <>
              <NextPrayerCard
                prayerName={currentPrayer}
                prayerTime={nextPrayerObj?.time || ""}
                nextPrayerObj={nextPrayerObj}
                rakats={nextPrayerObj?.rakats}
                isWhite={isWhite}
                animateOnMount={false}
              />
              {settings.focusModeEnabled && (
                <FocusButton prayerName={currentPrayer} isWhite={isWhite} />
              )}
              <PrayersList
                prayers={enrichedPrayers}
                onToggleComplete={togglePrayerComplete}
                isWhite={isWhite}
                animateOnMount={false}
              />
              <AfterPrayerDuaCard
                currentPrayerName={currentPrayer}
                isWhite={isWhite}
                animateOnMount={false}
              />
            </>
          )}

          <StreakCard
            currentStreak={streakData.currentStreak}
            streakDays={streakData.streakDays}
            isWhite={isWhite}
            animateOnMount={false}
          />
        </ScrollView>
      </View>
    </LayoutAnimationConfig>
  );
}

function getCurrentPrayer(prayers) {
  if (!prayers || prayers.length === 0) return "Fajr";
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Filter out Sunrise strictly for tracking valid prayer intervals
  const actualPrayers = prayers.filter((p) => p.name !== "Sunrise");

  // Convert 12h time strings to minutes since midnight
  const prayerTimes = actualPrayers.map((prayer) => {
    const timeString = prayer.time || "00:00 AM";
    const [time, period] = timeString.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let prayerHours = hours;

    if (period === "PM" && hours !== 12) prayerHours += 12;
    if (period === "AM" && hours === 12) prayerHours = 0;

    return { name: prayer.name, minutes: prayerHours * 60 + minutes };
  });

  if (prayerTimes.length === 0) return "Fajr";

  const GRACE_PERIOD = 30; // minutes after adhan where current prayer stays active

  const ishaTime = prayerTimes[prayerTimes.length - 1].minutes;
  const fajrTime = prayerTimes[0].minutes;

  // After Isha (+ grace) or before Fajr → next is Fajr
  if (currentMinutes >= ishaTime + GRACE_PERIOD || currentMinutes < fajrTime) {
    return prayerTimes[0].name;
  }

  // Check each prayer: if we're within grace period of prayer i, that prayer is current
  // If we're past grace period of prayer i but before prayer i+1, next prayer is i+1
  for (let i = prayerTimes.length - 1; i >= 0; i--) {
    const pt = prayerTimes[i].minutes;
    if (currentMinutes >= pt && currentMinutes < pt + GRACE_PERIOD) {
      // Within grace period — this prayer is the current one
      return prayerTimes[i].name;
    }
    if (currentMinutes >= pt + GRACE_PERIOD) {
      // Past grace period — next prayer is upcoming
      if (i + 1 < prayerTimes.length) {
        return prayerTimes[i + 1].name;
      }
      return prayerTimes[0].name; // wrap to Fajr
    }
  }

  // Before first prayer
  return prayerTimes[0].name;
}
