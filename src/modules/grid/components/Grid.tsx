import { FC, ReactElement, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { padLeadingZeros } from "../../../utils/utils";
import { Observable, Subject } from "rxjs";
import SelectableBox, { BoxMessage, BoxPackage } from "./SelectableBox";
import { InteractionMode } from "../../container/types";

export type InteractionMessage = {
  kind: "click" | "unselect all";
};

type GridProps = {
  columns: number;
  rows: number;
  width: number;
  height: number;
  borderRatio: number;
  cursor: { x: number; y: number };
  interactionStream$: Observable<InteractionMessage>;
  interactionMode: InteractionMode;
};

type SizingInfo = {
  boxWidth: number;
  boxHeight: number;
  horzMargin: number;
  vertMargin: number;
  spacing: number;
  columns: number;
  rows: number;
};

type BoxData = {
  id: string;
  x: number;
  y: number;
  image: string;
  boxWidth: number;
  boxHeight: number;
  corner: number;
};

const aspectRatio = 16 / 9;

function calculateSizing(
  columns: number,
  rows: number,
  width: number,
  height: number,
  borderRatio: number
): SizingInfo {
  const horzUnits = columns + (columns + 1) * borderRatio;
  const vertUnits =
    rows / aspectRatio + ((rows + 1) / aspectRatio) * borderRatio;
  const horzUnitSize = width / horzUnits;
  const vertUnitSize = height / vertUnits;
  const unitSize = Math.min(vertUnitSize, horzUnitSize);
  const boxWidth = unitSize;
  const boxHeight = unitSize / aspectRatio;
  const spacing = borderRatio * unitSize;
  const w2 = columns * unitSize + (columns - 1) * unitSize * borderRatio;
  const h2 =
    (rows * unitSize) / aspectRatio + unitSize * (rows - 1) * borderRatio;
  const horzMargin = (width - w2) / 2;
  const vertMargin = (height - h2) / 2;
  return {
    boxWidth,
    boxHeight,
    horzMargin,
    vertMargin,
    spacing,
    columns,
    rows,
  };
}

function generateBoxData({
  boxWidth,
  boxHeight,
  horzMargin,
  vertMargin,
  spacing,
  columns,
  rows,
}: SizingInfo): BoxData[] {
  const boxes: BoxData[] = [];
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      const x = horzMargin + i * (boxWidth + spacing);
      const y = vertMargin + j * (boxHeight + spacing);
      const id = `box-${i}-${j}`;
      const num = padLeadingZeros(i + ((columns * j) % 32), 2);
      const image = `assets/tiles/${num}.jpg`;
      boxes.push({ id, x, y, image, boxWidth, boxHeight, corner: 8 });
    }
  }
  return boxes;
}

function createBoxesFromData(
  boxData: BoxData[],
  boxMessages$: Observable<BoxPackage>
): ReactElement[] {
  return boxData.map((data) => (
    <SelectableBox
      id={data.id}
      key={data.id}
      width={data.boxWidth}
      height={data.boxHeight}
      x={data.x}
      y={data.y}
      corner={data.corner}
      image={data.image}
      boxMessages$={boxMessages$}
    />
  ));
}

function calculateOverBox(
  interactionMode: InteractionMode,
  cursor: { x: number; y: number },
  boxData: BoxData[],
  lastRollovers: string[]
) {
  switch (interactionMode) {
    case "Standard":
      return standardOverBox(cursor, boxData);
    case "Proximity":
      return proximityOverBox(cursor, boxData);
    case "Focus":
      return focusOverBox(cursor, boxData, lastRollovers);
    default:
      return standardOverBox(cursor, boxData);
  }
}

function focusOverBox(
  cursor: { x: number; y: number },
  boxData: BoxData[],
  lastRollovers: string[]
): string[] {
  const rollovers = standardOverBox(cursor, boxData);
  if (rollovers.length === 0) {
    if(lastRollovers.length === 0){
      return ["box-0-0"]
    }
    return lastRollovers;
  } else {
    return rollovers;
  }
}

