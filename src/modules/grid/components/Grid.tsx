import { FC, ReactElement } from "react";
import Box from "./Box";
import styled from "@emotion/styled";
import {padLeadingZeros} from "../../../utils/utils";

type GridProps = {
  columns: number;
  rows: number;
  width: number;
  height: number;
  borderRatio: number;
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

function generateBoxes({
  boxWidth,
  boxHeight,
  horzMargin,
  vertMargin,
  spacing,
  columns,
  rows,
}: SizingInfo): ReactElement[] {
  const boxes = [];
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      const x = horzMargin + i * (boxWidth + spacing);
      const y = vertMargin + j * (boxHeight + spacing);
      const id = `box-${i}-${j}`;
      const num = padLeadingZeros(i + (columns * j) % 32,2);
      const image = `assets/tiles/${num}.jpg`
      const box = (
        <Box
          id={id}
          key={id}
          width={boxWidth}
          height={boxHeight}
          x={x}
          y={y}
          corner={8}
          image={image}
        />
      );
      boxes.push(box);
    }
  }
  return boxes;
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

const Grid: FC<GridProps> = ({ width, height, columns, rows, borderRatio }) => {
  const boxes = generateBoxes(
    calculateSizing(columns, rows, width, height, borderRatio)
  );
  return (
    <Container width={width} height={height}>
      {boxes}
    </Container>
  );
};

export default Grid;
