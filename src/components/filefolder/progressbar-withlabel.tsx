import { Box, LinearProgress, Typography } from "@suid/material";
type LinearProgressProps = {
  value: number;
};
export function LinearProgressWithLabel(props: LinearProgressProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" value={props.value} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}
