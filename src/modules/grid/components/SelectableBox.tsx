import { FC, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { Observable } from "rxjs";
import { motion, useAnimation } from "framer-motion";

export type BoxMessage = "over" | "select" | "off" | "unselect";

export type BoxPackage = {
  id: string;
  message: BoxMessage;
};
export type BoxProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  corner: number;
  id: string;
  image: string;
  boxMessages$: Observable<BoxPackage>;
};

type BoxDivProps = {
  width: number;
  height: number;
  corner: number;
  image: string;
};

type CoverProps = {
  width: number;
  height: number;
  corner: number;
};

const BoxDiv = styled.div<BoxDivProps>`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  border-radius: ${(props) => props.corner}px;
  position: absolute;
  background-image: url(${(props) => props.image});
  background-size: cover;
`;

const Cover = styled.div<CoverProps>`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  border-radius: ${(props) => props.corner}px;
  position: absolute;
  background: black;
`;

const Box: FC<BoxProps> = ({
  id,
  x,
  y,
  width,
  height,
  corner,
  image,
  boxMessages$,
}) => {
  const selectedRef = useRef<boolean>(false);
  const controlsA = useAnimation();
  const controlsB = useAnimation();

  async function pushAnimation() {
    await controlsA.start({
      scale: 1.06,
      transition: { duration: 0.05, ease: "easeInOut" },
    });
    await controlsA.start({
      scale: 1.12,
      transition: { duration: 0.3, ease: "easeInOut" },
    });
  }

  useEffect(() => {
    const observable = boxMessages$.subscribe((next: BoxPackage) => {
      if (next.id === id) {
        switch (next.message) {
          case "over":
            controlsA.start({
              scale: 1.12,
              transition: { duration: 0.3, ease: "easeInOut" },
            });
            break;
          case "off":
            if (!selectedRef.current) {
              controlsA.start({
                scale: 1,
                transition: { duration: 0.4, ease: "easeInOut" },
              });
            }
            break;
          case "select":
            pushAnimation();
            selectedRef.current = true;
            controlsB.start({
              opacity: 0.3,
              transition: { duration: 0.3, ease: "easeInOut" },
            });
            break;
          case "unselect":
            pushAnimation();
            selectedRef.current = false;
            controlsB.start({
              opacity: 0.0,
              transition: { duration: 0.3, ease: "easeInOut" },
            });
            break;
          default:
          // do nothing
        }
      }
    });
    return () => {
      observable.unsubscribe();
    };
  }, []);

  return (
    <motion.div
      animate={controlsA}
      style={{
        width,
        height,
        position: "absolute",
        top: y,
        left: x,
      }}
    >
      <BoxDiv width={width} height={height} corner={corner} image={image} />
      <motion.div
        animate={controlsB}
        initial={{ opacity: 0 }}
        style={{
          width,
          height,
          borderRadius: corner,
          position: "absolute",
          background: "black",
        }}
      />
    </motion.div>
  );
};

export default Box;
