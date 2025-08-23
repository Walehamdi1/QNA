import { Box, Paper, Typography } from "@mui/material";

export default function ClientOverview() {
  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Welcome 👋</Typography>
        <Typography sx={{ mt: .5, opacity: .8 }}>
          Use the sidebar to view available formulaires and submit your responses.
        </Typography>
      </Paper>
    </Box>
  );
}
