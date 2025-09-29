# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Project structure notes

- Pages live in `app/pages/*` and are rendered inside the active layout in `app/layouts/*`.
- The default layout must expose a `<slot />` for page content; otherwise routes like `pages/profile.vue` won't display.
- The root `app/app.vue` should wrap `NuxtLayout` around `NuxtPage` (optionally inside containers/components).

Troubleshooting missing page render:

- Ensure `app/layouts/default.vue` contains `<slot />`.
- Ensure `app/app.vue` includes `<NuxtLayout><NuxtPage /></NuxtLayout>`.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
