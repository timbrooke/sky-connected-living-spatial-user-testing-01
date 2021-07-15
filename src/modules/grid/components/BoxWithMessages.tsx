import { FC, useEffect, useRef, useState } from "react";
import { Observable } from "rxjs";

import Box from "./Box";

export type BoxMessage = "over" | "select" | "off" | "unselect";
export type BoxPackage = {
  id: string;
  message: BoxMessage;
};

type BoxWithMessagesProps = {
  boxMessages$: Observable<BoxPackage>;
  x: number;
  y: number;
  width: number;
  height: number;
  corner: number;
  id: string;
  image: string;
};

const BoxWithMessages: FC<BoxWithMessagesProps> = (props) => {
  const { boxMessages$, id, ...remainingProps } = props;
  const [boxScale, setBoxScale] = useState<number>(1);
  const [selected, setSelected] = useState<boolean>(false);
  const [coverOpacity, setCoverOpacity] = useState<number>(1);
  const idRef = useRef<string>(id);

  useEffect(() => {
    const observer = boxMessages$.subscribe((next) => {
      if (next.id === idRef.current) {
        if (next.message === "over") {
          setBoxScale(1.12);
        }
        if (next.message === "off") {
          if (!selected) {
            console.log("NOT SELECTED SHRINKING")
            setBoxScale(1);
          } else {
            console.log("SELECTED GROWING")
            setBoxScale(1.12);
          }
        }
        if (next.message === "select") {
          console.log("Message SELECTED" );

          setBoxScale(1.06);
          setSelected(true);
          //setImmediate(() => {
          //  setBoxScale(1.12);
          //});
        }
      }
    });
    return () => {
      observer.unsubscribe();
    };
  }, [boxMessages$]);

  useEffect(() => {
    idRef.current = id;
  }, [id]);

  return (
    <Box
      id={id}
      {...remainingProps}
      scale={boxScale}
      coverOpacity={coverOpacity}
    />
  );
};

export default BoxWithMessages;
