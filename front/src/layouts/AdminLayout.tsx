// src/layouts/AdminLayout.tsx
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import DescriptionIcon from "@mui/icons-material/Description";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
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

export default function AdminLayout() {
  const { userEmail, logout } = useAuth();

  return (
    <Box sx={{ display: "flex", bgcolor: "#0b1020", color: "#e7ecff", minHeight: "100dvh" }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "#12161c",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            <Link to="/dashboard/admin" style={{ color: "#e7ecff", textDecoration: "none" }}>
              Admin Console
            </Link>
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, opacity: 0.8 }}>
            {userEmail}
          </Typography>
          <IconButton color="inherit" onClick={logout} title="Logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Left Drawer */}
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
        {/* Push below AppBar */}
        <Toolbar />
        <Box sx={{ overflow: "auto", pt: 1 }}>
          <List>
            <Item to="/dashboard/admin" icon={<HomeIcon />} label="Overview" />
            <Item to="/dashboard/admin/users" icon={<GroupIcon />} label="User management" />
            <Item to="/dashboard/admin/formulaires" icon={<DescriptionIcon />} label="Formulaire" />
            <Item to="/dashboard/admin/questions" icon={<HelpCenterIcon />} label="Questions" />
          </List>
        </Box>
      </Drawer>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, md: 4 },
          pb: 4,
          display: "flex",
          justifyContent: "center", // centers the inner container
          width: "100%",
        }}
      >
        {/* Inner container that is centered and constrained */}
        <Box sx={{ width: "100%", maxWidth: CONTENT_W, mx: "auto" }}>
          {/* Offset for the fixed AppBar so titles aren’t hidden */}
          <Toolbar />
          <Box sx={{ mt: 1 }} />

          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
