import { Landmark } from "@mediapipe/pose";

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
