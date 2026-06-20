#!/bin/bash
# Sobe todo o sistema com docker-compose
docker compose -f "$(dirname "$0")/docker-compose.yaml" up --build
