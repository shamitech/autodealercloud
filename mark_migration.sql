-- Mark the migration as applied in Prisma
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
VALUES (
  '0001_init',
  '00e6fe825d5c3d65c92a76b46dd49c5e0b3ff2f8f9f4',
  NOW(),
  '0001_init',
  '',
  NULL,
  NOW(),
  1
)
ON CONFLICT DO NOTHING;
