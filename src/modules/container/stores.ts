import { atom } from "@ixd-group/rx-utils";
import { Settings } from "./types";
import { Observable, Subject } from "rxjs";
import { Command } from "./types";

export const defaultSettings: Settings = {
  size: 100,
  cols: 5,
  rows: 2,
  gestureZoom: 1.2,
  backgroundColour: "#ECECEC",
  cursorSize: 20,
  hideCursor: false,
  interactionMode: "Standard",
  spacing: 0.25,
};

export const createStores = () => {
  const settings$ = atom<Settings>(defaultSettings);
  const commands$ = new Subject<Command>();

  function setSettings(settings: Settings) {
    settings$.set(settings);
  }

  function clearSelections() {
    commands$.next({ command: "clearSelection" });
  }

  return {
    atoms: {
      settings$: settings$.readonly(),
    },
    streams: {
      commands$: commands$ as Observable<Command>,
    },
    actions: {
      setSettings,
      clearSelections: clearSelections,
    },
  };
};

export type Stores = ReturnType<typeof createStores>;
