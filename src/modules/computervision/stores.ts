import { atom } from "@ixd-group/rx-utils";

export const createStores = () => {
  const contentUrl$ = atom<string>("assets/videos/joker_movie.mp4");
  return {
    contentUrl$,
  };
};

export type Stores = ReturnType<typeof createStores>;
