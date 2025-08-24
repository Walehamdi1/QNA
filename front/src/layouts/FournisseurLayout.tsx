import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import DescriptionIcon from "@mui/icons-material/Description";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../state/AuthContext";
import type { ReactNode } from "react";

const drawerWidth = 240;
const CONTENT_W = 1100;

function Item({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      end
      sx={{
        "&.active": { bgcolor: "rgba(255,255,255,.08)" },
        borderRadius: 1,
        mx: 1,
      }}
    >
      <ListItemIcon sx={{ color: "#e7ecff" }}>{icon}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  );
}

export default function FournisseurLayout() {
  const { userEmail, logout } = useAuth();

  return (
    <Box sx={{ display: "flex", bgcolor: "#0b1020", color: "#e7ecff", minHeight: "100dvh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ bgcolor: "#12161c", borderBottom: "1px solid rgba(255,255,255,.08)", zIndex: (t) => t.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            <Link to="/dashboard/fournisseur" style={{ color: "#e7ecff", textDecoration: "none" }}>
              Fournisseur Console
            </Link>
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, opacity: 0.8 }}>{userEmail}</Typography>
          <IconButton color="inherit" onClick={logout} title="Logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#0f162a",
            color: "#e7ecff",
            borderRight: "1px solid rgba(255,255,255,.08)",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", pt: 1 }}>
          <List>
            <Item to="/dashboard/fournisseur" icon={<HomeIcon />} label="Overview" />
            <Item to="/dashboard/fournisseur/formulaires" icon={<DescriptionIcon />} label="Formulaires" />
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, px: { xs: 2, md: 4 }, pb: 4, display: "flex", justifyContent: "center", width: "100%" }}
      >
        <Box sx={{ width: "100%", maxWidth: CONTENT_W, mx: "auto" }}>
          <Toolbar />
          <Box sx={{ mt: 1 }} />
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
