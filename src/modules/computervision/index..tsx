import { useRef, useEffect, FC } from "react";
import { drawLandmarks } from "@mediapipe/drawing_utils";
import { Pose, Results } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { Observable, Subject } from "rxjs";
import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import { AnnotatedPrediction } from "@tensorflow-models/handpose";

type ComputerVisionProps = {
  showCanvas?: boolean;
  getObservables?: (results: {
    body: Observable<Results>;
    hand: Observable<AnnotatedPrediction[]>;
  }) => void;
};

const ComputerVision: FC<ComputerVisionProps> = ({
  showCanvas,
  getObservables,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const dataStreamRef = useRef<Subject<Results>>(new Subject<Results>());
  const handStreamRef = useRef<Subject<AnnotatedPrediction[]>>(
    new Subject<AnnotatedPrediction[]>()
  );
  const intervalRef = useRef<NodeJS.Timeout>();
  const videoReadyRef = useRef<boolean>(false);

  useEffect(() => {
    if (getObservables) {
      getObservables({
        body: dataStreamRef.current as Observable<Results>,
        hand: handStreamRef.current as Observable<AnnotatedPrediction[]>,
      });
    }
  }, [getObservables]);

  function onResults(results: Results) {
    // Send data to stream
    dataStreamRef.current.next(results);

    // Draw to canvas
    const canvasCtx = canvasCtxRef.current;
    if (canvasCtx && canvasRef.current) {
      canvasCtx.save();

      canvasCtx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      /*
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 4,
      }); */
      drawLandmarks(canvasCtx, results.poseLandmarks, {
        color: "#FF0000",
        lineWidth: 2,
      });
      canvasCtx.restore();
    }
  }

  async function prepareMachineVision(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ) {
    // TODO remove this listener
    video.addEventListener("loadeddata", () => {
      videoReadyRef.current = true;
      console.log("VIDEO READY");
    });

    canvasCtxRef.current = canvas.getContext("2d");

    // Pose Estimation
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    pose.onResults(onResults);

    const camera = new Camera(video, {
      onFrame: async () => {
        await pose.send({ image: video });
      },
      width: 1280,
      height: 720,
      facingMode: "user",
    });

    camera.start();

    const handposeModel = await handpose.load();

    intervalRef.current = setInterval(() => {
      if (videoReadyRef.current) {
        handposeModel.estimateHands(video).then((result) => {
          // console.log(result);
          handStreamRef.current.next(result);
        });
      }
    }, 100);
  }

  useEffect(() => {
    if (canvasRef.current && videoRef.current) {
      prepareMachineVision(videoRef.current, canvasRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canvasDisplay =
    showCanvas !== undefined ? (showCanvas ? "block" : "none") : "block";

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        style={{ display: canvasDisplay }}
      />
    </div>
  );
};

export default ComputerVision;
