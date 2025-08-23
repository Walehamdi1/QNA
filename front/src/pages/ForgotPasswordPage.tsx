// src/pages/ForgotPasswordPage.tsx
import React, { useState } from "react";
import {
  Box, Container, Paper, Typography, TextField,
  Button, Divider, Stack
} from "@mui/material";
import { useNavigate } from "react-router-dom";
// adjust import if your service path/name differs
import { forgotPassword } from "../services/passwordReset";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr("Enter a valid email.");
    setLoading(true);
    try {
      await forgotPassword(email);
      setOk("If the email exists, a reset link and a 6-digit code has been sent.");
    } catch {
      // keep generic for privacy
      setOk("If the email exists, a reset link and a 6-digit code has been sent.");
    } finally {
      setLoading(false);
    }
  };

  const goToReset = () => {
    const qs = email ? `?email=${encodeURIComponent(email)}` : "";
    navigate(`/reset-password${qs}`);
  };

  return (
    <Box
      component="main"
      sx={{
        bgcolor: "#12161c",
        color: "#e9edf7",
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        alignItems: { xs: "flex-start", md: "center" },
        py: { xs: 4, md: 6 },
        position: "relative",
      }}
    >
      {/* Background glows */}
      <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: "-10%",
            width: 520,
            height: 520,
            transform: "translateX(-50%)",
            borderRadius: "50%",
            filter: "blur(40px)",
            background: "radial-gradient(closest-side, rgba(99,102,241,.25), transparent 60%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: "-8%",
            bottom: "-10%",
            width: 480,
            height: 480,
            borderRadius: "50%",
            filter: "blur(40px)",
            background: "radial-gradient(closest-side, rgba(168,85,247,.18), transparent 60%)",
          }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Two-column responsive layout using Box grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            alignItems: "center",
            gap: { xs: 4, md: 6 },
          }}
        >
          {/* LEFT: Card */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Paper
              elevation={8}
              sx={{
                width: "100%",
                maxWidth: 560,
                borderRadius: 3,
                bgcolor: "rgba(26,32,44,.95)",
                border: "1px solid rgba(255,255,255,.08)",
              }}
            >
              <Box p={{ xs: 3, md: 4 }}>
                {/* Brand */}
                <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 1.5,
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 800,
                      color: "#fff",
                      background: "linear-gradient(135deg,#6366f1,#a855f7)",
                      boxShadow: "0 8px 22px rgba(99,102,241,.35)",
                    }}
                  >
                    Q?
                  </Box>
                  <Typography variant="h4" fontWeight={800}>Q&A Hub</Typography>
                </Stack>

                <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                  Forgot your password?
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(200,208,231,.85)", mb: 3 }}>
                  Enter your email and we’ll send you a reset link and a 6-digit code.
                </Typography>

                <Box component="form" onSubmit={onSubmit}>
                  <Stack spacing={2.25}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#dde3ffcc" }}>Email</Typography>
                      <TextField
                        fullWidth
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        size="medium"
                        sx={{ mt: 0.5, "& .MuiOutlinedInput-root": { bgcolor: "rgba(255,255,255,.06)", color: "#e7ecff" } }}
                      />
                    </Box>

                    {err && (
                      <Paper
                        variant="outlined"
                        sx={{
                          borderColor: "rgba(239,68,68,.35)",
                          bgcolor: "rgba(239,68,68,.12)",
                          color: "#fecaca",
                          p: 1.25,
                          borderRadius: 1.5,
                        }}
                      >
                        <Typography variant="body2">{err}</Typography>
                      </Paper>
                    )}
                    {ok && (
                      <Paper
                        variant="outlined"
                        sx={{
                          borderColor: "rgba(34,197,94,.35)",
                          bgcolor: "rgba(34,197,94,.12)",
                          color: "#bbf7d0",
                          p: 1.25,
                          borderRadius: 1.5,
                        }}
                      >
                        <Typography variant="body2">{ok}</Typography>
                      </Paper>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      sx={{
                        py: 1.25,
                        borderRadius: 2,
                        color: "#fff",
                        fontWeight: 700,
                        backgroundImage: "linear-gradient(90deg,#6366f1,#a855f7)",
                        boxShadow: "0 12px 30px rgba(99,102,241,.35)",
                        "&:hover": { filter: "brightness(1.05)" },
                      }}
                    >
                      {loading ? "Sending…" : "Send reset email"}
                    </Button>

                    <Box position="relative" textAlign="center">
                      <Divider sx={{ borderColor: "rgba(255,255,255,.15)", mb: -1.2 }} />
                      <Typography
                        variant="caption"
                        sx={{
                          position: "relative",
                          top: -10,
                          px: 1,
                          bgcolor: "rgba(26,32,44,.95)",
                          color: "rgba(207,214,240,.7)",
                        }}
                      >
                        already have a code?
                      </Typography>
                    </Box>

                    <Button variant="outlined" onClick={goToReset}>
                      Enter code & reset password
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* RIGHT: copy */}
          <Box sx={{ display: { xs: "none", md: "block" }, px: { md: 2 } }}>
            <Typography variant="h3" fontWeight={800} mb={1.5}>
              Recover access.{" "}
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(90deg,#a5b4fc,#f0abfc)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Securely.
              </Box>
            </Typography>
            <Typography sx={{ color: "rgba(200,208,231,.85)", mb: 2, maxWidth: 640 }}>
              We’ll email you a code that expires in 15 minutes. Don’t share it.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;
