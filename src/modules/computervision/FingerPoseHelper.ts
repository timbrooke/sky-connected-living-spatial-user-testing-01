// @ts-ignore
import * as fp from "fingerpose";

const closedHand = new fp.GestureDescription("closed hand");
closedHand.addCurl(fp.Finger.Thumb, fp.FingerCurl.FullCurl, 1.0);
closedHand.addCurl(fp.Finger.Index, fp.FingerCurl.FullCurl, 1.0);
closedHand.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 1.0);
closedHand.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);
closedHand.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0);

const openHand = new fp.GestureDescription("open hand");
openHand.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
openHand.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
openHand.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 1.0);
openHand.addCurl(fp.Finger.Ring, fp.FingerCurl.NoCurl, 1.0);
openHand.addCurl(fp.Finger.Pinky, fp.FingerCurl.NoCurl, 1.0);


const GE = new fp.GestureEstimator([
  fp.Gestures.ThumbsUpGesture,
  closedHand,
  openHand,
]);

export function estimateHandGesture(landmarks: any) {
  return GE.estimate(landmarks, 7.5);
}
