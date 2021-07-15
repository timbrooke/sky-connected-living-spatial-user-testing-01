import { FC, ReactElement, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { padLeadingZeros } from "../../../utils/utils";
import BoxWithMessages, { BoxPackage } from "./BoxWithMessages";
import { Observable, Subject } from "rxjs";

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
    <BoxWithMessages
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

function calculateRollout(
  lastRollovers: string[],
  currentRollovers: string[]
): string[] {
  const rollouts: string[] = [];
  lastRollovers.forEach((id) => {
    const result = currentRollovers.find((n) => id === n);
    if (result === undefined) {
      rollouts.push(id);
    }
  });
  return rollouts;
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
}) => {
  const cursorRef = useRef<{ x: number; y: number }>(cursor);
  const boxMessageStreamRef = useRef(new Subject<BoxPackage>());
  const boxDataRef = useRef<BoxData[]>([]);
  const lastRolloversRef = useRef<string[]>([]);

  useEffect(() => {
    const boxIDs = calculateOverBox(cursor, boxDataRef.current);
    boxIDs.forEach((id) => {
      boxMessageStreamRef.current.next({
        id,
        message: "over",
      });
    });
    const rollOuts = calculateRollout(lastRolloversRef.current, boxIDs);
    rollOuts.forEach((id) => {
      boxMessageStreamRef.current.next({
        id,
        message: "off",
      });
    });
    lastRolloversRef.current = boxIDs;
    cursorRef.current = cursor;
  }, [cursor]);

  useEffect(() => {
    const observable = interactionStream$.subscribe((next) => {
      if (next.kind === "click") {
        const boxIDs = calculateOverBox(cursorRef.current, boxDataRef.current);
        boxIDs.forEach((id) => {
          boxMessageStreamRef.current.next({
            id,
            message: "select",
          });
        });
      }
    });
    return () => {
      observable.unsubscribe();
    };
  }, [interactionStream$]);

  const boxData = generateBoxData(
    calculateSizing(columns, rows, width, height, borderRatio)
  );

  boxDataRef.current = boxData;
  const boxes = createBoxesFromData(
    boxData,
    boxMessageStreamRef.current as Observable<BoxPackage>
  );

  return (
    <Container width={width} height={height}>
      {boxes}
    </Container>
  );
};

export default Grid;
