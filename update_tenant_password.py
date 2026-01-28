#!/usr/bin/env python3
import subprocess
import sys

cmd = [
    "psql",
    "-U", "postgres",
    "-d", "autodealercloud",
    "-c", 'UPDATE "Tenant" SET "tempPassword" = \'TempPass123!A0\' WHERE id = \'cmkx5wlj600003lk4lfko12e3\';'
]

env = {"PGPASSWORD": "password"}
result = subprocess.run(cmd, env={**__import__('os').environ, **env}, capture_output=True, text=True)
print(result.stdout)
if result.returncode != 0:
    print(result.stderr, file=sys.stderr)
    sys.exit(result.returncode)
print("✓ Tenant password updated")
