# Changelog

## 2026-03-18 — v1.0: Initial release
- Built page annotation bookmarklet — highlight any text, add a comment, see it in the sidebar
- Annotations persist in localStorage per page URL and survive refreshes
- Highlighted text gets a red underline on the page; click a sidebar card to scroll to it
- Export JSON button copies structured feedback to clipboard — paste directly into Claude Code
- JSON includes selected text, comment, DOM element path, nearest heading, page URL, and timestamps
- Install page (`install.html`) with drag-to-bookmarks-bar instructions
- Dark theme UI that stays above all host page content
