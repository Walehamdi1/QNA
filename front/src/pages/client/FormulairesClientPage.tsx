import { useEffect, useState } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Tooltip, Typography, Stack, CircularProgress, Alert
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import { FormulaireService } from "../../services/FormulaireService";

// Normalized types for UI (we'll map API → these)
type UiFormulaireRow = {
  id: number;
  titre: string;
  dateCreation?: string | null;
  ownerEmail?: string | null;
};

type UiQuestion = {
  id: number;
  label: string;
  type?: string | null;
};

type UiFormulaireDetail = {
  id: number;
  titre: string;
  dateCreation?: string | null;
  questions: UiQuestion[];
};

type AnswersMap = Record<number, string>; // questionId -> valeur

// ---------- helpers: normalize various backend shapes ----------
function normalizeRow(raw: any): UiFormulaireRow {
  const id = raw?.id ?? raw?.id_F ?? raw?.formulaireId ?? 0;
  const titre = raw?.titre ?? raw?.title ?? "";
  const dateCreation = raw?.dateCreation ?? raw?.createdAt ?? null;
  const ownerEmail = raw?.ownerEmail ?? raw?.user?.email ?? null;
  return { id, titre, dateCreation, ownerEmail };
}

function normalizeDetail(raw: any): UiFormulaireDetail {
  const id = raw?.id ?? raw?.id_F ?? 0;
  const titre = raw?.titre ?? raw?.title ?? "";
  const dateCreation = raw?.dateCreation ?? raw?.createdAt ?? null;

  const qsRaw: any[] =
    Array.isArray(raw?.questions)
      ? raw.questions
      : Array.isArray(raw?.items)
      ? raw.items
      : [];

  const questions: UiQuestion[] = qsRaw.map((q: any) => ({
    id: q?.id ?? q?.id_Q ?? q?.questionId ?? 0,
    label: q?.contenu ?? q?.label ?? q?.content ?? "",
    type: q?.type ?? null,
  }));

  return { id, titre, dateCreation, questions };
}
// ---------------------------------------------------------------

export default function FormulairesClientPage() {
  const [rows, setRows] = useState<UiFormulaireRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detail, setDetail] = useState<UiFormulaireDetail | null>(null);

  const [answers, setAnswers] = useState<AnswersMap>({});
  const [saving, setSaving] = useState(false);
  const [prefillError, setPrefillError] = useState<string | null>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await FormulaireService.list(); // could be DTO[] or Entity[]
      const arr = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
      setRows(arr.map(normalizeRow));
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const openDetail = async (id: number) => {
    setOpen(true);
    setLoadingDetail(true);
    setPrefillError(null);
    try {
      // 1) Load formulaire + questions (ALWAYS show this)
      const dRaw = await FormulaireService.get(id);
      const d = normalizeDetail(dRaw);
      setDetail(d);

      // 2) Try to prefill my saved answers — but DO NOT fail the dialog if this 401s
      try {
        const my = await FormulaireService.myResponses(id); // requires valid token
        const map: AnswersMap = {};
        if (Array.isArray(my)) {
          my.forEach((r: any) => {
            const qid = r?.questionId ?? r?.question?.id ?? r?.question?.id_Q;
            if (qid) map[qid] = r?.valeur ?? "";
          });
        }
        setAnswers(map);
      } catch (prefillErr: any) {
        console.warn("Prefill failed", prefillErr);
        setPrefillError(
          prefillErr?.response?.status === 401
            ? "You’re not authenticated — answers won’t be prefilled."
            : "Couldn’t load your previous answers. You can still submit new ones."
        );
        // Keep questions visible
        setAnswers({});
      }
    } catch (e) {
      console.error(e);
      setDetail(null);
      setAnswers({});
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setOpen(false);
    setDetail(null);
    setAnswers({});
    setPrefillError(null);
  };

  const setOneAnswer = (questionId: number, valeur: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: valeur }));
  };

  const onSave = async () => {
    if (!detail) return;
    const payload = {
      answers: (detail.questions ?? []).map(q => ({
        questionId: q.id,
        valeur: answers[q.id] ?? ""
      })),
    };
    setSaving(true);
    try {
      await FormulaireService.submit(detail.id, payload); // backend uses @AuthenticationPrincipal
      closeDetail();
    } catch (e: any) {
      console.error(e);
      const msg = e?.response?.status === 401
        ? "You need to be logged in to submit answers."
        : "Save failed. Please try again.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
          <Typography variant="h5" sx={{ flex: 1 }}>Formulaires</Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchList} disabled={loading}><RefreshIcon /></IconButton>
          </Tooltip>
        </Box>

        <TableContainer component={Paper}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5}><Typography>Loading…</Typography></TableCell>
                </TableRow>
              )}

              {!loading && rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.titre}</TableCell>
                  <TableCell>{r.ownerEmail ?? "-"}</TableCell>
                  <TableCell>
                    {r.dateCreation ? new Date(r.dateCreation).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Details">
                      <IconButton size="small" onClick={() => openDetail(r.id)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && rows.length === 0 && (
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

      {/* Details / Answer dialog */}
      <Dialog open={open} onClose={closeDetail} fullWidth maxWidth="md">
        <DialogTitle>
          {loadingDetail ? "Loading…" : (detail ? detail.titre : "Details")}
        </DialogTitle>
        <DialogContent dividers>
          {prefillError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {prefillError}
            </Alert>
          )}

          {loadingDetail && (
            <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          )}

          {!loadingDetail && detail && (
            <Stack spacing={2}>
              {(detail.questions ?? []).map((q) => (
                <Box key={q.id} sx={{ display: "grid", gap: 0.5 }}>
                  {/* label only */}
                  <Typography variant="subtitle2">{q.label}</Typography>

                  {/* simple input; adjust by q.type if needed */}
                  <TextField
                    fullWidth
                    size="small"
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setOneAnswer(q.id, e.target.value)}
                    placeholder={q.type ? `Answer (${q.type})` : "Answer"}
                  />
                </Box>
              ))}
              {detail.questions.length === 0 && (
                <Typography sx={{ opacity: 0.8 }}>
                  No questions in this formulaire.
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetail} disabled={saving}>Close</Button>
          <Button variant="contained" onClick={onSave} disabled={saving || loadingDetail}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
