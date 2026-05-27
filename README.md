# Cloudmark

[![AGPL LICENSE](https://img.shields.io/badge/LICENSE-AGPL-blue.svg)](https://www.gnu.org/licenses/agpl-3.0.html)
[![Try It Online](https://img.shields.io/badge/TryIt-Online-orange.svg)](https://cloudmark.yxra3603.workers.dev/)

[中文文档](README.zh.md)

## Introduction

Cloudmark is a universal cloud bookmark management tool that allows you to easily save and access your bookmarks from anywhere. No login or registration required - simply create your personalized bookmark collection and start using it right away.

Try it online: [https://cloudmark.yxra3603.workers.dev/](https://cloudmark.yxra3603.workers.dev/)

## Key Features

- 🔑 **No Registration**: Access your bookmark collection using a unique identifier
- 🔖 **One-Click Save**: Quickly save the current webpage using a bookmarklet
- 🏷️ **Category Management**: Add custom categories to your bookmarks for easy organization
- 🌐 **Cross-Device Access**: Access your bookmarks on any device
- 📝 **Detailed Descriptions**: Add personalized descriptions to your bookmarks
- 🌍 **Multi-Language Support**: English and Chinese interfaces available
- ✨ **Modern Interface**: Responsive design for all devices

## Quick Start

1. Visit [cloudmark.site](https://cloudmark.site)
2. Generate a unique identifier (mark) or use a custom one
3. Install the bookmarklet to your browser
4. Click the bookmarklet to save webpages while browsing
5. Visit `cloudmark.site/your-mark` anytime to view and manage your bookmarks

## Local Development

### Prerequisites

- Node.js 15+ and pnpm
- Cloudflare account (for preview and deployment)

### Install Dependencies

```bash
pnpm install
```

### Development Mode

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the result.

### Local Preview with Cloudflare Pages

```bash
pnpm preview
```

### Build and Deploy

```bash
pnpm deploy
```

## Cloudflare Configuration

### KV Namespace

Cloudmark uses Cloudflare KV to store bookmark data. You need to:

1. Create a KV namespace in your Cloudflare Dashboard
2. Update the `wrangler.jsonc` file:
   ```json
   "kv_namespaces": [
      {
        "binding": "cloudmark",
        "id": "your-kv-namespace-id"
      }
   ]
   ```

### Environment Variables

- `NEXT_PUBLIC_BASE_URL` - Base URL of the site (optional, defaults to current domain)

## Technology Stack

- [Next.js](https://nextjs.org/) - React framework
- [Cloudflare Pages](https://pages.cloudflare.com/) - Hosting and serverless functions
- [Cloudflare KV](https://developers.cloudflare.com/workers/runtime-apis/kv/) - Data storage
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Next-Intl](https://next-intl-docs.vercel.app/) - Internationalization

## License

This project is open-sourced under the [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html) license.

## Contributing

Issues and Pull Requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Contact

If you have any questions, please contact us through GitHub Issues.
