import { Box, Paper, Typography } from "@mui/material";

export default function FournisseurOverview() {
  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Welcome 👋</Typography>
        <Typography sx={{ mt: .5, opacity: .8 }}>
          Open a formulaire to review client answers and leave your comments.
        </Typography>
      </Paper>
    </Box>
  );
}
