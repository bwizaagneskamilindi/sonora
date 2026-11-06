import { useEffect, useState } from "react";
import Library from "./Library"

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setName(data?.name ?? null))
      .catch(() => setName(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>SONORA</h1>
      <Library />
      {name ? (
        <p>Logged in as {name}</p>
      ) : (
        <>
          <p>Your music library, in one place.</p>
          <a className="login-btn" href={`${API_URL}/auth/login`}>
            Log in with Spotify
          </a>
        </>
      )}
    </div>
  );
}

export default App;