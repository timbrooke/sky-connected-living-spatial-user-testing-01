import {
  bufferCount,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  Subject,
} from "rxjs";
import { isEqual } from "lodash";
import { Landmark, Results } from "@mediapipe/pose";

import {
  ComputerVisionData,
  CursorPoint,
  HandAction,
  HandGesture,
} from "./types";
import { AnnotatedPrediction } from "@tensorflow-models/handpose";
import { estimateHandGesture } from "./FingerPoseHelper";
import {
  AnnotatedLandmark,
  averageLandmarks,
  averageLandmarks2,
} from "./utils";
import { getNow } from "../../utils/utils";

// Wrist indexes flipped because video is flipped
const rightWristIndex = 16;
const leftWristIndex = 15;
const cursorScale = 2250;
const cursorOX = 960;
const cursorOY = 540;

type TimedGesture = {
  t: number;
  gesture: string;
};

class Dynamics {
  private _resultStream = new Subject<{ t: number; data: Results }>();
  private _handStream = new Subject<{
    t: number;
    data: AnnotatedPrediction[];
  }>();

  public attachToData(dataSource: ComputerVisionData) {
    dataSource.body.subscribe((data) => {
      const t = getNow();
      this._resultStream.next({ t, data });
    });
    dataSource.hand.subscribe((data) => {
      const t = getNow();
      this._handStream.next({ t, data });
    });
  }

  public get handGestures(): Observable<{
    t: number;
    gestures: HandGesture[];
  }> {
    return this._handStream.pipe(
      map(({ t, data }) => {
        if (data.length > 0) {
          const handGestures = estimateHandGesture(data[0].landmarks);
          if (handGestures.gestures) {
            return { t, gestures: handGestures.gestures };
          } else {
            return { t, gestures: [] };
          }
        } else {
          return { t, gestures: [] };
        }
      }),
      distinctUntilChanged((a, b) => isEqual(a.gestures, b.gestures))
    );
  }

  public get singleHandGesture(): Observable<TimedGesture> {
    return this.handGestures.pipe(
      map(({ t, gestures }) => {




        if (gestures.length > 0) {

          const list = gestures.map((g)=> g.name)
          console.log(list)

          let winner = "";
          let scoreThreshold = 8;
          gestures.forEach((g) => {
            if (g.confidence > scoreThreshold) {
              winner = g.name;
              scoreThreshold = g.confidence;
            }
          });
          if (winner !== "") {
            return { t, gesture: winner };
          } else {
            return { t, gesture: "none" };
          }
        } else {
          return { t, gesture: "none" };
        }
      }),
      distinctUntilChanged((a, b) => {
        return a.gesture === b.gesture;
      })
    );
  }

  public get handActions(): Observable<HandAction> {
    return this.singleHandGesture.pipe(
      map((value) => {
        switch (value.gesture) {
          case "open hand":
            return "hand_opened";
          case "closed hand":
            return "hand_closed";
          default:
            return "none";
        }
      }),
      filter((value) => value !== "none"),
      distinctUntilChanged()
    );
  }

  public get resultStream(): Observable<Results> {
    // strips out timings
    return this._resultStream.pipe(map(({ data }) => data));
  }

  public get rightWrist(): Observable<Landmark> {
    return this._resultStream.pipe(
      map(({ data }) => data.poseLandmarks[rightWristIndex]),
      bufferCount(3, 1),
      map(averageLandmarks)
    );
  }

  public eitherWrist(
    preference: "right" | "left",
    threshold = 0.5
  ): Observable<Landmark> {
    return this._resultStream.pipe(
      map(({ data }): AnnotatedLandmark => {
        let leftWrist: Landmark | undefined = undefined;
        let rightWrist: Landmark | undefined = undefined;
        if (data.poseLandmarks) {
          rightWrist = data.poseLandmarks[rightWristIndex];
          leftWrist = data.poseLandmarks[leftWristIndex];
          if (preference === "right") {
            if (rightWrist.visibility && rightWrist.visibility >= threshold) {
              return { side: "right", landmark: rightWrist };
            }
            if (leftWrist.visibility && leftWrist.visibility >= threshold) {
              return { side: "left", landmark: leftWrist };
            }
            return { side: "right", landmark: rightWrist };
          } else {
            if (leftWrist.visibility && leftWrist.visibility >= threshold) {
              return { side: "left", landmark: leftWrist };
            }
            if (rightWrist.visibility && rightWrist.visibility >= threshold) {
              return { side: "right", landmark: rightWrist };
            }
            return { side: "left", landmark: leftWrist };
          }
        }
        return { side: "none" };
      }),
      // Smooth position
      bufferCount(6, 1),
      map(averageLandmarks2)
    );
  }

  public get cursor(): Observable<CursorPoint> {
    return this.rightWrist.pipe(
      map((landmark: Landmark) => {
        const x = (landmark.x - 0.5) * -cursorScale + cursorOX;
        const y = (landmark.y - 0.5) * cursorScale + cursorOY;
        const visible =
          landmark.visibility !== undefined && landmark.visibility > 0.5;
        return { x, y, visible };
      })
    );
  }

  public ambidextrousCursor(
    preference: "right" | "left",
    threshold: number = 0.5
  ) {
    return this.eitherWrist(preference, threshold).pipe(
      map((landmark: Landmark) => {
        const x = (landmark.x - 0.5) * -cursorScale + cursorOX;
        const y = (landmark.y - 0.5) * cursorScale + cursorOY;
        const visible =
          landmark.visibility !== undefined && landmark.visibility > 0.5;
        return { x, y, visible };
      })
    );
  }
}

export default Dynamics;
