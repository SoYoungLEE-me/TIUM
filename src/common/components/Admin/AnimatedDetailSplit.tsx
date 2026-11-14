import { Box } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useState, type ReactNode } from "react";

type AnimatedDetailSplitProps = {
  /** 메인(목록/테이블) 영역 */
  main: ReactNode;
  /** 상세 패널. null이면 닫힌 상태 */
  detail: ReactNode | null;
  detailAnchorId?: string;
  mainFlex?: number;
  detailFlex?: number;
  detailMaxWidth?: number;
  durationMs?: number;
};

/**
 * lg+: 상세가 오른쪽에서 밀려 들어오고, 메인은 줄어듦 / 닫히면 반대.
 * xs: 세로 스택 — 열릴 때 아래로 펼쳐짐.
 */
const AnimatedDetailSplit = ({
  main,
  detail,
  detailAnchorId,
  mainFlex = 1.55,
  detailFlex = 1,
  detailMaxWidth = 420,
  durationMs = 320,
}: AnimatedDetailSplitProps) => {
  const open = detail != null;
  const [cachedDetail, setCachedDetail] = useState(detail);
  if (detail != null && detail !== cachedDetail) {
    setCachedDetail(detail);
  }
  const renderedDetail = detail ?? cachedDetail;

  const layoutTransition = (theme: Theme) =>
    theme.transitions.create(
      [
        "flex-grow",
        "flex-basis",
        "max-width",
        "opacity",
        "margin",
        "max-height",
      ],
      {
        duration: durationMs,
        easing: theme.transitions.easing.easeInOut,
      },
    );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        alignItems: "stretch",
        gap: { xs: open ? 2 : 0, lg: open ? 2 : 0 },
        minHeight: { lg: 640 },
        transition: (theme) =>
          theme.transitions.create("gap", { duration: durationMs }),
      }}
    >
      <Box
        sx={{
          flexGrow: { xs: 0, lg: open ? mainFlex : 1 },
          flexShrink: 1,
          flexBasis: { xs: "auto", lg: 0 },
          minWidth: 0,
          height: { lg: "100%" },
          transition: layoutTransition,
        }}
      >
        {main}
      </Box>

      <Box
        id={detailAnchorId}
        aria-hidden={!open}
        sx={{
          flexGrow: { xs: 0, lg: open ? detailFlex : 0 },
          flexShrink: 0,
          flexBasis: { xs: "auto", lg: open ? detailMaxWidth : 0 },
          width: { xs: "100%", lg: open ? detailMaxWidth : 0 },
          maxWidth: { xs: "100%", lg: open ? detailMaxWidth : 0 },
          maxHeight: {
            xs: open ? 2400 : 0,
            lg: "none",
          },
          minWidth: 0,
          overflow: "hidden",
          opacity: open ? 1 : 0,
          scrollMarginTop: 16,
          pointerEvents: open ? "auto" : "none",
          transition: layoutTransition,
        }}
      >
        {renderedDetail ? (
          <Box
            sx={{
              height: "100%",
              width: { xs: "100%", lg: detailMaxWidth },
              transform: {
                xs: open ? "translateY(0)" : "translateY(-12px)",
                lg: open ? "translateX(0)" : "translateX(28px)",
              },
              transition: (theme) =>
                theme.transitions.create(["transform", "opacity"], {
                  duration: durationMs,
                  easing: theme.transitions.easing.easeInOut,
                }),
            }}
          >
            {renderedDetail}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default AnimatedDetailSplit;
