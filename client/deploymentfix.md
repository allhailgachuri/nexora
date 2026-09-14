# Vercel & Netlify Deployment Fix Guide

> **Author**: BuiltbyRushion Engineering  
> **Purpose**: A step-by-step master reference for fixing 404s, 500 JSON errors, and output directory mismatches when deploying modern React / Vite / TanStack applications to Vercel, Netlify, or any Edge hosting platform.

---

## 🛑 1. The Critical Pitfalls & Why Deployments Fail

### Pitfall A: The Tracked `.vercel` Directory (The 500 JSON Error)
- **Symptom**: When visiting the live Vercel URL, the browser displays a raw JSON response:
  ```json
  { "error": true, "status": 500, "unhandled": true }
  ```
- **Why It Happens**: When running local builds or tests, Vercel/Nitro creates a `.vercel/output` directory. If this folder is committed and pushed to GitHub:
  1. Vercel detects a prebuilt `.vercel/output` in the git repository.
  2. Vercel **skips the fresh build step** and deploys the old, broken serverless function bundle.
  3. The function crashes on Vercel's Node runtime and returns the unhandled error JSON.
- **The Fix**:
  ```bash
  # 1. Untrack .vercel from Git
  git rm -r --cached .vercel

  # 2. Delete the physical folder
  rm -rf .vercel

  # 3. Add .vercel to your .gitignore
  echo ".vercel" >> .gitignore
  ```

---

### Pitfall B: `No Output Directory named "dist" found` (404 Error)
- **Symptom**:
  ```text
  Error: No Output Directory named "dist" found after the Build completed.
  ```
- **Why It Happens**: Vercel expects Vite projects to emit static client files into `dist/`. If you are using an SSR framework (or if Vite output is misconfigured), Vercel cannot find `index.html` and throws a 404 or build failure.
- **The Fix**: Configure your project as a clean, high-performance client SPA that outputs to `dist/index.html` + `dist/assets/`.

---

## 🛠️ 2. The Complete Fix Architecture

### Step 1: Root `index.html`
Place `index.html` directly in your workspace root:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your App Title</title>
    <link rel="icon" type="image/jpeg" href="/favicon.ico" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### Step 2: Client Entrypoint (`src/main.tsx`)
Create `src/main.tsx` to mount React into `#root`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>,
  );
}
```

---

### Step 3: `vite.config.ts` Configuration
Ensure your `vite.config.ts` uses `TanStackRouterVite` (PascalCase) and outputs standard static files:

```ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    viteReact(),
  ],
});
```

---

### Step 4: Routing Fallbacks (`vercel.json` and `netlify.toml`)

#### `vercel.json`
Ensures all deep links (e.g. `/ethos`, `/innovations`, `/inquire`) route to `index.html` on Vercel:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### `netlify.toml`
Configures Netlify to publish `dist/` and handle client-side routing:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Step 5: Clean `.gitignore`
Make sure `.gitignore` contains:

```gitignore
node_modules
dist
dist-ssr
.output
.vercel
.nitro
.tanstack/**
*.local
```

---

### Step 6: `package.json` Scripts
Ensure your build script is clean:

```json
"scripts": {
  "dev": "vite dev",
  "build": "vite build",
  "preview": "vite preview"
}
```

---

## ⚡ 3. Quick Checklist for Other Projects

When fixing another repository with deployment issues:

1. [ ] Run `git ls-files .vercel` — if any files appear, run `git rm -r --cached .vercel`.
2. [ ] Check if `index.html` exists at root and points to `/src/main.tsx`.
3. [ ] Verify `vite.config.ts` uses `TanStackRouterVite` (PascalCase from `@tanstack/router-plugin/vite`).
4. [ ] Verify `vercel.json` has the `/index.html` rewrite.
5. [ ] Run `npm run build` locally and verify `dist/index.html` is generated.
6. [ ] Commit and push:
   ```bash
   git add .
   git commit -m "Fix deployment: clean SPA build and untrack .vercel"
   git push origin main
   ```

---

*© 2026 BuiltbyRushion. Nairobi Technology Agency.*
