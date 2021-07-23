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
  spacing: number;
  handedness: "left" | "right"
  showVideo: boolean;
};

export type Command = { command: "clearSelection" };

export type CursorData = { x: number; y: number; visible: boolean };
