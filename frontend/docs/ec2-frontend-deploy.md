# Frontend EC2 Deploy Guide

This project is configured for standalone Next.js deployment on EC2.

## 1) Build on EC2

```bash
cd frontend
npm ci
cp .env.example .env
npm run build
```

`next.config.mjs` already has `output: 'standalone'`.

## 2) Run app

```bash
cd frontend
PORT=3000 HOSTNAME=0.0.0.0 NODE_ENV=production node .next/standalone/server.js
```

## 3) Keep process alive (PM2)

```bash
npm i -g pm2
cd frontend
pm2 start ".next/standalone/server.js" --name abst-frontend --interpreter node --env production
pm2 save
pm2 startup
```

## 4) Nginx reverse proxy (recommended)

Proxy `80/443` to `http://127.0.0.1:3000`.

Minimal site block:

```nginx
server {
  listen 80;
  server_name your-domain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Then add TLS with Certbot.

## 5) Security group ports

- Open `80` (HTTP) and `443` (HTTPS) publicly.
- Keep app port `3000` private when using Nginx.
