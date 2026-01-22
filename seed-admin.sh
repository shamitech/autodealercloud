#!/bin/bash
cd /var/www/autodealercloud
docker-compose exec -T admin-portal npm --prefix services/admin-portal run ts-node src/seed-admin.ts
