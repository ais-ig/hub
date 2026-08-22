# Setup · Handoff to Claude Code

1. Create a new repo in the `ais-ig` GitHub org, e.g. `parent-hub` (public, so GitHub Pages works and Claude Code can fetch the pathway hub for reference).
2. Copy the contents of this package into the repo root: `CLAUDE.md`, `CONTENT.md`, `SHEET-SCHEMA.md`, `assets/emblem.png`. (`hub-data-starter.xlsx` and this file don't need to be committed; keep the xlsx for the Drive upload.)
3. Enable GitHub Pages: Settings → Pages → deploy from `main` branch, root.
4. Upload `hub-data-starter.xlsx` to the school Google Drive, open with Google Sheets, save as Sheets format. Publish each tab to web as CSV (File → Share → Publish to web). Keep the five CSV URLs; Claude Code will ask for them, or leave hydration pointing at placeholder URLs until ready.
5. Open the repo in Claude Code and start with:

> Read CLAUDE.md, CONTENT.md, and SHEET-SCHEMA.md in full. Fetch https://ais-ig.github.io/grade-8-pathway/ and study its CSS as the design reference. Then build the complete skeleton index.html per CLAUDE.md: all nine sections, EN/AR toggle with RTL, Boys/Girls toggle, hydration layer per SHEET-SCHEMA.md with baked-in fallbacks, placeholder content per CONTENT.md. Mobile-first at 380px. Show me the homepage and section 6 before building out the rest.

6. Review in the browser at mobile width, in Arabic mode, and with the network offline (fallbacks must render). Iterate in Claude Code; once approved, share the GitHub Pages link with Mr. Farhan.
