# Development environment

This project uses Next.js and pnpm. Two recommended ways to run a development server with hot-reload (Fast Refresh):

## 1) Native (recommended)

Install dependencies and run the Next dev server on your host machine:

```bash
pnpm install
pnpm dev
```

- Opens on `http://localhost:5170` by default (port defined in `package.json` script).
- Fast Refresh / HMR is enabled; changes to React components and pages are applied instantly.

## 2) Docker (useful when you want an isolated dev container)

A `Dockerfile.dev` and `docker-compose.dev.yml` is provided. It runs the Next dev server inside a container and mounts the project directory so edits on the host are reflected inside the container.

Run:

```bash
# build and run dev container (rebuild when dependencies change)
docker compose -f docker-compose.dev.yml up --build

# or detach
docker compose -f docker-compose.dev.yml up --build -d
```

Open `http://localhost:5170` in your browser. The container runs `pnpm dev` so Fast Refresh should work. If you change dependencies, rebuild the container.

## Notes and tips

- The project's `deploy.sh` still builds and restarts the production app; running the dev server does not affect production unless you intentionally reverse-proxy it.
- Use `pnpm run build` and `pnpm run start` for production testing.
- If you use an external proxy (nginx), make sure dev port is routed correctly.
