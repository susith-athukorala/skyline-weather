# Skyline Weather

An installable weather web app (PWA) for GitHub Pages. API keys are held by a Cloudflare Worker, so they never appear in the public code.

```
skyline-weather/
├── index.html              ← the app
├── manifest.webmanifest    ← makes it installable
├── sw.js                   ← offline support
├── icons/                  ← app icons
└── worker/
    ├── worker.js           ← Cloudflare Worker (API proxy)
    └── wrangler.toml       ← only for CLI deployment
```

Do **not** upload the `worker/` folder to GitHub Pages. It goes to Cloudflare. Keeping a copy in the repo is fine, because it holds no keys.

---

## Step 1 – Get fresh API keys

The old keys were in public code and in chat, so treat them as exposed.

- **OpenWeather:** openweathermap.org → My API keys → generate a new key → delete the old one.
- **Windy:** api.windy.com → your keys → create a new Point Forecast key → delete the old one.

A new OpenWeather key can take up to about 2 hours to become active.

## Step 2 – Create the Worker (dashboard, no coding tools needed)

1. Sign up or log in at **dash.cloudflare.com**. The free plan is enough.
2. Go to **Workers & Pages → Create → Create Worker** (the "Hello World" starter). Name it `skyline-weather`, then select **Deploy**.
3. Select **Edit code**. Delete everything, paste the contents of `worker/worker.js`, then select **Deploy**.
4. Go back to the Worker → **Settings → Variables and Secrets → Add**:

   | Type   | Name              | Value |
   |--------|-------------------|-------|
   | Secret | `OWM_KEY`         | your new OpenWeather key |
   | Secret | `WINDY_KEY`       | your new Windy key |
   | Text   | `ALLOWED_ORIGINS` | `https://YOUR-GITHUB-USERNAME.github.io,http://localhost:8000` |

   An origin is only the scheme and host. Use `https://name.github.io`, not `https://name.github.io/weather/`.
5. Note your Worker address, for example `https://skyline-weather.yourname.workers.dev`.
6. Check it: open `https://skyline-weather.yourname.workers.dev/health`. You should see `"owmKeySet":true,"windyKeySet":true`.
   If you open `/weather?...` directly in a browser tab, you will get **403 Origin not allowed**. That is expected, because only your site may call it.

## Step 3 – Point the app at the Worker

In `index.html`, find `CONFIG` near the top of the script and set:

```js
proxy: 'https://skyline-weather.yourname.workers.dev',
```

## Step 4 – Publish on GitHub Pages

1. Upload `index.html`, `manifest.webmanifest`, `sw.js` and the `icons/` folder to the root of your repo, replacing the old `index.html`.
2. Settings → Pages → Deploy from branch → `main` / `(root)`.
3. Open `https://YOUR-GITHUB-USERNAME.github.io/REPO-NAME/`.

## Step 5 – Install it

- **Android / Chrome / Edge (desktop):** select the **⬇ Install** button in the app's top bar, or use the browser's install icon.
- **iPhone / iPad (Safari):** Share → **Add to Home Screen**. iOS has no install button for web apps.

## Testing on your own computer first (optional)

In the `skyline-weather` folder, run `python3 -m http.server 8000` and open `http://localhost:8000`. That origin is already in `ALLOWED_ORIGINS`.

## Updating later

Whenever you change `index.html`, the icons or `sw.js`, change `VERSION` in `sw.js` (for example `skyline-v2`). Installed copies will then fetch the new files. Without this step, phones may keep showing the old version.

## Optional: deploy with the CLI instead

```bash
cd worker
npx wrangler login
npx wrangler secret put OWM_KEY
npx wrangler secret put WINDY_KEY
# edit ALLOWED_ORIGINS in wrangler.toml first
npx wrangler deploy
```
