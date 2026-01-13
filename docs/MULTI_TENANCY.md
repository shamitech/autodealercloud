# Multi-Tenancy Architecture

## Overview

AutoDealerCloud implements a **shared database with row-level isolation** multi-tenancy model. This approach provides:
- Single database instance for cost efficiency
- Complete data isolation between tenants
- Scalability for hundreds or thousands of dealers
- Simplified backup and maintenance

## Tenant Resolution

### Identification Methods

Tenants are identified through:

1. **Subdomain** - Primary method
   - Format: `{dealer-slug}.autodealercloud.app`
   - Resolved in Laravel middleware
   - Example: `acme-motors.autodealercloud.app`

2. **Custom Domain** - Via DNS CNAME/A record
   - Format: `www.customdomain.com` (CNAME to autodealercloud.app)
   - Looked up in `domains` table
   - Mapped to tenant_id

### Tenant Context Middleware

All requests flow through `IdentifyTenantMiddleware`:

```
Request → Extract domain/subdomain → Lookup tenant_id → 
Set context (Tenant::setId()) → Route request
```

## Database Schema

### Core Tables

All tables include `tenant_id` column for isolation:

```sql
-- Tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    status ENUM('active', 'inactive', 'suspended'),
    created_at TIMESTAMP
);

-- Custom domains mapping
CREATE TABLE domains (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    domain VARCHAR(255) UNIQUE NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP
);

-- Users scoped to tenant
CREATE TABLE users (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    UNIQUE(tenant_id, email)
);

-- Websites/stores scoped to tenant
CREATE TABLE websites (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    lightspeed_account_id VARCHAR(255),
    configuration JSONB,
    created_at TIMESTAMP
);
```

### Query Patterns

**Always filter by tenant:**
```php
// Correct - tenant-scoped
$user = User::where('tenant_id', Tenant::getId())
    ->where('email', $email)
    ->first();

// Wrong - potential data leak
$user = User::where('email', $email)->first();
```

## Implementation

### Tenant Middleware

Located in `app/Http/Middleware/IdentifyTenant.php`:

```php
public function handle(Request $request, Closure $next)
{
    $tenant = $this->resolveTenant($request);
    
    if (!$tenant) {
        return response()->json(['error' => 'Tenant not found'], 404);
    }
    
    Tenant::setId($tenant->id);
    
    return $next($request);
}
```

### Model Scopes

Use Laravel query scopes for tenant filtering:

```php
class User extends Model
{
    protected static function booted()
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            $query->where('tenant_id', Tenant::getId());
        });
    }
}
```

## Tenant Database Separation (Future)

For advanced scaling, upgrade to **shared schema with separate databases**:
- Each tenant gets own PostgreSQL database
- Simpler permission model
- Better performance isolation
- More expensive infrastructure

Migration path:
1. Use spatie/laravel-multitenancy package
2. Implement Tenant Connection Manager
3. Migrate to separate database per tenant progressively

## Adding Custom Domains

### User Flow

1. Dealer adds domain via dashboard: `www.acme-motors.com`
2. System generates verification DNS record
3. Dealer adds CNAME: `www.acme-motors.com CNAME www.autodealercloud.app`
4. Background job verifies DNS propagation
5. Domain marked as verified in `domains` table
6. Nginx routes traffic → API → Tenant lookup → Correct website displayed

### Verification Process

```php
// Verify domain ownership
class VerifyDomainCommand extends Command
{
    public function handle()
    {
        $domain = Domain::whereNull('verified_at')
            ->where('created_at', '>=', now()->subDays(1))
            ->first();
            
        if ($this->checkDnsPropagation($domain->domain)) {
            $domain->update(['verified_at' => now()]);
        }
    }
}
```

## Security Considerations

### Tenant Isolation

✓ **Implemented:**
- Global query scopes on all models
- Tenant ID in database relationships
- Request middleware validates tenant context
- API authentication per tenant

✓ **TODO:**
- Row-level security (RLS) policies in PostgreSQL
- Audit logging for cross-tenant access attempts
- Regular tenant isolation penetration testing

### API Authentication

- JWT tokens include tenant_id
- Validate tenant context on each request
- Rate limiting per tenant

## Monitoring Tenant Health

Create tenant dashboard metrics:
- Active dealers
- Storage usage per tenant
- API call rates
- Error rates by tenant
- Lightspeed sync status

See `docs/MONITORING.md` for implementation.

## Troubleshooting

### Tenant Not Found Error

Check:
1. Domain/subdomain is in `tenants` or `domains` table
2. Nginx is passing correct Host header
3. Tenant middleware is registered in kernel

### Data Leakage Between Tenants

Audit:
1. All models have tenant_id filter in queries
2. No manual SQL without tenant_id WHERE clause
3. API endpoints validate tenant context
4. Cache keys are tenant-scoped

## References

- [Spatie Multi-Tenancy Package](https://github.com/spatie/laravel-multitenancy)
- [PostgreSQL Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Multi-Tenancy Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Multitenancy_Architecture_Cheat_Sheet.html)
