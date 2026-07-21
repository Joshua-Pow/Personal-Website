#!/usr/bin/env node
/**
 * One-time helper to mint a Spotify refresh token for the homepage widget.
 *
 * Usage:
 *   SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node scripts/get-spotify-refresh-token.mjs
 *
 * Then update the Worker secret:
 *   npx wrangler secret put SPOTIFY_REFRESH_TOKEN
 */

import http from "node:http";
import { URL } from "node:url";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const PORT = Number(process.env.SPOTIFY_REDIRECT_PORT || 4321);
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-read-recently-played",
].join(" ");

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in the environment before running this script."
  );
  process.exit(1);
}

const authorizeUrl = new URL("https://accounts.spotify.com/authorize");
authorizeUrl.searchParams.set("client_id", CLIENT_ID);
authorizeUrl.searchParams.set("response_type", "code");
authorizeUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authorizeUrl.searchParams.set("scope", SCOPES);

console.log("\n1. In the Spotify Developer Dashboard, add this Redirect URI:");
console.log(`   ${REDIRECT_URI}`);
console.log("\n2. Open this URL in your browser and approve access:");
console.log(`   ${authorizeUrl.toString()}\n`);

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
    if (requestUrl.pathname !== "/callback") {
      res.writeHead(404).end("Not found");
      return;
    }

    const error = requestUrl.searchParams.get("error");
    if (error) {
      res.writeHead(400, { "Content-Type": "text/plain" }).end(`Auth failed: ${error}`);
      console.error(`Authorization failed: ${error}`);
      server.close();
      process.exit(1);
    }

    const code = requestUrl.searchParams.get("code");
    if (!code) {
      res.writeHead(400, { "Content-Type": "text/plain" }).end("Missing code");
      return;
    }

    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenJson = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenJson.refresh_token) {
      const detail =
        tokenJson.error_description ||
        tokenJson.error ||
        JSON.stringify(tokenJson);
      res
        .writeHead(500, { "Content-Type": "text/plain" })
        .end(`Token exchange failed: ${detail}`);
      console.error(`Token exchange failed (${tokenResponse.status}): ${detail}`);
      server.close();
      process.exit(1);
    }

    res
      .writeHead(200, { "Content-Type": "text/plain" })
      .end("Refresh token minted. You can close this tab and return to the terminal.");

    console.log("\nSuccess. Save this refresh token as the Worker secret:\n");
    console.log(tokenJson.refresh_token);
    console.log("\nnpx wrangler secret put SPOTIFY_REFRESH_TOKEN\n");

    server.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "text/plain" }).end("Internal error");
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Listening for Spotify callback on ${REDIRECT_URI}`);
});
