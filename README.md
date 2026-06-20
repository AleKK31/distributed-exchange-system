# Marketplace de Trocas — Sistema Distribuído

Aplicação distribuída de marketplace para troca de itens, desenvolvida com microsserviços em NestJS, RabbitMQ, PostgreSQL e WebSocket.

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
```

Em seguida, inicie cada serviço individualmente:

```bash
cd server/sv-usuarios && npm run start:dev
cd server/sv-publicacoes && npm run start:dev
cd server/sv-match && npm run start:dev
cd server/sv-notificacao && npm run start:dev
```

## Alunos

- Alexandre Borges Baccarini Junior — 2515520
- Leonardo Naime Lima — 2515660
