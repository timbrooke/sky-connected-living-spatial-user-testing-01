import styled from "@emotion/styled";
import React, { FC } from "react";

const Layer = styled.div`
  position: absolute;
  width: 100%;
`;
export default Layer;

type FadeableProps = {
  fade: number;
} & React.HTMLAttributes<HTMLDivElement>;

export const Fadeable: FC<FadeableProps> = (props) => {
  const { fade, style, ...remainingProps } = props;
  const display = fade === 0 ? "block" : "none";
  return (
    <Layer
      {...remainingProps}
      style={{ display, ...style, opacity: 1 - fade }}
    />
  );
};

type PositionableProps = {
  x: number;
  y: number;
  width?: number | string;
  height?: number | string;
} & React.HTMLAttributes<HTMLDivElement>;

export const Positionable: FC<PositionableProps> = (props) => {
  const { x, y, style, width, height, ...remainingProps } = props;
  return (
    <div
      {...remainingProps}
      style={{ ...style, width, height, position: "absolute", top: y, left: x }}
    />
  );
};
