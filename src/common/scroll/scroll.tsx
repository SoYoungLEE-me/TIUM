import { Box, alpha, type BoxProps } from "@mui/material";

const Scroll = ({ children, sx, ...props }: BoxProps) => {
  return (
    <Box
      {...props}
      sx={[
        (theme) => ({
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "thin",
          scrollbarColor: `${alpha(theme.palette.primary.main, 0.45)} transparent`,
          "&::-webkit-scrollbar": {
            width: 6,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha(theme.palette.primary.main, 0.45),
            borderRadius: 999,
            border: "2px solid transparent",
            backgroundClip: "content-box",
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.65),
            },
          },
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Box>
  );
};

export default Scroll;
