import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Tooltip, Typography,
  Stack, CircularProgress, Alert, Divider
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import CheckIcon from "@mui/icons-material/Check";
import { FormulaireService } from "../../services/FormulaireService";
import { FournisseurReviewService } from "../../services/FournisseurReviewService";
import type { ClientAnswerView } from "../../types/dtos";

// --- UI types and normalizers (like client page) ---
type UiFormRow = { id: number; titre: string; dateCreation?: string | null; ownerEmail?: string | null };
const normalizeRow = (raw: any): UiFormRow => ({
  id: raw?.id ?? raw?.id_F ?? 0,
  titre: raw?.titre ?? raw?.title ?? "",
  dateCreation: raw?.dateCreation ?? raw?.createdAt ?? null,
  ownerEmail: raw?.ownerEmail ?? raw?.user?.email ?? null,
});

type CommentMap = Record<number, string>; // reponseClientId -> commentaire

export default function FormulairesFournisseurPage() {
  const [rows, setRows] = useState<UiFormRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [currentForm, setCurrentForm] = useState<UiFormRow | null>(null);

  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviews, setReviews] = useState<ClientAnswerView[]>([]);
  const [comments, setComments] = useState<CommentMap>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await FormulaireService.list();
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

  const openReview = async (row: UiFormRow) => {
    setCurrentForm(row);
    setOpen(true);
    setLoadingReviews(true);
    setSaveSuccess(false);
    try {
      const list = await FournisseurReviewService.list(row.id);
      setReviews(list);
      // prefill comment map
      const map: CommentMap = {};
      list.forEach((r) => {
        if (r.reponseClientId != null) {
          map[r.reponseClientId] = r.fournisseurComment ?? "";
        }
      });
      setComments(map);
    } catch (e) {
      console.error(e);
      setReviews([]);
      setComments({});
    } finally {
      setLoadingReviews(false);
    }
  };

  const closeReview = () => {
    setOpen(false);
    setCurrentForm(null);
    setReviews([]);
    setComments({});
    setSaveSuccess(false);
  };

  const setOneComment = (reponseClientId: number, commentaire: string) => {
    setComments((prev) => ({ ...prev, [reponseClientId]: commentaire }));
    setSaveSuccess(false);
  };

  const onSaveAll = async () => {
    if (!currentForm) return;
    const items = reviews.map((r) => ({
      reponseClientId: r.reponseClientId,
      commentaire: comments[r.reponseClientId] ?? "",
    }));
    setSaving(true);
    try {
      await FournisseurReviewService.upsertBatch(items);
      setSaveSuccess(true);
    } catch (e) {
      console.error(e);
      alert("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  // Group rows by client to make it easier to review
  const groupedByClient = useMemo(() => {
    const map = new Map<string, ClientAnswerView[]>();
    for (const r of reviews) {
      const key = `${r.clientUserId ?? "unknown"}|${r.clientEmail ?? "-"}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries()).map(([k, items]) => {
      const [idStr, email] = k.split("|");
      const clientUserId = idStr === "unknown" ? null : Number(idStr);
      return { clientUserId, email, items };
    });
  }, [reviews]);

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
                <TableRow><TableCell colSpan={5}><Typography>Loading…</Typography></TableCell></TableRow>
              )}

              {!loading && rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.titre}</TableCell>
                  <TableCell>{r.ownerEmail ?? "-"}</TableCell>
                  <TableCell>{r.dateCreation ? new Date(r.dateCreation).toLocaleString() : "-"}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Review">
                      <IconButton size="small" onClick={() => openReview(r)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && rows.length === 0 && (
                <TableRow><TableCell colSpan={5}><Typography sx={{ opacity: 0.7 }}>No items.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Review dialog */}
      <Dialog open={open} onClose={closeReview} fullWidth maxWidth="md">
        <DialogTitle>
          {currentForm ? `Review: ${currentForm.titre}` : "Review"}
        </DialogTitle>

        <DialogContent dividers>
          {loadingReviews && (
            <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          )}

          {!loadingReviews && reviews.length === 0 && (
            <Alert severity="info">No client answers found for this formulaire.</Alert>
          )}

          {!loadingReviews && reviews.length > 0 && (
            <Stack spacing={3}>
              {groupedByClient.map((g, idx) => (
                <Box key={`${g.clientUserId}-${idx}`} sx={{ border: "1px solid rgba(0,0,0,.12)", borderRadius: 1 }}>
                  <Box sx={{ px: 2, py: 1, bgcolor: "rgba(0,0,0,.02)", display: "flex", alignItems: "center" }}>
                    <Typography variant="subtitle2" sx={{ flex: 1 }}>
                      Client: {g.email || "-"} {g.clientUserId ? `(id: ${g.clientUserId})` : ""}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      {g.items.map((r) => (
                        <Box key={r.reponseClientId} sx={{ display: "grid", gap: .5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {r.questionLabel ?? `Question #${r.questionId ?? "-"}`}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: .8 }}>
                            Client answer: {r.clientAnswer ?? "-"}
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            label="Your comment"
                            value={comments[r.reponseClientId] ?? ""}
                            onChange={(e) => setOneComment(r.reponseClientId, e.target.value)}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          {saveSuccess && (
            <Box sx={{ display: "flex", alignItems: "center", mr: 1, gap: .5 }}>
              <CheckIcon fontSize="small" /> <Typography variant="body2">Saved</Typography>
            </Box>
          )}
          <Button onClick={closeReview} disabled={saving}>Close</Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={onSaveAll}
            disabled={saving || loadingReviews || reviews.length === 0}
          >
            {saving ? "Saving…" : "Save All"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
