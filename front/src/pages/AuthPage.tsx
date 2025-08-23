// src/pages/AuthPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box, Container, Paper, Tabs, Tab, Typography,
  TextField, InputAdornment, IconButton, Button,
  FormControlLabel, Checkbox, Divider, Stack
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import FacebookIcon from "@mui/icons-material/Facebook";
import { useAuth } from "../state/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const m = searchParams.get("mode");
    if (m === "login" || m === "register") setMode(m);
  }, [searchParams]);

  const onChangeMode = (next: "login" | "register") => {
    setMode(next);
    setSearchParams({ mode: next });
    setErr(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr("Enter a valid email.");
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    if (mode === "register") {
      if (name.trim().length < 2) return setErr("Enter your full name.");
      if (confirm !== password) return setErr("Passwords do not match.");
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        const [firstName, ...rest] = name.trim().split(" ");
        const lastName = rest.join(" ");
        await register({ firstName, lastName, email, password, confirmPassword: confirm || password });
      }
    } catch (error: any) {
      setErr(error?.response?.data?.error || error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
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
      {/* Use Box as a responsive 2-col grid instead of MUI Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          alignItems: "center",
          gap: { xs: 4, md: 6 },
        }}
      >
        {/* LEFT: Auth card */}
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
              <Typography variant="body2" sx={{ color: "rgba(200,208,231,.85)", mb: 3 }}>
                {mode === "login" ? "Sign in to ask & answer" : "Create your account to join the discussion"}
              </Typography>

              {/* Tabs */}
              <Paper
                variant="outlined"
                sx={{
                  bgcolor: "rgba(255,255,255,.06)",
                  borderColor: "rgba(255,255,255,.12)",
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <Tabs
                  value={mode}
                  onChange={(_, v) => onChangeMode(v)}
                  variant="fullWidth"
                  TabIndicatorProps={{ style: { display: "none" } }}
                  sx={{
                    "& .MuiTab-root": { textTransform: "none", color: "#e6e9ff", fontWeight: 600, minHeight: 44 },
                    "& .Mui-selected": {
                      bgcolor: "#fff",
                      color: "#0f172a",
                      borderRadius: 1.2,
                      boxShadow: "0 6px 18px rgba(255,255,255,.12)",
                    },
                  }}
                >
                  <Tab value="login" label="Login" />
                  <Tab value="register" label="Register" />
                </Tabs>
              </Paper>

              {/* Form */}
              <Box component="form" onSubmit={onSubmit}>
                <Stack spacing={2.25}>
                  {mode === "register" && (
                    <Box>
                      <Typography variant="caption" sx={{ color: "#dde3ffcc" }}>Full name</Typography>
                      <TextField
                        fullWidth
                        placeholder="Jane Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        size="medium"
                        sx={{ mt: 0.5, "& .MuiOutlinedInput-root": { bgcolor: "rgba(255,255,255,.06)", color: "#e7ecff" } }}
                      />
                    </Box>
                  )}

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

                  <Box>
                    <Typography variant="caption" sx={{ color: "#dde3ffcc" }}>Password</Typography>
                    <TextField
                      fullWidth
                      placeholder="••••••••"
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      size="medium"
                      sx={{ mt: 0.5, "& .MuiOutlinedInput-root": { bgcolor: "rgba(255,255,255,.06)", color: "#e7ecff" } }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPass(s => !s)} edge="end" aria-label="toggle password">
                              {showPass ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  {mode === "register" && (
                    <Box>
                      <Typography variant="caption" sx={{ color: "#dde3ffcc" }}>Confirm Password</Typography>
                      <TextField
                        fullWidth
                        placeholder="••••••••"
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        autoComplete="new-password"
                        size="medium"
                        sx={{ mt: 0.5, "& .MuiOutlinedInput-root": { bgcolor: "rgba(255,255,255,.06)", color: "#e7ecff" } }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowConfirm(s => !s)} edge="end" aria-label="toggle confirm password">
                                {showConfirm ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  )}

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <FormControlLabel control={<Checkbox sx={{ color: "#9aa3c8" }} />} label={<Typography variant="body2">Remember me</Typography>} />
                    <Button variant="text" sx={{ textTransform: "none" }} onClick={() => navigate("/forgot-password")}>
                      Forgot password?
                    </Button>
                  </Stack>

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
                    {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
                  </Button>

                  {/* Divider */}
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
                      or continue with
                    </Typography>
                  </Box>

                  {/* Providers */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                      gap: 1.5,
                    }}
                  >
                    <Button fullWidth variant="outlined" startIcon={<GoogleIcon />}>Google</Button>
                    <Button fullWidth variant="outlined" startIcon={<GitHubIcon />}>GitHub</Button>
                    <Button fullWidth variant="outlined" startIcon={<FacebookIcon />}>Facebook</Button>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* RIGHT: marketing copy (hidden on mobile) */}
        <Box sx={{ display: { xs: "none", md: "block" }, px: { md: 2 } }}>
          <Typography variant="h3" fontWeight={800} mb={1.5}>
            Ask smarter.{" "}
            <Box component="span" sx={{ background: "linear-gradient(90deg,#a5b4fc,#f0abfc)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              Answer faster.
            </Box>
          </Typography>
          <Typography sx={{ color: "rgba(200,208,231,.85)", mb: 2, maxWidth: 640 }}>
            Join a focused community for concise questions and high-quality answers. Earn reputation,
            build a profile, and collaborate in real time.
          </Typography>
          <Stack spacing={1.25} sx={{ color: "rgba(200,208,231,.85)" }}>
            <Typography variant="body2">• No distractions—just knowledge.</Typography>
            <Typography variant="body2">• Elegant UI with dark mode first.</Typography>
            <Typography variant="body2">• Secure auth and role-based access.</Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: "rgba(154,163,200,.9)", display: "block", mt: 6 }}>
            © {new Date().getFullYear()} Q&A Hub — All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Container>
  </Box>
);

};

export default AuthPage;
