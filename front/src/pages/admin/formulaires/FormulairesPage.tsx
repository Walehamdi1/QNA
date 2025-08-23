import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Tooltip, Typography,
  Checkbox, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, Stack
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { FormulaireService } from "../../../services/FormulaireService";
import { QuestionService } from "../../../services/QuestionService";

type Question = {
  id_Q: number;
  contenu: string;
  type?: string;
  formulaire?: { id_F: number; titre?: string } | null;
};

export default function FormulairesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ titre: "", userId: "" });

  // --- questions section state (only used in edit mode) ---
  const [qLoading, setQLoading] = useState(false);
  const [qType, setQType] = useState<string>("");
  const [qSearch, setQSearch] = useState<string>("");
  const [page, setPage] = useState(0);
  const size = 10;
  const [qTotalPages, setQTotalPages] = useState(0);
  const [qItems, setQItems] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set()); // checked questions (final selection)

  const toArray = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.content)) return data.content;
    return [];
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await FormulaireService.list();
      setRows(toArray(data));
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  const startCreate = () => {
    setEdit(null);
    setForm({ titre: "", userId: "" });
    setOpen(true);
  };

  const startEdit = async (row: any) => {
    setEdit(row);
    setForm({ titre: row.titre, userId: row?.user?.userId ?? "" });
    setOpen(true);

    // prepare questions tab
    setSelectedIds(new Set());
    setPage(0);
    setQType("");
    setQSearch("");

    // fetch existing selections for this formulaire
    try {
      const current = await FormulaireService.getQuestions(row.id_F);
      const ids = Array.isArray(current)
        ? current.map((q: any) => (q?.id_Q ?? q)) // allow array of ids or array of objects
        : [];
      setSelectedIds(new Set(ids));
    } catch (e) {
      console.error(e);
      setSelectedIds(new Set());
    }

    // load first page of questions
    loadQuestions(0, "", "");
  };

  const close = () => {
    setOpen(false);
    setTimeout(() => setForm({ titre: "", userId: "" }), 0);
  };

  const save = async () => {
    try {
      if (edit) {
        // 1) update the title
        await FormulaireService.update(edit.id_F, { ...edit, titre: form.titre });
        // 2) push selection (replace membership)
        await FormulaireService.setQuestions(edit.id_F, Array.from(selectedIds));
      } else {
        if (!form.userId) return alert("User ID is required for creation.");
        await FormulaireService.create(Number(form.userId), { titre: form.titre });
      }
      close();
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Action failed. Please try again.");
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this formulaire?")) return;
    try { await FormulaireService.remove(id); fetchData(); }
    catch (e) { console.error(e); alert("Delete failed."); }
  };

  // ------------------------------
  // Questions: paged fetch + filter
  // ------------------------------
  const loadQuestions = async (p = page, type = qType, q = qSearch) => {
    setQLoading(true);
    try {
      const data = await QuestionService.search({
        type: type || undefined,
        q: q || undefined,
        page: p,
        size,
      });
      const items: Question[] = toArray(data);
      setQItems(items);
      // support both Page and array fallback
      if (typeof data?.totalPages === "number") setQTotalPages(data.totalPages);
      else setQTotalPages(1);
    } catch (e) {
      console.error(e);
      setQItems([]);
      setQTotalPages(1);
    } finally {
      setQLoading(false);
    }
  };

  useEffect(() => {
    if (open && edit) {
      loadQuestions(page, qType, qSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const toggleChecked = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const dataRows = Array.isArray(rows) ? rows : [];

  return (
    <Box sx={{ width: "100%" }}>
      {/* Center the content area */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 1, md: 2 } }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
          <Typography variant="h5" sx={{ flex: 1 }}>Formulaire</Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} disabled={loading}><RefreshIcon /></IconButton>
          </Tooltip>
          <Button startIcon={<AddIcon />} variant="contained" onClick={startCreate}>NEW</Button>
        </Box>

        <TableContainer component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5}><Typography sx={{ opacity: 0.8 }}>Loading…</Typography></TableCell>
                </TableRow>
              )}

              {!loading && dataRows.map((r) => (
                <TableRow key={r.id_F} hover sx={{ "& td": { py: 1.25 } }}>
                  <TableCell>{r.id_F}</TableCell>
                  <TableCell>{r.titre}</TableCell>
                  <TableCell>{r.user?.email ?? "-"}</TableCell>
                  <TableCell>{r.dateCreation ? new Date(r.dateCreation).toLocaleString() : "-"}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => startEdit(r)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => onDelete(r.id_F)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && !dataRows.length && (
                <TableRow>
                  <TableCell colSpan={5}><Typography sx={{ opacity: 0.7 }}>No items.</Typography></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Dialog */}
      <Dialog open={open} onClose={close} fullWidth maxWidth="md">
        <DialogTitle>{edit ? "Edit formulaire" : "New formulaire"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.8 }}>
            {/* Title / Owner */}
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: edit ? "1fr" : "1fr 1fr" } }}>
              <TextField
                fullWidth
                label="Title"
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
              />
              {!edit && (
                <TextField
                  fullWidth
                  label="User ID (owner)"
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                />
              )}
            </Box>

            {/* Questions selector (only in Edit) */}
            {edit && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1">Questions</Typography>

                {/* Filters */}
                <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                  <TextField
                    label="Type (exact)"
                    value={qType}
                    onChange={(e) => setQType(e.target.value)}
                    size="small"
                    sx={{ width: 200 }}
                    placeholder="e.g. TEXT / CHOICE"
                  />
                  <TextField
                    label="Search"
                    value={qSearch}
                    onChange={(e) => setQSearch(e.target.value)}
                    size="small"
                    sx={{ width: 240 }}
                    placeholder="in contenu…"
                  />
                  <Button
                    onClick={() => { setPage(0); loadQuestions(0, qType, qSearch); }}
                    variant="outlined"
                    disabled={qLoading}
                  >
                    Apply
                  </Button>
                  <Box sx={{ flex: 1 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Selected: {selectedIds.size}
                  </Typography>
                </Box>

                {/* Checkbox list (paged) */}
                <Paper variant="outlined" sx={{ maxHeight: 320, overflow: "auto" }}>
                  <List dense disablePadding>
                    {qLoading && (
                      <ListItem><ListItemText primary="Loading…" /></ListItem>
                    )}
                    {!qLoading && qItems.map((q) => {
                      const id = q.id_Q;
                      const checked = selectedIds.has(id);
                      return (
                        <ListItem
                          key={id}
                          disablePadding
                          secondaryAction={null}
                        >
                          <ListItemButton onClick={() => toggleChecked(id)} dense>
                            <ListItemIcon>
                              <Checkbox edge="start" checked={checked} tabIndex={-1} disableRipple />
                            </ListItemIcon>
                            <ListItemText
                              primary={q.contenu}
                              secondary={q.type ? `Type: ${q.type}` : undefined}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                    {!qLoading && qItems.length === 0 && (
                      <ListItem><ListItemText primary="No questions found." /></ListItem>
                    )}
                  </List>
                </Paper>

                {/* Pagination controls */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "flex-end" }}>
                  <IconButton
                    size="small"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={qLoading || page <= 0}
                  >
                    <ArrowBackIosNewIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body2">Page {page + 1} / {Math.max(1, qTotalPages)}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => setPage((p) => (p + 1 < qTotalPages ? p + 1 : p))}
                    disabled={qLoading || page + 1 >= qTotalPages}
                  >
                    <ArrowForwardIosIcon fontSize="small" />
                  </IconButton>
                </Box>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button variant="contained" onClick={save}>{edit ? "Save" : "Create"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
