# Markdown Viewer

A simple, beautiful web application to upload and render Markdown files. Built with vanilla HTML, CSS, and JavaScript — no build step required.

## Features

- **Drag & drop** or browse to upload `.md` files
- **Beautiful rendering** with GitHub-flavored Markdown support
- **Tabbed interface** for viewing multiple documents (up to 3)
- **Code syntax highlighting** via highlight.js
- **Sanitized output** via DOMPurify for security
- **Creamy, minimalistic design** that's easy on the eyes
- **Fully client-side** — no data leaves your browser

## Limits

- Maximum **3 files** per session
- Maximum **5MB** per file
- Maximum **15MB** total

## Quick Start

### Local Development

Just open `index.html` in your browser. No server required.

Or use a local dev server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

Then visit `http://localhost:8000`.

## Deployment

### Netlify

1. Push this repo to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your repo and deploy
5. Your site will be live at `your-site-name.netlify.app`

Or simply drag the `markdown-viewer` folder into Netlify's drag-and-drop deploy zone.

### GitHub Pages

1. Push to a GitHub repository
2. Go to Settings → Pages
3. Set source to the `main` branch and `/` (root) directory
4. Your site will be live at `username.github.io/repo-name`

## Tech Stack

- [Marked.js](https://marked.js.org/) — Markdown parsing
- [Highlight.js](https://highlightjs.org/) — Code syntax highlighting
- [DOMPurify](https://github.com/cure53/DOMPurify) — HTML sanitization
- Vanilla HTML/CSS/JavaScript — Zero dependencies, zero build step

## License

MIT
