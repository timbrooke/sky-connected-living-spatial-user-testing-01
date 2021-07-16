import React, { FC, useRef, useState } from "react";
import "react-dat-gui/dist/index.css";
import DatGui, {
  DatBoolean,
  DatButton,
  DatColor,
  DatFolder,
  DatNumber,
  DatSelect,
} from "react-dat-gui";

export type InteractionMode = "Standard" | "Proximity" | "Focus" | "Swipe";

export type Settings = {
  size: number;
  cols: number;
  rows: number;
  gestureZoom: number;
  backgroundColour: string;
  interactionMode: InteractionMode;
  cursorSize: number;
  hideCursor: boolean;
};

type SettingsGuiProps = {
  settingsCallback?: (settings: Settings) => void;
};

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

const SettingsGui: FC<SettingsGuiProps> = ({ settingsCallback }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const interactionModes: InteractionMode[] = [
    "Standard",
    "Proximity",
    "Focus",
    // "Swipe",
  ];

  function handleUpdate(updates: any) {
    const updatedInteractionMode: InteractionMode = updates.interactionMode;
    if (updatedInteractionMode !== settings.interactionMode) {
      if (
        updatedInteractionMode === "Standard" ||
        updatedInteractionMode === "Proximity" ||
        updatedInteractionMode === "Focus"
      ) {
        updates.hideCursor = true;
      } else {
        updates.hideCursor = false;
      }
    }
    const newSettings: Settings = { ...settings, ...updates };
    if (settingsCallback) {
      settingsCallback(newSettings);
    }
    setSettings(newSettings);
  }

  function handleResetSelection() {
    // TODO Handle Reset Selection
    console.log("Reset Selection");
  }

  return (
    <DatGui data={settings} onUpdate={handleUpdate}>
      <DatSelect
        path={"interactionMode"}
        label="Interaction Mode"
        options={interactionModes}
      />
      <DatButton onClick={handleResetSelection} label={"Clear selections"} />
      <DatFolder title={"Settings"} closed={true}>
        <DatFolder title={"general"} closed={true}>
          <DatNumber path="cols" label="columns" min={1} max={5} step={1} />
          <DatNumber path="rows" label="rows" min={1} max={4} step={1} />
          <DatNumber path="size" label={"size"} min={20} max={100} step={1} />
          <DatColor path={"backgroundColour"} label={"background"} />
        </DatFolder>
        <DatFolder title={"cursor"} closed={true}>
          <DatBoolean path={"hideCursor"} label={"hide cursor"} />
          <DatNumber path={"cursorSize"} min={5} max={100} step={5} />
        </DatFolder>
      </DatFolder>
    </DatGui>
  );
};

export default SettingsGui;