function proximityOverBox(
  cursor: { x: number; y: number },
  boxData: BoxData[]
): string[] {
  let boxID: string = "";
  let smallestDist = 0;
  boxData.forEach((b) => {
    const dx = Math.abs(cursor.x - (b.x + b.boxWidth / 2));
    const dy = Math.abs(cursor.y - (b.y + b.boxHeight / 2));
    const distPow2 = dx * dx + dy * dy;
    if (boxID === "" || smallestDist > distPow2) {
      boxID = b.id;
      smallestDist = distPow2;
    }
  });
  return [boxID];
}

function standardOverBox(
  cursor: { x: number; y: number },
  boxData: BoxData[]
): string[] {
  const boxIDs: string[] = [];
  boxData.forEach((b) => {
    const inside =
      cursor.x >= b.x &&
      cursor.x <= b.x + b.boxWidth &&
      cursor.y >= b.y &&
      cursor.y <= b.y + b.boxHeight;
    if (inside) {
      boxIDs.push(b.id);
    }
  });
  return boxIDs;
}

function calculateRolloverChanges(
  lastRollovers: string[],
  currentRollovers: string[]
) {
  let rollouts = lastRollovers.filter((x) => !currentRollovers.includes(x));
  let rollovers = currentRollovers.filter((x) => !lastRollovers.includes(x));
  return { rollouts, rollovers };
}

type ContainerProps = {
  width: number;
  height: number;
};

const Container = styled.div<ContainerProps>`
  position: relative;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
`;

const Grid: FC<GridProps> = ({
  width,
  height,
  columns,
  rows,
  borderRatio,
  cursor,
  interactionStream$,
  interactionMode,
}) => {
  const boxMessageStreamRef = useRef(new Subject<BoxPackage>());
  const lastRolloversRef = useRef<string[]>([]);
  const boxDataRef = useRef<BoxData[]>(
    generateBoxData(calculateSizing(columns, rows, width, height, borderRatio))
  );
  const cursorRef = useRef<{ x: number; y: number }>(cursor);
  const selectedBoxesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentOvers = calculateOverBox(
      interactionMode,
      cursor,
      boxDataRef.current,
      lastRolloversRef.current
    );
    const { rollouts, rollovers } = calculateRolloverChanges(
      lastRolloversRef.current,
      currentOvers
    );
    rollouts.forEach((id) => {
      boxMessageStreamRef.current.next({
        id,
        message: "off",
      });
    });
    rollovers.forEach((id) => {
      boxMessageStreamRef.current.next({
        id,
        message: "over",
      });
    });
    lastRolloversRef.current = currentOvers;
    cursorRef.current = cursor;
  }, [cursor]);

  useEffect(() => {
    const observable = interactionStream$.subscribe((next) => {
      if (next.kind === "unselect all") {
        Array.from(selectedBoxesRef.current).forEach((id) => {
          boxMessageStreamRef.current.next({
            id,
            message: "unselect",
          });
        });
        selectedBoxesRef.current.clear();
      }

      if (next.kind === "click") {
        const boxIDs = lastRolloversRef.current;

        boxIDs.forEach((id) => {
          // Toggle Select
          let message: BoxMessage;
          if (selectedBoxesRef.current.has(id)) {
            selectedBoxesRef.current.delete(id);
            message = "unselect";
          } else {
            selectedBoxesRef.current.add(id);
            message = "select";
          }

          boxMessageStreamRef.current.next({
            id,
            message,
          });
        });
      }
    });
    return () => {
      observable.unsubscribe();
    };
  }, [interactionStream$]);

  useEffect(() => {
    boxDataRef.current = generateBoxData(
      calculateSizing(columns, rows, width, height, borderRatio)
    );
  }, [columns, rows, width, height, borderRatio]);

  const boxes = createBoxesFromData(
    boxDataRef.current,
    boxMessageStreamRef.current as Observable<BoxPackage>
  );

  return (
    <Container width={width} height={height}>
      {boxes}
    </Container>
  );
};

export default Grid;
