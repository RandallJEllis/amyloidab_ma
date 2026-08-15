# Cloudflare Workers static-site setup

## 1. Create the GitHub repository

1. Create a new repository, for example `living-amyloid-evidence`.
2. On the repository page, select **Add file → Upload files**.
3. Drag the **contents** of this folder into the upload area. `README.md` should
   appear at the repository root and `public/index.html` should be present.
4. Commit the files to the `main` branch.

## 2. Connect Cloudflare Workers

1. In Cloudflare, open **Workers & Pages**.
2. Select **Create application → Workers → Connect to Git**.
3. Authorize GitHub and choose the repository.
4. Cloudflare will read `wrangler.jsonc`, which deploys the contents of
   `public/` as static assets. No application build command is required.

   - Production branch: `main`
   - Worker name: `amyloidab-ma`
   - Static-assets directory: `public/`

5. Select **Save and Deploy**.

Each subsequent push to `main` will deploy the updated `public/` folder. Pull
requests and other branches can receive preview deployments when enabled in
the Workers project.

## 3. Optional custom domain

Open the Workers project, select **Custom domains**, and follow the displayed DNS
instructions. After the final domain is known, replace the relative `og:image`
and `twitter:image` URLs in `public/index.html` with absolute HTTPS URLs for the
most reliable social previews.
