# Marketplace de Trocas — Sistema Distribuído

Aplicação distribuída de marketplace para troca de itens, desenvolvida com microsserviços em NestJS, RabbitMQ, PostgreSQL e WebSocket.

## Como compilar

Requisitos: **Docker** + **Docker Compose** (recomendado); ou, para dev local, **Node.js 22+** e **Yarn**.

Backend — todos os serviços via Docker:

```bash
cd server
docker compose -f docker-compose.yaml build
```

Backend — um serviço isolado (ex.: sv-usuarios):

```bash
cd server/sv-usuarios && yarn install && yarn build
```

Frontend:

```bash
cd client && yarn install && yarn build
```

## Como executar

### Sistema completo

```bash
cd server
./run.sh
```

Ou diretamente:

```bash
docker compose -f server/docker-compose.yaml up --build
```

### Apenas o banco de dados (para desenvolvimento local)

```bash
cd server
./run-database.sh
./run-rabbitmq.sh
```

Em seguida, inicie cada serviço individualmente:

```bash
cd server/sv-usuarios && yarn install && yarn start:dev
cd server/sv-publicacoes && yarn install && yarn start:dev
cd server/sv-match && yarn install && yarn start:dev
cd server/sv-notificacao && yarn install && yarn start:dev
```

### Frontend (desenvolvimento)

```bash
cd client && yarn install && yarn dev
```

Portas: usuários **3001**, publicações **3002**, match **3003**, notificação **3004**, PostgreSQL **5433**, RabbitMQ **5672** (admin **15672**), NGINX **80**. Swagger de cada serviço em `/docs` (ex.: `http://localhost:3002/docs`).

## Bibliotecas usadas

**Backend (NestJS 11):**

- `@nestjs/*` (core, common, config, jwt, passport, microservices, websockets, swagger, typeorm) — framework e integrações.
- `typeorm` + `pg` — ORM e driver PostgreSQL.
- `amqplib` / `amqp-connection-manager` — cliente RabbitMQ (AMQP).
- `passport` + `passport-jwt` — autenticação JWT.
- `bcrypt` — hash de senhas (sv-usuarios).
- `class-validator` / `class-transformer` — validação de DTOs.
- `socket.io` / `@nestjs/platform-socket.io` — WebSocket (sv-notificacao).

**Frontend:**

- `react` / `react-dom` — biblioteca de UI.
- `react-router-dom` — roteamento.
- `socket.io-client` — cliente WebSocket de notificações.
- `vite` — build/dev server; `tailwindcss` — estilos.

## Exemplo de uso

1. Suba o stack: `cd server && ./run.sh`
2. Suba o frontend: `cd client && yarn dev` → abra `http://localhost:5173`
3. Cadastre-se e faça login.
4. Crie uma publicação (item que oferece + item que deseja).
5. Com dois usuários e itens compatíveis (A oferece o que B deseja e vice-versa), o `sv-match` gera uma proposta → notificação em tempo real.
6. Em "Propostas", ambos aceitam → troca confirmada; ou recusam/expira.

Teste rápido via API (sem frontend):

```bash
# cadastro
curl -X POST http://localhost:3001/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"ana@x.com","password":"senha1234"}'

# login (retorna token JWT)
curl -X POST http://localhost:3001/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@x.com","password":"senha1234"}'
```

## Alunos

- Alexandre Borges Baccarini Junior — 2515520
- Leonardo Naime Lima — 2515660
