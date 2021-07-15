import { FC } from "react";
import styled from "@emotion/styled";

type BoxProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  corner: number;
  id: string;
};

type BoxDivProps = {
  width: number;
  height: number;
  corner: number;
  x: number;
  y: number;
};

const BoxDiv = styled.div<BoxDivProps>`
  width: ${(props) => props.width - 4}px;
  height: ${(props) => props.height - 4}px;
  border-radius: ${(props) => props.corner}px;
  border: 2px solid white;
  position: absolute;
  top: ${(props) => props.y}px;
  left: ${(props) => props.x}px;
  background-color: aqua;
`;

const Box: FC<BoxProps> = ({ id, x, y, width, height, corner }) => {
  return <BoxDiv x={x} y={y} width={width} height={height} corner={corner} />;
};

export default Box;
