import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import { useAuthModal, useAuthStore, authKey } from './store';


/**
 * This hook provides authentication functionality.
 * It may be easier to use the `useAuthModal` or `useRequireAuth` hooks
 * instead as those will also handle showing authentication to the user
 * directly.
 */
export const useAuth = () => {
  const { isReady, auth, setAuth } = useAuthStore();
  const { isOpen, close, open } = useAuthModal();

  const initiate = useCallback(() => {
    SecureStore.getItemAsync(authKey)
      .then((auth) => {
        useAuthStore.setState({
          auth: auth ? JSON.parse(auth) : null,
          isReady: true,
        });
      })
      .catch((e) => {
        console.error("[Auth] initiate failed:", e?.message);
        useAuthStore.setState({ auth: null, isReady: true });
      });
  }, []);

  const signIn = useCallback(() => {
    try {
      open({ mode: 'signin' });
    } catch (e) {
      console.error("[Auth] signIn failed:", e?.message);
    }
  }, [open]);
  const signUp = useCallback(() => {
    try {
      open({ mode: 'signup' });
    } catch (e) {
      console.error("[Auth] signUp failed:", e?.message);
    }
  }, [open]);

  const signOut = useCallback(() => {
    try {
      setAuth(null);
      close();
    } catch (e) {
      console.error("[Auth] signOut failed:", e?.message);
    }
  }, [close, setAuth]);

  return {
    isReady,
    isAuthenticated: isReady ? !!auth : null,
    signIn,
    signOut,
    signUp,
    auth,
    setAuth,
    initiate,
  };
};

/**
 * This hook will automatically open the authentication modal if the user is not authenticated.
 */
export const useRequireAuth = (options) => {
  const { isAuthenticated, isReady } = useAuth();
  const { open } = useAuthModal();

  useEffect(() => {
    if (!isAuthenticated && isReady) {
      open({ mode: options?.mode });
    }
  }, [isAuthenticated, open, options?.mode, isReady]);
};

export default useAuth;