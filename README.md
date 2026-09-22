# Silica Reduction Dashboard

GitHub-ready static reconstruction of the Silica Reduction Dashboard.

## Included behavior

- Executive Summary for Woodyard, Fiberline and Pulp Dryer.
- Weekly and monthly reporting periods; weekly periods can cross New Year.
- Monthly-average bars plus daily selected-period lines in the executive charts.
- Centered chart legends and bordered chart cards.
- Fiberline Executive Summary keeps **Chip To Fiberline** above **Unbleached Pulp Silica**; bark-on charts are in Appendix only.
- Log washing-pressure chart fixed at 0–10 bar.
- Pulp Dryer executive charts fixed at 30–90 ppm.
- Action And Highlight tracker with Woodyard / Fiberline / Pulp Dryer / Technical areas and Done / Cancelled / Pending statuses.
- Overdue is calculated from **today**, independent of the selected report period.
- Seven historical Thickening Factor tables; values below 1.50 are highlighted, while exactly 1.50 passes.
- Full-year Excel import using the existing workbook sheet structure.
- Duplicate date behavior: incoming **nonblank** values replace stored values; blank cells preserve stored values; zero is a valid value.
- Monthly averages are calculated from daily data. Blank readings are excluded and zero is included. `Monthly silica` / `Monthly bark` sheets can override the calculated monthly values.
- Slush APR overall is calculated from PD1 + PD2 + PD3 daily readings.
- Paste-from-Excel workflow for environments that restrict file selection.
- Excel export, browser Print/Save-as-PDF, and JSON backup/restore.
- Synthetic history for 2025 through 22 Sep 2026 for layout validation.

## Data privacy / storage model

This build is intentionally static so it can run on GitHub Pages. Imported Excel data is parsed in the browser and persisted in that browser's `localStorage`. It is **not** a shared online database.

Consequences:

- Different computers/browsers do not automatically share imported data.
- Publishing the repository does not publish values stored in your browser.
- For shared multi-user editing, login-based editor permissions, or a central database, add a backend (for example Supabase, Firebase, or Cloudflare D1) before production use.

Do not place confidential production data directly in a public GitHub repository.

## Run locally

You can double-click `index.html`, but a local HTTP server is more reliable:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create a GitHub repository, e.g. `silica-reduction-dashboard`.
2. Upload the entire contents of this folder, including `.github/workflows/deploy.yml`.
3. Commit to the `main` branch.
4. Open **Settings → Pages**.
5. Set **Source** to **GitHub Actions**.
6. Open the Actions tab and wait for `Deploy Silica Dashboard to GitHub Pages` to finish.
7. The normal project-site address is `https://YOUR-USERNAME.github.io/silica-reduction-dashboard/`.

GitHub Pages deployment documentation: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Excel library

Excel read/write uses SheetJS Community Edition loaded from jsDelivr in `index.html`:

`https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js`

If that CDN is blocked, the rest of the dashboard still works. Use **Paste Data** and JSON backup until you vendor the library locally.

## Workbook sheets recognized

- Setup
- Silica
- Monthly silica
- Washing
- Bypass
- Bark
- Screening flow
- Screening operation
- pH
- OV reject
- Headbox pH
- TF PD1 Old
- TF PD1 New
- TF PD2 Old
- TF PD2 New
- TF PD3 L1
- TF PD3 L2
- TF PD3 L3
- Monthly bark
- Actions
- Limits

A reference workbook is included at `sample/Silica_Weekly_Update_Sample.xlsx`.
