import { Redirect } from "expo-router";
import { useAuth } from "@/utils/auth/useAuth";
import { useSettings } from "@/utils/useSettings";

export default function RootIndex() {
  const { isAuthenticated, isReady: authReady } = useAuth();
  const { settings, isLoaded: settingsLoaded } = useSettings();

  if (!authReady || !settingsLoaded) return null;

  if (isAuthenticated || settings.userName) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/onboarding/welcome" />;
  }
}
