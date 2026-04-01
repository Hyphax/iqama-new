import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useNetworkStatus() {
  const [status, setStatus] = useState({
    isConnected: null,
    isInternetReachable: null,
  });

  useEffect(() => {
    // Eagerly seed current state
    NetInfo.fetch().then((state) => {
      setStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });
    });
    // Subscribe to ongoing changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });
    });
    return () => unsubscribe();
  }, []);

  return status;
}
