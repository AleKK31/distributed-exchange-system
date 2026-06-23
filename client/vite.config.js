import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Em dev local: proxy direto para cada serviço (sem nginx)
// Em produção (docker compose): nginx na porta 80 roteia tudo
const DEV_PROXIES = {
  '/api/users':       { target: 'http://localhost:3001', rewrite: (p) => p.replace('/api', '') },
  '/api/publicacoes': { target: 'http://localhost:3002', rewrite: (p) => p.replace('/api', '') },
  '/api/match':       { target: 'http://localhost:3003', rewrite: (p) => p.replace('/api', '') },
  '/socket.io':       { target: 'http://localhost:3004', ws: true },
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: DEV_PROXIES,
  },
})
