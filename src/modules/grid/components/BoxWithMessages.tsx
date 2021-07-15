import { FC } from "react";
import { Observable } from "rxjs";
import Box, { BoxProps } from "./Box";

type BoxMessage = "none" | "over" | "selected";
type BoxEvent = {
  id: string;
  message: BoxMessage;
};

type BoxWithActionProps = {
  boxActions$: Observable<BoxEvent>;
} & BoxProps;

const BoxWithActions: FC<BoxWithActionProps> = (props) => {
  const { boxActions$, id, ...remainingProps } = props;
  return <Box id={id} {...remainingProps} />;
};

export default BoxWithActions;
