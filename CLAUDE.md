# Markup Tool

Browser bookmarklet for annotating webpages and exporting structured feedback JSON for Claude Code.

**Live install page:** https://markup-tool.vercel.app

## Key conventions

- Single-file vanilla JS (`markup-tool.js`) — no framework, no dependencies
- All CSS is injected at runtime via a `<style>` tag (no external stylesheets)
- All DOM elements use `markup-tool-` prefix to avoid collisions with host pages
- z-index uses `2147483647` (max) to stay above all host page content
- Annotations stored in `localStorage` keyed by `markup-tool:` + origin + pathname
- Build produces `bookmarklet.txt` and `install.html` — both are generated artifacts

## Build

```bash
bash build.sh     # requires: terser (npm install -g terser)
```

## Docs

- docs/Handover.md — current state and next steps
- docs/Changelog.md — version history
- docs/Timespent.md — session time log
