import { atom } from "@ixd-group/rx-utils";
import { CursorData, Settings } from "./types";
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
  const cursor$ = atom<CursorData>({ x: 0, y: 0, visible: false });
  const handAction$ = new Subject<string>();

  function setSettings(settings: Settings) {
    settings$.set(settings);
  }

  function clearSelections() {
    commands$.next({ command: "clearSelection" });
  }

  function updateCursor(data: CursorData) {
    cursor$.set(data);
  }

  function updateGesture(data: string) {
    //console.log(data);
  }

  return {
    atoms: {
      settings$: settings$.readonly(),
      cursor$: cursor$.readonly(),
    },
    streams: {
      commands$: commands$ as Observable<Command>,
      handAction$,
    },
    actions: {
      setSettings,
      clearSelections: clearSelections,
      updateCursor: updateCursor,
      updateGesture: updateGesture,
    },
  };
};

export type Stores = ReturnType<typeof createStores>;
