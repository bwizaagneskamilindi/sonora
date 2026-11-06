import { Router } from "express";
import crypto from "node:crypto";

export const authRouter = Router();

// state -> code verifier, held in memory between /login and /callback
export const pending = new Map<string, string>();

const b64url = (buf: Buffer) => buf.toString("base64url");

authRouter.get("/login", (_req, res) => {
    console.log("LOGIN HIT");
  const verifier = b64url(crypto.randomBytes(64));
  const challenge = b64url(
    crypto.createHash("sha256").update(verifier).digest()
  );
  const state = b64url(crypto.randomBytes(16));
  pending.set(state, verifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    scope: "playlist-read-private playlist-read-collaborative user-library-read",
    state,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

type Session = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

// sessionId -> tokens (in memory for now; resets when the server restarts)
export const sessions = new Map<string, Session>();

authRouter.get("/callback", async (req, res) => {
    console.log("CALLBACK HIT", req.query.code ? "has code" : "no code");
  const { code, state, error } = req.query as Record<string, string | undefined>;

  if (error || !code || !state) {
    return res.status(400).send("Spotify login failed");
  }

  const verifier = pending.get(state);
  if (!verifier) {
    return res.status(400).send("Unknown or expired login attempt");
  }
  pending.delete(state);

  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        code_verifier: verifier,
      }),
    });

    if (!tokenRes.ok) {
      console.error("Token exchange failed:", await tokenRes.text());
      return res.status(502).send("Could not get tokens from Spotify");
    }

    const data = (await tokenRes.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    const sessionId = b64url(crypto.randomBytes(32));
    sessions.set(sessionId, {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    });

    res.cookie("sonora_sid", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.redirect(process.env.FRONTEND_URL!);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong during login");
  }
});

authRouter.get("/me", async (req, res) => {
  const sid = req.cookies?.sonora_sid as string | undefined;
  const session = sid ? sessions.get(sid) : undefined;

  if (!session) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const meRes = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (!meRes.ok) {
    console.error("ME FAILED:", meRes.status, await meRes.text());
    return res.status(502).json({ error: "Spotify request failed" });
  }

  const me = (await meRes.json()) as { display_name: string; id: string };
  res.json({ name: me.display_name, id: me.id });
});