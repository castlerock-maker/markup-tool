# Markup for AI

**Annotate any webpage and feed structured feedback directly to an AI agent like Claude.** Highlight content that needs changing, describe what's wrong, and export everything as JSON that Claude Code can act on immediately.

A browser bookmarklet — works on any page including `localhost` dev servers, no extension install required.

**Install it now:** [markup-tool.vercel.app](https://markup-tool.vercel.app)

## What it does

- **Highlight & annotate**: Select any text on a page, add a comment describing what needs to change
- **Persistent sidebar**: Shows all annotations with highlighted text and your comments
- **Inline highlights**: Annotated text is visually highlighted on the page with a red underline
- **Export JSON**: One-click export copies structured JSON to clipboard — paste directly into Claude Code
- **localStorage persistence**: Annotations survive page refreshes, keyed per URL
- **Works everywhere**: Any webpage including `localhost` dev servers

## How to install

**Quickest way:** Visit [markup-tool.vercel.app](https://markup-tool.vercel.app) and drag the button to your bookmarks bar.

**From source:**
1. Clone the repo and install dependencies: `npm install`
2. Run the build: `bash build.sh`
3. Open `install.html` in a browser
4. Drag the "Markup Tool" button to your bookmarks bar
5. Click the bookmarklet on any page to activate

## How to use

1. Click the bookmarklet on any page — sidebar appears on the right
2. Select text on the page — annotation popup appears
3. Type your comment (what needs to change) and press Enter
4. Click **Export JSON** to copy all annotations to clipboard
5. Paste the JSON into Claude Code to request the changes

## JSON export format

```json
{
  "page": {
    "url": "http://localhost:3000/about",
    "title": "About Page",
    "exportedAt": "2026-03-18T..."
  },
  "annotations": [
    {
      "number": 1,
      "selectedText": "The text that was highlighted",
      "comment": "Change this to something more descriptive",
      "context": {
        "elementPath": "section.hero > div.content > p",
        "nearestHeading": "About Us"
      },
      "timestamp": "2026-03-18T..."
    }
  ],
  "instructions": "Each annotation highlights content..."
}
```

## Tech stack

- Vanilla JavaScript (single IIFE, no dependencies)
- CSS injected at runtime
- localStorage for persistence
- Terser for minification (build step)

## Project structure

```
markup-tool/
├── markup-tool.js          ← Source code (annotated, readable)
├── build.js                ← Node.js build script (minify + base64 encode)
├── build.sh                ← Shell wrapper for build.js
├── install-template.html   ← Install page template (build injects bookmarklet)
├── bookmarklet.txt         ← Generated bookmarklet URI (build artifact)
├── install.html            ← Generated drag-to-install page (build artifact)
├── README.md
├── CLAUDE.md
└── docs/
    ├── Handover.md
    ├── Changelog.md
    └── Timespent.md
```

## How to develop

Edit `markup-tool.js`, then run `bash build.sh`. The install page has a dev-mode fallback that loads the raw JS file directly (useful during development — just open install.html without building and the bookmarklet will `fetch()` the source file).

For iterating on a target page: open the page, then paste the contents of `markup-tool.js` directly into the browser console.

## Future

Chrome extension version planned — the core JS translates directly.
