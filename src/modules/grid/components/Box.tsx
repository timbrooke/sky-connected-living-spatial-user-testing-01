import { FC } from "react";
import styled from "@emotion/styled";

type BoxProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  corner: number;
  id: string;
  image: string;
};

type BoxDivProps = {
  width: number;
  height: number;
  corner: number;
  x: number;
  y: number;
  image: string;
};

const BoxDiv = styled.div<BoxDivProps>`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  border-radius: ${(props) => props.corner}px;
  position: absolute;
  top: ${(props) => props.y}px;
  left: ${(props) => props.x}px;
  background-image: url(${(props) => props.image});
  background-size: cover;
`;

const Box: FC<BoxProps> = ({ id, x, y, width, height, corner, image }) => {
  return (
    <BoxDiv
      x={x}
      y={y}
      width={width}
      height={height}
      corner={corner}
      image={image}
    />
  );
};

export default Box;
