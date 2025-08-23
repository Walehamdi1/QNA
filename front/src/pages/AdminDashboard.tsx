import { useAuth } from "../state/AuthContext";

export default function AdminDashboard() {
  const { userEmail, role, user, logout } = useAuth();
  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Dashboard</h2>
      <p>Signed in as: <b>{userEmail}</b> ({role})</p>
      <pre style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8 }}>
        {JSON.stringify(user, null, 2)}
      </pre>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
