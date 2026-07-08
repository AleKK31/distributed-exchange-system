/**
 * Configuração do Vite (build e dev server) do frontend. Habilita o plugin do
 * React e define os proxies de desenvolvimento (/api/* e /socket.io) para os
 * serviços rodando localmente nas portas 3001-3004.
 *
 * Autor: Alexandre Borges Baccarini Junior e Leonardo Naime Lima
 * Criação: 23/06/2026
 * Atualização: 07/07/2026
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Em dev local: proxy direto para cada serviço (sem nginx)
// Em produção (docker compose): nginx na porta 80 roteia tudo
const DEV_PROXIES = {
  '/api/users':        { target: 'http://localhost:3001', rewrite: (p) => p.replace('/api', '') },
  '/api/publicacoes':  { target: 'http://localhost:3002', rewrite: (p) => p.replace('/api', '') },
  '/api/match':        { target: 'http://localhost:3003', rewrite: (p) => p.replace('/api', '') },
  '/api/notificacoes': { target: 'http://localhost:3004', rewrite: (p) => p.replace('/api', '') },
  '/socket.io':        { target: 'http://localhost:3004', ws: true },
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: DEV_PROXIES,
  },
})
