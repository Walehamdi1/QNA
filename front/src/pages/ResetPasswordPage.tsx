// src/pages/ResetPasswordPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box, Container, Paper, Typography, TextField, Button,
  Divider, Stack, IconButton, InputAdornment
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate, useSearchParams } from "react-router-dom";
// adjust imports if your service names/paths differ
import { verifyResetCode, resetPassword } from "../services/passwordReset";

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [step, setStep] = useState<"verify" | "reset">("verify");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // auto-verify if opened from the email link with both params
    const auto = async () => {
      if (email && code) {
        setLoading(true);
        setErr(null);
        setOk(null);
        try {
          const r = await verifyResetCode(email, code);
          if (r.valid) {
            setStep("reset");
            setOk("Code verified. You can set a new password.");
          } else {
            setErr(r.error || "Invalid code.");
          }
        } catch (e: any) {
          setErr(e?.response?.data?.error || "Invalid or expired code.");
        } finally {
          setLoading(false);
        }
      }
    };
    auto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setOk(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr("Enter a valid email.");
    if (!/^\d{6}$/.test(code)) return setErr("Enter the 6-digit code.");
    setLoading(true);
    try {
      const r = await verifyResetCode(email, code);
      if (r.valid) {
        setStep("reset");
        setOk("Code verified. You can set a new password.");
      } else {
        setErr(r.error || "Invalid code.");
      }
    } catch (error: any) {
      setErr(error?.response?.data?.error || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setOk(null);
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    if (password !== confirm) return setErr("Passwords do not match.");

    setLoading(true);
    try {
      const res = await resetPassword({ email, code, newPassword: password, confirmPassword: confirm });
      if (res?.error) {
        setErr(res.error);
      } else {
        setOk("Password reset successfully. Redirecting to sign in…");
        setTimeout(() => navigate("/auth?mode=login"), 1100);
      }
    } catch (error: any) {
      setErr(error?.response?.data?.error || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  const goToForgot = () => navigate("/forgot-password");

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

                {step === "verify" ? (
                  <>
                    <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                      Verify your code
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(200,208,231,.85)", mb: 3 }}>
                      Enter the 6-digit code we emailed you.
                    </Typography>

                    <Box component="form" onSubmit={onVerify}>
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

                        <Box>
                          <Typography variant="caption" sx={{ color: "#dde3ffcc" }}>6-digit code</Typography>
                          <TextField
                            fullWidth
                            placeholder="123456"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 6 }}
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
                          {loading ? "Verifying…" : "Verify code"}
                        </Button>

                        <Divider sx={{ borderColor: "rgba(255,255,255,.15)" }} />
                        <Button variant="outlined" onClick={goToForgot} disabled={loading}>
                          Request a new code
                        </Button>
                      </Stack>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                      Set a new password
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(200,208,231,.85)", mb: 3 }}>
                      Create a strong password you’ll remember.
                    </Typography>

                    <Box component="form" onSubmit={onReset}>
                      <Stack spacing={2.25}>
                        <Box>
                          <Typography variant="caption" sx={{ color: "#dde3ffcc" }}>New password</Typography>
                          <TextField
                            fullWidth
                            placeholder="••••••••"
                            type={showPass ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
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

                        <Box>
                          <Typography variant="caption" sx={{ color: "#dde3ffcc" }}>Confirm password</Typography>
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
                          {loading ? "Saving…" : "Reset password"}
                        </Button>
                      </Stack>
                    </Box>
                  </>
                )}
              </Box>
            </Paper>
          </Box>

          {/* RIGHT: copy */}
          <Box sx={{ display: { xs: "none", md: "block" }, px: { md: 2 } }}>
            <Typography variant="h3" fontWeight={800} mb={1.5}>
              Reset securely.{" "}
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(90deg,#a5b4fc,#f0abfc)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Back to flow.
              </Box>
            </Typography>
            <Typography sx={{ color: "rgba(200,208,231,.85)", mb: 2, maxWidth: 640 }}>
              Codes expire in 15 minutes. If yours expired, request a new one.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;
