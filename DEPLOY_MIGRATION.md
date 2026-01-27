# Migration Deployment Instructions

## Component System Database Migration

The database schema has been updated to support the new component system with versioning, custom components, templates, zones, and preview environments.

### Migration Status
- ✅ Schema updated in `packages/database/prisma/schema.prisma`
- ✅ Prisma client generated
- ✅ Migration SQL created in `packages/database/prisma/migrations/20260126183209_init_component_system/migration.sql`

### New Models Added
1. **ComponentDefinition** - Core component definitions (atoms, molecules, organisms)
2. **ComponentDefinitionVersion** - Versioned component definitions
3. **ComponentStyle** - CSS styling for components (visual editor support)
4. **JavaScriptFunctionTemplate** - Pre-made JS function templates for tenants
5. **JavaScriptFunction** - Tenant-configured JS functions
6. **ComponentCompositionDefinition** - Component nesting
7. **Template** - Page templates with zones
8. **Zone** - Template areas with component restrictions
9. **PageVersion** - Page versioning (draft/preview/published)
10. **PreviewAccess** - Access control for preview pages
11. **ComponentVersionHistory** - Version history tracking
12. **VersionNotification** - Update notifications to tenants
13. **TenantCustomComponent** - Tenant-created custom components
14. **TenantComponentVersion** - Tenant component versions
15. **TenantComponentStyle** - Tenant-specific component styles

### To Deploy on VPS

Run this command from the VPS (in the `/autodealercloud` directory):

```bash
cd /autodealercloud/packages/database
npx prisma migrate deploy
```

This will:
1. Read existing migrations that have been applied
2. Apply the new `20260126183209_init_component_system` migration
3. Create all new tables and indexes
4. Update Prisma Client types

### Verify Migration

After running the migration, verify all tables were created:

```bash
# Connect to PostgreSQL
psql -U autodealercloud -d autodealercloud

# List all tables
\dt

# You should see the new tables
```

### Next Steps

After migration is deployed:
1. Create API endpoints for component CRUD operations
2. Build CMS UI for component builder
3. Implement preview environment
4. Set up version notification system
