import { atom } from "@ixd-group/rx-utils";
import { Settings } from "./types";

export const defaultSettings: Settings = {
  size: 100,
  cols: 5,
  rows: 2,
  gestureZoom: 1.2,
  backgroundColour: "#ECECEC",
  cursorSize: 20,
  hideCursor: false,
  interactionMode: "Standard",
};

export const createStores = () => {
  const settings$ = atom<Settings>(defaultSettings);

  function setSettings(settings: Settings) {
    settings$.set(settings);
  }

  return {
    atoms: {
      settings$: settings$.readonly(),
    },
    actions: {
      setSettings,
    },
  };
};

export type Stores = ReturnType<typeof createStores>;
