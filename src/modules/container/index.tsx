import Grid from "../grid";
import { useEffect, useState } from "react";
import Layer from "./components/Layer";
import Cursor from "./components/Cursor";

const Container = () => {
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
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  });

  return (
    <div>
      <Layer>
        <Grid
          columns={5}
          rows={2}
          width={windowDimensions.width}
          height={windowDimensions.height}
          borderRatio={0.25}
        />
      </Layer>
      <Layer>
        <Cursor x={cursorPosition.x} y={cursorPosition.y} />
      </Layer>
    </div>
  );
};

export default Container;
