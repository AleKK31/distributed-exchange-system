#!/bin/bash
# Sobe apenas o PostgreSQL para desenvolvimento local (sem docker-compose)
docker run --name exchange-postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=exchange_db \
  -p 5433:5432 \
  -d postgres:16
