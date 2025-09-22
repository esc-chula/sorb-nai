# Welcome to React Router

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Cloudflare Pages (SSR)

This app deploys to Cloudflare Pages with SSR via Pages Functions located in `functions/[[path]].ts`.

Important:

- Cloudflare's runtime doesn't include Node built-ins by default. Our server bundle from React Router references `node:*` modules (via `@react-router/node`). To make this work on Pages Functions, enable the Node.js compatibility layer.
- We've added a `wrangler.toml` at the repo root with:
  - `compatibility_flags = ["nodejs_compat"]`
  - `compatibility_date` set to a recent date

Cloudflare Pages will detect this file during builds and apply the flag (see build logs: "Checking for configuration in a Wrangler configuration file (BETA)"). This resolves runtime errors like `No such module "node:fs"` when publishing Functions.

No further changes are required in the Vite or React Router config for Pages deployment.

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```text
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
