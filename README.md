# Cloudmark

[![AGPL LICENSE](https://img.shields.io/badge/LICENSE-AGPL-blue.svg)](https://www.gnu.org/licenses/agpl-3.0.html)
[![Try It Online](https://img.shields.io/badge/TryIt-Online-orange.svg)](https://cloudmark.site)

[中文文档](README.zh.md)

## Introduction

Cloudmark is a universal cloud bookmark management tool that allows you to easily save and access your bookmarks from anywhere. No login or registration required - simply create your personalized bookmark collection and start using it right away.

Try it online: [cloudmark.site](https://cloudmark.site)

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

- Node.js 18+ and npm/yarn
- Cloudflare account (for preview and deployment)

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the result.

### Local Preview with Cloudflare Pages

```bash
npm run preview
```

### Build and Deploy

```bash
npm run deploy
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

- [Nuxt 3](https://nuxt.com/) - Vue.js framework
- [Vue 3](https://vuejs.org/) - Progressive JavaScript framework
- [Cloudflare Pages](https://pages.cloudflare.com/) - Hosting and serverless functions
- [Cloudflare KV](https://developers.cloudflare.com/workers/runtime-apis/kv/) - Data storage
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vue i18n](https://vue-i18n.intlify.dev/) - Internationalization
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Migration from Next.js

This project has been migrated from Next.js + React to Nuxt 3 + Vue 3. Key changes include:

- **Framework**: Next.js → Nuxt 3
- **UI Library**: React → Vue 3 with Composition API
- **Routing**: Next.js Router → Vue Router (via Nuxt)
- **State Management**: React hooks → Vue Composition API
- **Server**: Next.js API Routes → Nuxt 3 Server API
- **Internationalization**: next-intl → Vue i18n
- **Build**: Next.js build → Nitro (Nuxt's build engine)

All functionality has been preserved while modernizing the tech stack.

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
