import { useRef, type PointerEvent, type WheelEvent } from "react";
import { Box, IconButton, Tab, Tabs, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export type InquiryTabItem = {
  id: string;
  label: string;
  closable: boolean;
};

type InquiryTabBarProps = {
  tabs: InquiryTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  onCloseTab: (id: string) => void;
};

/**
 * 가로 스크롤 탭바 — 스크롤바 숨김.
 * 모바일: 터치 드래그 / PC: Shift+드래그, Shift+휠
 */
const InquiryTabBar = ({
  tabs,
  activeId,
  onChange,
  onCloseTab,
}: InquiryTabBarProps) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    scrollLeft: number;
    requireShift: boolean;
  } | null>(null);

  const onWheel = (e: WheelEvent) => {
    const el = scrollerRef.current;
    if (!el) return;
    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      el.scrollLeft += e.deltaY + e.deltaX;
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    const el = scrollerRef.current;
    if (!el) return;
    const isTouch = e.pointerType === "touch";
    if (!isTouch && !e.shiftKey) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      requireShift: !isTouch,
    };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    const el = scrollerRef.current;
    const drag = dragRef.current;
    if (!el || !drag?.active) return;
    if (drag.requireShift && !e.shiftKey) return;
    el.scrollLeft = drag.scrollLeft - (e.clientX - drag.startX);
  };

  const endDrag = (e: PointerEvent) => {
    const el = scrollerRef.current;
    if (el?.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
  };

  return (
    <Box
      ref={scrollerRef}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      sx={{
        display: "flex",
        overflowX: "auto",
        overflowY: "hidden",
        borderBottom: 1,
        borderColor: "divider",
        px: 1,
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": { display: "none" },
        cursor: "default",
        touchAction: "pan-x",
      }}
    >
      <Tabs
        value={activeId}
        onChange={(_, value: string) => onChange(value)}
        variant="scrollable"
        scrollButtons={false}
        sx={{
          minHeight: 44,
          flexShrink: 0,
          "& .MuiTabs-indicator": { height: 2 },
          "& .MuiTab-root": {
            minHeight: 44,
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13,
            px: 1.5,
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            disableRipple
            label={
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  maxWidth: 180,
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.label}
                </Typography>
                {tab.closable ? (
                  <IconButton
                    size="small"
                    component="span"
                    aria-label="탭 닫기"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    sx={{ p: 0.25 }}
                  >
                    <CloseRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                ) : null}
              </Box>
            }
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default InquiryTabBar;
