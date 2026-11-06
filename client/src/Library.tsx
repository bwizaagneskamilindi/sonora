import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

type Track = {
  id: number;
  title: string;
  artists: string;
  album: string | null;
  matchKey: string | null;
};

export default function Library() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [view, setView] = useState<"all" | "duplicates">("all");

  useEffect(() => {
    fetch(`${API_URL}/library/${view === "all" ? "tracks" : "duplicates"}`)
      .then((r) => r.json())
      .then(setTracks)
      .catch(() => setTracks([]));
  }, [view]);

  async function scan() {
    await fetch(`${API_URL}/library/scan`, { method: "POST" });
    setView("all");
    const r = await fetch(`${API_URL}/library/tracks`);
    setTracks(await r.json());
  }

  return (
    <div style={{ width: "min(700px, 90vw)" }}>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button onClick={scan}>Scan folder</button>
        <button onClick={() => setView("all")}>All tracks</button>
        <button onClick={() => setView("duplicates")}>Duplicates</button>
      </div>
      <ul>
        {tracks.map((t) => (
          <li key={t.id}>
            {t.artists} - {t.title} {t.album ? `(${t.album})` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}