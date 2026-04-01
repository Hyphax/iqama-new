import { createContext, useContext } from "react";

const noop = () => {};

export const LaunchOverlayContext = createContext(noop);

export function useLaunchOverlay() {
  return useContext(LaunchOverlayContext);
}
