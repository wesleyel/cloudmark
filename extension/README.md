# Cloudmark Chrome Extension

Manifest V3 extension for saving the current tab to Cloudmark with an existing or new category.

## Features

- Read the active tab title and URL from the toolbar popup
- Choose an existing category or create a new category
- Add an optional description before saving
- Save pages and links from the Chrome context menu
- Remember the last successfully used category
- English and Simplified Chinese UI
- Connect to `cloudmark.site`, localhost, or any self-hosted Cloudmark server

## Build

From the repository root:

```bash
pnpm install
pnpm build:extension
```

The unpacked extension is generated in `dist-extension/`.

To build both the web app and extension:

```bash
pnpm build:all
```

## Load in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this repository's `dist-extension/` directory.
5. Pin Cloudmark to the toolbar.

After rebuilding, use the reload button on the extension card.

## Configure

Open the popup settings and enter:

- **Collection mark** — the collection name from the Cloudmark URL.
- **Write token** — the secret token that permits changes to that collection.
- **Server** — `https://cloudmark.site` or the origin of a self-hosted Cloudmark instance, such as `http://localhost:3000`.

The token is stored only in `chrome.storage.local`; it is not synced through Chrome Sync. The manifest uses unrestricted host access (`<all_urls>`) so the extension can connect to any self-hosted Cloudmark server. The code accepts only HTTP(S) server URLs and sends the token only to the origin configured in the popup.

## Use

### Popup

1. Open any HTTP(S) page.
2. Click the Cloudmark toolbar icon.
3. Review the title and URL.
4. Select a category or choose **New category**.
5. Click **Save bookmark**.

Chrome internal pages cannot be saved directly, but the URL field remains editable so another HTTP(S) URL can be pasted.

### Context menu

- Right-click a page and choose **Save this page to Cloudmark**.
- Right-click a link and choose **Save this link to Cloudmark**.

Context-menu saves use the last successfully selected category. If none exists, they use the collection's default category.

## Local development

Run the Cloudmark app and extension build in separate terminals:

```bash
pnpm dev
pnpm build:extension
```

Set the extension server to `http://localhost:3000`, then reload the unpacked extension after each rebuild.
