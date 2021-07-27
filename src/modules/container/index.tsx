import Grid from "../grid";
import { useEffect, useMemo, useRef, useState } from "react";
import Layer from "./components/Layer";
import Cursor from "./components/Cursor";
import styled from "@emotion/styled";
import { InteractionMessage } from "../grid/components/Grid";
import { Subject, Subscription } from "rxjs";
import SettingsMenu from "./components/Settings/SettingsMenu";
import { createStores } from "./stores";
import { createServices } from "./services";
import { ModuleContext, useRxState } from "@ixd-group/react-utils";
import ComputerVision from "../computervision/index.";
import Dynamics from "../computervision/Dynamics";
import { ComputerVisionData } from "../computervision/types";
import { Dimmer, Loader } from "semantic-ui-react";

const Wrapper = styled.div`
  overflow: hidden;
`;

const Container = () => {
  const [visionReady, setVisionReady] = useState(false);
  const once = useRef<number>(0);
  const stores = useMemo(createStores, []);
  const services = useMemo(createServices, []);
  const [settings] = useRxState([stores.atoms.settings$]);
  const [visionCursor] = useRxState([stores.atoms.cursor$]);
  const cursorSubscriptionRef = useRef<Subscription>(null);
  const dynamicsRef = useRef<Dynamics>(new Dynamics());

  const interactionStreamRef = useRef<Subject<InteractionMessage>>(
    new Subject()
  );

  // Mouse version
  /*
  const [cursorPosition, setCursorPosition] = useState({
    x: 100,
    y: 100,
  });
   */

  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  function visionToScreenCursor() {
    const x = (visionCursor.x / 1920) * window.innerWidth;
    const y = (visionCursor.y / 1080) * window.innerHeight;
    return { x, y, visible: visionCursor.visible };
  }

  useEffect(() => {
    const observer = stores.streams.commands$.subscribe((next) => {
      if (next.command === "clearSelection") {
        interactionStreamRef.current.next({ kind: "unselect all" });
      }
    });
    return () => {
      observer.unsubscribe();
    };
  }, [stores]);

  useEffect(() => {
    document.body.style.backgroundColor = settings.backgroundColour;
  }, [settings.backgroundColour]);

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    subscribeToCursor();
  }, [settings.handedness]);

  /*
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    }
    function handleMouseDown(e: MouseEvent) {
      interactionStreamRef.current.next({ kind: "click" });
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);
   */

  function subscribeToCursor(): void {
    if (cursorSubscriptionRef.current !== null) {
      cursorSubscriptionRef.current.unsubscribe();
    }

    // @ts-ignoreyarn n
    cursorSubscriptionRef.current = dynamicsRef.current
      .ambidextrousCursor(settings.handedness, 0.5)
      .subscribe((cursorPt) => {
        if (!visionReady) {
          setVisionReady(true);
        }
        stores.actions.updateCursor(cursorPt);
      });
  }

  function handleVisionData(data: ComputerVisionData) {
    if (once.current === 0) {
      once.current = 1;

      dynamicsRef.current.attachToData(data);
      subscribeToCursor();

      dynamicsRef.current.handActions.subscribe((next) => {
        stores.actions.updateGesture(next);
        if (next === "hand_closed") {
          interactionStreamRef.current.next({ kind: "click" });
        }
      });
    }
  }

  const chosenCursor = visionToScreenCursor();

  return (
    <ModuleContext.Provider value={{ stores, services }}>
      <Layer style={{ height: "100%" }}>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Grid
            columns={settings.cols}
            rows={settings.rows}
            width={(windowDimensions.width * settings.size) / 100}
            height={(windowDimensions.height * settings.size) / 100}
            borderRatio={settings.spacing}
            // Using mouse
            // cursor={{ x: cursorPosition.x, y: cursorPosition.y, visible: true }}
            cursor={chosenCursor}
            interactionStream$={interactionStreamRef.current}
            interactionMode={settings.interactionMode}
          />
          <Dimmer active={!visionReady}>
            <div>
              <Loader active={!visionReady}>Initialising ...</Loader>
            </div>
          </Dimmer>
        </div>
      </Layer>
      <Layer>
        <div style={{ transform: "scale(-0.25,0.25) translate(100%,-100%)" }}>
          <ComputerVision
            getObservables={handleVisionData}
            showCanvas={settings.showVideo}
          />
        </div>
      </Layer>
      <Layer>
        <Wrapper>
          <Cursor
            x={chosenCursor.x}
            y={chosenCursor.y}
            visible={chosenCursor.visible}
          />
        </Wrapper>
      </Layer>
      <SettingsMenu />
    </ModuleContext.Provider>
  );
};

export default Container;
