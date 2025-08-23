import { Box, Card, CardContent, Typography } from "@mui/material";

export default function AdminOverview() {
  return (
    <Box sx={{ width: "100%" }}>
      {/* Center the content area */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 1, md: 2 } }}>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          }}
        >
          <Card sx={{ bgcolor: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}>
            <CardContent>
              <Typography variant="h6">Welcome</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Use the left nav to manage users, formulaires and questions.
              </Typography>
            </CardContent>
          </Card>
          {/* Add more cards as needed */}
        </Box>
      </Box>
    </Box>
  );
}
