import { FC, useEffect, useRef } from "react";
import { Positionable } from "../Layer";
import { Observable } from "rxjs";
import { InteractionMessage } from "../../../grid/components/Grid";

type CursorProps = {
  x: number;
  y: number;
  visible: boolean;
  interactionStream$: Observable<InteractionMessage>;
};

const cursorAnimation = [
  { transform: "scale(1)" },
  { transform: "scale(0.8)", offset:0.333 },
  { transform: "scale(1)" },
];

const animationTiming = {
  duration: 150,
  iterations: 1,
};

const Cursor: FC<CursorProps> = ({ x, y, visible, interactionStream$ }) => {
  const animationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const subscription = interactionStream$.subscribe((next) => {
      if (next.kind === "click" && animationRef.current) {
        animationRef.current.animate(cursorAnimation, animationTiming);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [interactionStream$]);

  if (!visible) return <Positionable x={0} y={0} />;

  return (
    <Positionable x={x - 42} y={y - 42}>
      <div ref={animationRef}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          width={84}
          height={84}
        >
          <defs>
            <filter
              id="a"
              width="165%"
              height="165%"
              x="-32.5%"
              y="-27.5%"
              filterUnits="objectBoundingBox"
            >
              <feMorphology
                in="SourceAlpha"
                operator="dilate"
                radius="1.5"
                result="shadowSpreadOuter1"
              />
              <feOffset
                dy={3}
                in="shadowSpreadOuter1"
                result="shadowOffsetOuter1"
              />
              <feGaussianBlur
                in="shadowOffsetOuter1"
                result="shadowBlurOuter1"
                stdDeviation="4.5"
              />
              <feComposite
                in="shadowBlurOuter1"
                in2="SourceAlpha"
                operator="out"
                result="shadowBlurOuter1"
              />
              <feColorMatrix
                in="shadowBlurOuter1"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"
              />
            </filter>
            <circle id="b" cx={40} cy={40} r={30} />
          </defs>
          <g fill="none" fillRule="evenodd" transform="translate(2 -1)">
            <use fill="#000" filter="url(#a)" xlinkHref="#b" />
            <use fill="#FFF" fillOpacity=".501" xlinkHref="#b" />
          </g>
        </svg>
      </div>
    </Positionable>
  );
};

export default Cursor;
