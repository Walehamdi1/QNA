import { useAuth } from "../state/AuthContext";

export default function Dashboard() {
  const { userEmail, logout } = useAuth();
  return (
    <div style={{ padding: 24 }}>
      <h2>Welcome to the Q&A Dashboard</h2>
      <p>Signed in as: <b>{userEmail}</b></p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
