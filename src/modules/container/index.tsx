import Grid from "../grid";
import { useEffect, useRef, useState } from "react";
import Layer from "./components/Layer";
import Cursor from "./components/Cursor";
import styled from "@emotion/styled";
import { InteractionMessage } from "../grid/components/Grid";
import { Subject } from "rxjs";

const Wrapper = styled.div`
  overflow: hidden;
`;

const Container = () => {
  const interactionStreamRef = useRef<Subject<InteractionMessage>>(
    new Subject()
  );

  const [cursorPosition, setCursorPosition] = useState({
    x: 100,
    y: 100,
  });

  const [windowDimensions, setWindowDimensions] = useState({
    width: 800,
    height: 600,
  });

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
    <div>
      <Layer>
        <Grid
          columns={5}
          rows={2}
          width={windowDimensions.width}
          height={windowDimensions.height}
          borderRatio={0.25}
          cursor={{ x: cursorPosition.x, y: cursorPosition.y }}
          interactionStream$={interactionStreamRef.current}
        />
      </Layer>
      <Layer>
        <Wrapper>
          <Cursor x={cursorPosition.x} y={cursorPosition.y} />
        </Wrapper>
      </Layer>
    </div>
  );
};

export default Container;
