import React, { FC } from "react";
import "react-dat-gui/dist/index.css";
import DatGui, {
  DatButton,
  DatColor,
  DatFolder,
  DatNumber,
  DatSelect,
} from "react-dat-gui";
import { InteractionMode, Settings } from "../../types";
import { Stores } from "../../stores";
import { useStores, useRxState } from "@ixd-group/react-utils";

type SettingsGuiProps = {
  settingsCallback?: (settings: Settings) => void;
};

const SettingsGui: FC<SettingsGuiProps> = ({ settingsCallback }) => {
  const store = useStores<Stores>();
  const settings = useRxState(store.atoms.settings$);
  const setSettings = store.actions.setSettings;

  const interactionModes: InteractionMode[] = [
    "Standard",
    "Proximity",
    "Focus",
  ];

  function handleUpdate(updates: any) {
    const updatedInteractionMode: InteractionMode = updates.interactionMode;
    if (updatedInteractionMode !== settings.interactionMode) {
      updates.hideCursor =
        updatedInteractionMode === "Standard" ||
        updatedInteractionMode === "Proximity" ||
        updatedInteractionMode === "Focus";
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
    store.actions.clearSelections();
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
        <DatNumber path="cols" label="columns" min={1} max={6} step={1} />
        <DatNumber path="rows" label="rows" min={1} max={5} step={1} />
        <DatNumber path="spacing" label="spacing" min={0} max={2} step={0.25} />
        <DatColor path={"backgroundColour"} label={"background"} />
      </DatFolder>
    </DatGui>
  );
};

export default SettingsGui;
