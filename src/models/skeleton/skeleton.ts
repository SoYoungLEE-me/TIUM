import type { ReactNode } from "react";

export type SkeletonCountProps = {
  count?: number;
};

export type SkeletonPageHeaderProps = {
  withAction?: boolean;
};

export type SkeletonFormCardProps = {
  children: ReactNode;
};

export type SkeletonStatCardsProps = SkeletonCountProps & {
  inline?: boolean;
};

export type SkeletonCardHeaderProps = {
  withAction?: boolean;
};
