import "@testing-library/react";
import { Landmark } from "@mediapipe/pose";
import { averageLandmarks } from "./utils";

const L1: Landmark = {
  visibility: 0.5,
  x: 1,
  y: 2,
  z: 7,
};

const L2: Landmark = {
  visibility: 0.5,
  x: 1,
  y: 2,
  z: 5,
};

const L3: Landmark = {
  visibility: 0.5,
  x: 1,
  y: 2,
  z: 6,
};

const L4: Landmark = {
  visibility: 0.3,
  x: 1,
  y: 2,
  z: 3,
};

const LL: Landmark[] = [L1, L2, L3, L4];

test("averages landmarks", () => {
  const result = averageLandmarks(LL);
  expect(result).toStrictEqual({
    visibility: 0.5,
    x: 1,
    y: 2,
    z: 6,
  });
});
