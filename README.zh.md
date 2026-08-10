# Cloudmark

[![AGPL LICENSE](https://img.shields.io/badge/LICENSE-AGPL-blue.svg)](https://www.gnu.org/licenses/agpl-3.0.html)
[![在线试用](https://img.shields.io/badge/TryIt-Online-orange.svg)](https://cloudmark.site/)
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/wesleyel/cloudmark)

[English](README.md)

## 简介

Cloudmark 是一款通用的云端书签管理工具，无需注册登录。创建集合 ID（`mark`）和密钥 **write token**，安装 bookmarklet 即可一键收藏网页。

在线试用：[https://cloudmark.site/](https://cloudmark.site/)

## 主要功能

- 🔑 **无需注册**：通过 `mark` 访问集合；写入需要 write token
- 🔖 **一键收藏**：Bookmarklet 内嵌 mark + write token
- 🧩 **Chrome 扩展**：选择已有分类或新建分类，快速保存当前标签页
- 🏷️ **分类管理**：自定义分类整理书签
- ⌨️ **键盘优先**：`/` 搜索、`j/k` 导航、`n/e/d` 增删改、`?` 帮助
- 📋 **高信息密度**：紧凑列表 + 即时筛选 / 排序
- 🎨 **自定义图标**：表情、字母徽标，或上传 SVG/ICO/PNG
- 🌐 **跨设备访问**：任意设备可读；写入需在该设备配置 token
- 🌍 **多语言**：中文 / 英文
- 🗄️ **Cloudflare D1**：边缘关系型存储

## 安全模型

| 能力 | 条件 |
|------|------|
| 查看集合 | 知道 `mark`（URL） |
| 添加 / 编辑 / 删除 | 有效的 **write token** |
| Bookmarklet 保存 | `mark` + `token` 查询参数 |

- Write token 在 D1 中仅存 SHA-256 哈希；明文只存在浏览器 `localStorage` 与 bookmarklet 中。
- 带有速率限制与字段长度限制。

## 快速开始

1. 访问 [https://cloudmark.site/doc](https://cloudmark.site/doc)
2. 生成 `mark` 与 write token
3. 将 bookmarklet 拖到浏览器书签栏
4. 浏览时点击 bookmarklet 保存页面
5. 打开 `https://cloudmark.site/你的-mark` 管理书签

## Chrome 扩展（开发者预览）

Manifest V3 扩展支持读取当前标签页，选择已有分类或新建分类后保存；同时提供页面和链接的右键快捷保存。

```bash
pnpm install
pnpm build:extension
```

打开 `chrome://extensions`，启用「开发者模式」，点击「加载已解压的扩展程序」，选择 `dist-extension/`。随后在扩展设置中填写收藏名称、write token 和 Cloudmark 服务器地址。服务器既可以是 `https://cloudmark.site`，也可以是任意自托管的 HTTP(S) 实例。

完整安装、权限与本地联调说明见 [`extension/README.md`](extension/README.md)。

## 本地开发

### 环境要求

- Node.js 20+ 与 pnpm
- Cloudflare 账号（预览与部署）

### 安装依赖

```bash
pnpm install
```

### D1 配置

```bash
pnpm exec wrangler d1 create cloudmark
# 将 database_id 写入 wrangler.jsonc
pnpm db:migrate:local    # 本地
pnpm db:migrate:remote   # 生产
```

### 开发模式

```bash
pnpm dev
```

### 预览 / 部署

一键部署（从本仓库创建 Cloudflare Worker）：

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/wesleyel/cloudmark)

或在本机：

```bash
pnpm db:migrate:local && pnpm preview
pnpm db:migrate:remote && pnpm run deploy
```

首次部署后，请在 `wrangler.jsonc`（或控制台）配置 `d1_databases[0].database_id` 并执行 migrations。

## 技术栈

- **TypeScript 7** · **React 19** · **Vite** · **Hono**
- Cloudflare Workers（`@cloudflare/vite-plugin`）
- Cloudflare D1
- Tailwind CSS · shadcn/ui

## 许可证

[AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html)

## 贡献

欢迎 Issue 与 PR！
