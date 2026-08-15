# Cloudflare Pages setup

## 1. Create the GitHub repository

1. Create a new repository, for example `living-amyloid-evidence`.
2. On the repository page, select **Add file → Upload files**.
3. Drag the **contents** of this folder into the upload area. `README.md` should
   appear at the repository root and `public/index.html` should be present.
4. Commit the files to the `main` branch.

## 2. Connect Cloudflare Pages

1. In Cloudflare, open **Workers & Pages**.
2. Select **Create application → Pages → Connect to Git**.
3. Authorize GitHub and choose the new repository.
4. Use these build settings:

   - Production branch: `main`
   - Framework preset: `None`
   - Build command: `node scripts/verify.mjs`
   - Build output directory: `public`
   - Root directory: leave blank

5. Select **Save and Deploy**.

Cloudflare will assign a `pages.dev` address. Each subsequent push to `main`
will validate and deploy the updated `public` folder. Pull requests and other
branches can receive preview deployments when enabled in the Pages project.

## 3. Optional custom domain

Open the Pages project, select **Custom domains**, and follow the displayed DNS
instructions. After the final domain is known, replace the relative `og:image`
and `twitter:image` URLs in `public/index.html` with absolute HTTPS URLs for the
most reliable social previews.

