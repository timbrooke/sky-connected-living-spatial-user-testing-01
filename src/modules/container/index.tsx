import Grid from "../grid";
import { useEffect, useMemo, useRef, useState } from "react";
import Layer from "./components/Layer";
import Cursor from "./components/Cursor";
import styled from "@emotion/styled";
import { InteractionMessage } from "../grid/components/Grid";
import { Subject } from "rxjs";
import SettingsMenu from "./components/Settings/SettingsMenu";
import { createStores } from "./stores";
import { createServices } from "./services";
import { ModuleContext, useRxState } from "@ixd-group/react-utils";

const Wrapper = styled.div`
  overflow: hidden;
`;

const Container = () => {
  const stores = useMemo(createStores, []);
  const services = useMemo(createServices, []);
  const [settings] = useRxState([stores.atoms.settings$]);
  const interactionStreamRef = useRef<Subject<InteractionMessage>>(
    new Subject()
  );
  const [cursorPosition, setCursorPosition] = useState({
    x: 100,
    y: 100,
  });
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const observer = stores.streams.commands$.subscribe((next) => {
      if (next.command === "clearSelection") {
        interactionStreamRef.current.next({ kind: "unselect all" });
      }
    });
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
            cursor={{ x: cursorPosition.x, y: cursorPosition.y }}
            interactionStream$={interactionStreamRef.current}
            interactionMode={settings.interactionMode}
          />
        </div>
      </Layer>
      <Layer>
        <Wrapper>
          <Cursor x={cursorPosition.x} y={cursorPosition.y} />
        </Wrapper>
      </Layer>
      <SettingsMenu />
    </ModuleContext.Provider>
  );
};

export default Container;
