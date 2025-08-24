import { useEffect, useState } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Tooltip, Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { QuestionService } from "../../../services/QuestionService";
import { FormulaireService } from "../../../services/FormulaireService";

type Question = {
  id_Q: number;
  contenu: string;
  type?: string;
  // On questions, backend still sends entity-style formulaire { id_F, titre? }
  formulaire?: { id_F: number; titre?: string } | null;
};

type FormulaireListItem = {
  id: number;           // DTO id from /api/formulaires
  titre: string;
};

export default function QuestionsPage() {
  const [rows, setRows] = useState<Question[]>([]);
  const [formulaires, setFormulaires] = useState<FormulaireListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Question | null>(null);

  // Keep UI values as strings (never undefined); convert to number only when sending payload
  const [form, setForm] = useState<{ contenu: string; type: string; formulaireId: string }>({
    contenu: "",
    type: "",
    formulaireId: "",
  });

  const toArray = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.content)) return data.content;
    return [];
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qs, fs] = await Promise.all([QuestionService.list(), FormulaireService.list()]);
      setRows(Array.isArray(qs) ? qs : toArray(qs));

      // Normalize formulaires list to always have { id, titre }
      const fsArr = toArray(fs).map((f: any) => ({
        id: f?.id ?? f?.id_F,   // prefer DTO id; fallback to id_F if ever present
        titre: f?.titre ?? "",
      })).filter((f: any) => f?.id != null);
      setFormulaires(fsArr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const startCreate = () => {
    setEdit(null);
    setForm({ contenu: "", type: "", formulaireId: "" });
    setOpen(true);
  };

  const startEdit = (row: Question) => {
    setEdit(row);
    setForm({
      contenu: row.contenu ?? "",
      type: row.type ?? "",
      // question.formulaire uses entity id_F → convert to string for the Select
      formulaireId: row.formulaire?.id_F != null ? String(row.formulaire.id_F) : "",
    });
    setOpen(true);
  };

  const close = () => setOpen(false);

  const save = async () => {
    const payload: any = {
      contenu: form.contenu ?? "",
      type: form.type ?? "",
    };

    if (!edit) {
      if (!form.formulaireId) {
        alert("Formulaire is required.");
        return;
      }
      payload.formulaire = { id_F: Number(form.formulaireId) }; // convert string → number for backend
      await QuestionService.create(payload);
    } else {
      if (form.formulaireId) {
        payload.formulaire = { id_F: Number(form.formulaireId) };
      }
      await QuestionService.update(edit.id_Q, payload);
    }

    close();
    fetchData();
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this question?")) return;
    await QuestionService.remove(id);
    fetchData();
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 1, md: 2 } }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" sx={{ flex: 1 }}>Questions</Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} disabled={loading}><RefreshIcon /></IconButton>
          </Tooltip>
          <Button startIcon={<AddIcon />} variant="contained" onClick={startCreate} sx={{ ml: 1 }}>
            New
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Contenu</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Formulaire</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id_Q} hover sx={{ "& td": { py: 1.25 } }}>
                  <TableCell>{r.id_Q}</TableCell>
                  <TableCell>{r.contenu}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>
                    {r.formulaire?.titre ?? (r.formulaire?.id_F != null ? `#${r.formulaire.id_F}` : "-")}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => startEdit(r)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => onDelete(r.id_Q)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && !loading && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography sx={{ opacity: 0.7 }}>No items.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
        <DialogTitle>{edit ? "Edit question" : "New question"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "grid", gap: 2 }}>
            <TextField
              fullWidth
              label="Contenu"
              value={form.contenu ?? ""} // never undefined
              onChange={(e) => setForm({ ...form, contenu: e.target.value })}
            />
            <TextField
              fullWidth
              label="Type"
              value={form.type ?? ""} // never undefined
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            />
            <TextField
              fullWidth
              select
              label="Formulaire"
              value={form.formulaireId ?? ""}  // keep controlled (never undefined)
              onChange={(e) => setForm({ ...form, formulaireId: e.target.value })}
            >
              {formulaires.map((f) => (
                // Use DTO id from /api/formulaires
                <MenuItem key={f.id} value={String(f.id)}>
                  #{f.id} — {f.titre}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button variant="contained" onClick={save}>{edit ? "Save" : "Create"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
