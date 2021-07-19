import { Results } from "@mediapipe/pose";
import { Observable } from "rxjs";
import { AnnotatedPrediction } from "@tensorflow-models/handpose";

export type ComputerVisionData = {
  body: Observable<Results>;
  hand: Observable<AnnotatedPrediction[]>;
};

export type CursorPoint = {
  x: number;
  y: number;
  visible: boolean;
};

export type HandGesture = {
  name: GestureName;
  confidence: number;
};

export type HandAction = "hand_opened" | "hand_closed" | "none";

export type GestureName = "open hand" | "closed hand" | "none";
