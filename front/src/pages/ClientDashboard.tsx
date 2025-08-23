import { useAuth } from "../state/AuthContext";

export default function ClientDashboard() {
  const { userEmail, role, logout } = useAuth();
  return (
    <div style={{ padding: 24 }}>
      <h2>Client Dashboard</h2>
      <p>Signed in as: <b>{userEmail}</b> ({role})</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
