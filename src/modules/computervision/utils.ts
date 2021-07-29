import { Landmark } from "@mediapipe/pose";

export type AnnotatedLandmark = {
  side: "left" | "right" | "none";
  landmark?: Landmark;
};

export function averageLandmarks2(landmarks: AnnotatedLandmark[]) {
  let counter = 0;
  const result = landmarks.reduce(
    (acc: Landmark, curr: AnnotatedLandmark) => {
      if (
        acc.visibility !== undefined &&
        curr.landmark &&
        curr.landmark.visibility !== undefined &&
        curr.landmark.visibility >= 0.5
      ) {
        acc.x += curr.landmark.x;
        acc.y += curr.landmark.y;
        acc.z += curr.landmark.z;
        acc.visibility += curr.landmark.visibility;
        counter += 1;
      }
      return acc;
    },
    { x: 0, y: 0, z: 0, visibility: 0 }
  );
  if (counter > 0) {
    result.x /= counter;
    result.y /= counter;
    result.z /= counter;
    if (result.visibility) result.visibility /= counter;
  } else {
    result.x = 0;
    result.y = 0;
    result.z = 0;
    result.visibility = 0;
  }
  return result;
}

export function averageLandmarks(landmarks: Landmark[]) {
  let counter = 0;
  const result = landmarks.reduce(
    (acc: Landmark, curr: Landmark) => {
      if (
        acc.visibility !== undefined &&
        curr.visibility !== undefined &&
        curr.visibility >= 0.5
      ) {
        acc.x += curr.x;
        acc.y += curr.y;
        acc.z += curr.z;
        acc.visibility += curr.visibility;
        counter += 1;
      }
      return acc;
    },
    { x: 0, y: 0, z: 0, visibility: 0 }
  );
  if (counter > 0) {
    result.x /= counter;
    result.y /= counter;
    result.z /= counter;
    if (result.visibility) result.visibility /= counter;
  } else {
    result.x = 0;
    result.y = 0;
    result.z = 0;
    result.visibility = 0;
  }
  return result;
}
