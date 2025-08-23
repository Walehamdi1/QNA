// src/app/.../UsersPage.tsx
import { useEffect, useState } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Tooltip, Typography, FormHelperText
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { UserService } from "../../../services/UserService";
import { AuthService } from "../../../services/AuthServices";


export default function UsersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await UserService.list();
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const startCreate = () => { setEdit(null); setOpen(true); };
  const startEdit = (row: any) => { setEdit(row); setOpen(true); };
  const close = () => setOpen(false);

  const onDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    await UserService.remove(id);
    fetchData();
  };

  const [form, setForm] = useState<any>({
    firstName: "", lastName: "", email: "", password: "", role: "CLIENT",
  });

  useEffect(() => {
    if (open) {
      setForm(
        edit
          ? { ...edit, password: "" }
          : { firstName: "", lastName: "", email: "", password: "", role: "CLIENT" }
      );
    }
  }, [open, edit]);

  const save = async () => {
    if (edit) {
      const { firstName, lastName, email, role, enabled } = form;
      await UserService.update(edit.userId, { firstName, lastName, email, role, enabled });
    } else {
      const { firstName, lastName, email, password, role } = form;
      if (!password || password.length < 6)
        return alert("Password (min 6) is required when creating a user.");
      await UserService.create({ firstName, lastName, email, password, role, enabled: true });
    }
    close(); fetchData();
  };

  // ===== NEW: Change Password dialog state/handlers =====
  const [pwOpen, setPwOpen] = useState(false);
  const [pwTarget, setPwTarget] = useState<any | null>(null);
  const [pwForm, setPwForm] = useState({ newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);

  const openPwDialog = (row: any) => {
    setPwTarget(row);
    setPwForm({ newPassword: "", confirmPassword: "" });
    setPwOpen(true);
  };
  const closePwDialog = () => setPwOpen(false);

  const submitPw = async () => {
    const { newPassword, confirmPassword } = pwForm;
    if (!newPassword || newPassword.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    try {
      setPwSaving(true);
      await AuthService.setPassword(pwTarget.userId, newPassword, confirmPassword);
      alert(`Password updated for ${pwTarget.email}`);
      setPwOpen(false);
    } catch (e: any) {
      alert(e?.response?.data?.error ?? e?.message ?? "Failed to update password");
    } finally {
      setPwSaving(false);
    }
  };
  // =====================================================

  return (
    <Box sx={{ width: "100%" }}>
      {/* Center the content area */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 1, md: 2 } }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" sx={{ flex: 1 }}>User management</Typography>
          <Tooltip title="Refresh"><IconButton onClick={fetchData}><RefreshIcon /></IconButton></Tooltip>
          <Button startIcon={<AddIcon />} variant="contained" onClick={startCreate} sx={{ ml: 1 }}>
            New user
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>First</TableCell>
                <TableCell>Last</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Enabled</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.userId} hover sx={{ "& td": { py: 1.25 } }}>
                  <TableCell>{r.userId}</TableCell>
                  <TableCell>{r.firstName}</TableCell>
                  <TableCell>{r.lastName}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.role}</TableCell>
                  <TableCell>{String(r.enabled)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit user">
                      <IconButton size="small" onClick={() => startEdit(r)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete user">
                      <IconButton size="small" onClick={() => onDelete(r.userId)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Change password">
                      <IconButton size="small" onClick={() => openPwDialog(r)} sx={{ ml: 0.5 }}>
                        <VpnKeyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && !loading && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography sx={{ opacity: 0.7 }}>No users.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Create / Edit dialog */}
      <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
        <DialogTitle>{edit ? "Edit user" : "New user"}</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              pt: 1,
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <TextField
              fullWidth label="First name" value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <TextField
              fullWidth label="Last name" value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField
                fullWidth label="Email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Box>
            {!edit && (
              <Box sx={{ gridColumn: "1 / -1" }}>
                <TextField
                  fullWidth label="Password" type="password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </Box>
            )}
            <TextField
              fullWidth select label="Role" value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="CLIENT">CLIENT</MenuItem>
              <MenuItem value="FOURNISSEUR">FOURNISSEUR</MenuItem>
            </TextField>
            {edit && (
              <TextField
                fullWidth select label="Enabled" value={String(form.enabled ?? true)}
                onChange={(e) => setForm({ ...form, enabled: e.target.value === "true" })}
              >
                <MenuItem value="true">true</MenuItem>
                <MenuItem value="false">false</MenuItem>
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button variant="contained" onClick={save}>{edit ? "Save" : "Create"}</Button>
        </DialogActions>
      </Dialog>

      {/* Change Password dialog */}
      <Dialog open={pwOpen} onClose={closePwDialog} fullWidth maxWidth="xs">
        <DialogTitle>Change password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "grid", gap: 2 }}>
            <TextField
              fullWidth
              label="New password"
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            />
            <TextField
              fullWidth
              label="Confirm password"
              type="password"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
            />
            <FormHelperText>Minimum 6 characters.</FormHelperText>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closePwDialog} disabled={pwSaving}>Cancel</Button>
          <Button variant="contained" onClick={submitPw} disabled={pwSaving}>
            {pwSaving ? "Saving..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
