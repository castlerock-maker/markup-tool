# Handover

## Current state

v1.0 — fully functional bookmarklet. Can be installed from `install.html`, used on any page to highlight text, add annotations, and export JSON for Claude Code.

## Last session summary

- Built the complete annotation tool as a single vanilla JS file (`markup-tool.js`)
- Created build pipeline (`build.sh`) using terser for minification → URL-encoded bookmarklet
- Created `install.html` — a drag-to-install page with instructions
- Sidebar with dark theme, annotation cards, delete controls, export button
- Inline page highlights with scroll-to-annotation on card click
- localStorage persistence per page URL
- JSON export includes selected text, comment, DOM context (element path + nearest heading), and page metadata
- Set up project documentation

## What failed / dead ends

None — clean first build.

## Known issues

- Bookmarklet is ~21KB — works in Chrome/Firefox but may hit URL length limits in some browsers
- Cross-element text selection (spanning multiple DOM nodes) uses a fallback that may not highlight the full range
- No edit functionality for existing annotations (delete + re-add is the current workflow)

## Next steps

- Chrome extension version (eliminates bookmarklet size limits, adds proper permissions)
- Edit existing annotations in-place
- Drag to reorder annotations
- Category/severity tags (e.g. "copy change", "design issue", "bug")
