import { useAuth } from '@/utils/auth/useAuth';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated as RNAnimated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableFreeze, enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DEFAULT_SETTINGS, SettingsProvider, useSettings, SETTINGS_KEY } from '@/utils/useSettings';
import { SupabaseUserProvider } from '@/utils/useSupabaseUser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LaunchOverlayContext } from '@/utils/useLaunchOverlay';
import {
  useFonts,
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";
import { Amiri_400Regular } from "@expo-google-fonts/amiri";
import {
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import {
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

enableScreens(false);
enableFreeze(false);
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RootNavigator() {
  const { settings } = useSettings();
  const bg = settings.whiteTheme ? '#F9F6F0' : '#080814';
  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: bg },
    }} />
  );
}

function LaunchOverlay({ isWhite, opacity }) {
  const bg = isWhite ? '#F9F6F0' : '#080814';
  const textColor = isWhite ? '#1A1409' : '#FAFAFA';

  return (
    <RNAnimated.View
      pointerEvents="auto"
      style={[
        StyleSheet.absoluteFillObject,
        styles.launchOverlay,
        { backgroundColor: bg, opacity },
      ]}
    >
      <Image
        source={require('../../assets/images/iqama-logo.png')}
        style={styles.launchLogo}
        resizeMode="contain"
      />
      <Text style={[styles.launchTitle, { color: textColor }]}>Iqama</Text>
    </RNAnimated.View>
  );
}

export default function RootLayout() {
  const { initiate, isReady } = useAuth();
  const [settingsReady, setSettingsReady] = useState(false);
  const [initialSettings, setInitialSettings] = useState(DEFAULT_SETTINGS);
  const [launchVisible, setLaunchVisible] = useState(true);
  const launchOpacity = useRef(new RNAnimated.Value(1)).current;
  const hasHiddenLaunchOverlay = useRef(false);

  const [fontsLoaded] = useFonts({
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Amiri_400Regular,
    PlayfairDisplay_700Bold,
  });

  useEffect(() => {
    initiate();
  }, [initiate]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_KEY);
        if (stored) {
          setInitialSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
        }
      } catch (e) {
        console.error("Failed to preload settings:", e);
      }
      setSettingsReady(true);
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (isReady && fontsLoaded && settingsReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady, fontsLoaded, settingsReady]);

  const hideLaunchOverlay = useCallback(() => {
    if (hasHiddenLaunchOverlay.current) {
      return;
    }

    hasHiddenLaunchOverlay.current = true;

    RNAnimated.timing(launchOpacity, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setLaunchVisible(false);
    });
  }, [launchOpacity]);

  useEffect(() => {
    if (!isReady || !fontsLoaded || !settingsReady) {
      return;
    }

    const fallbackTimer = setTimeout(hideLaunchOverlay, 2800);
    return () => clearTimeout(fallbackTimer);
  }, [fontsLoaded, hideLaunchOverlay, isReady, settingsReady]);

  if (!isReady || !fontsLoaded || !settingsReady) {
    return null;
  }

  const rootBg = initialSettings.whiteTheme ? '#F9F6F0' : '#080814';

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider initialSettings={initialSettings}>
          <LaunchOverlayContext.Provider value={hideLaunchOverlay}>
            <SupabaseUserProvider>
              <GestureHandlerRootView style={{ flex: 1, backgroundColor: rootBg }}>
                <RootNavigator />
                {launchVisible ? (
                  <LaunchOverlay
                    isWhite={initialSettings.whiteTheme === true}
                    opacity={launchOpacity}
                  />
                ) : null}
              </GestureHandlerRootView>
            </SupabaseUserProvider>
          </LaunchOverlayContext.Provider>
        </SettingsProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  launchOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  launchLogo: {
    width: 104,
    height: 104,
    borderRadius: 24,
  },
  launchTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 18,
    letterSpacing: 0.2,
  },
});
