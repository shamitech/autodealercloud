# Implementation Plan - AutoDealerCloud

## Status Summary

**Completed:** 2/13 tasks (15%)
**Remaining:** 11/13 tasks (85%)

---

## PHASE 1: Backend Core Services (Tasks 3-5)

### ✅ TASK 3: Build Admin Backend API Service
**Status:** NOT STARTED  
**Depends on:** Nothing (can start now)  
**Deliverables:**
- [ ] Database connection & initialization
- [ ] Admin user authentication (login/register)
- [ ] JWT token generation & validation
- [ ] Tenant CRUD endpoints
  - [ ] GET /api/tenants
  - [ ] POST /api/tenants (create with temp password)
  - [ ] GET /api/tenants/:id
  - [ ] PUT /api/tenants/:id
  - [ ] DELETE /api/tenants/:id
- [ ] Temp password generation & reset endpoints
- [ ] Tenant user provisioning
- [ ] Error handling & logging
- [ ] Type definitions in shared/types
- [ ] Tests for critical endpoints

**Files to create:**
- `services/admin-api/src/database/connection.ts`
- `services/admin-api/src/auth/auth-service.ts`
- `services/admin-api/src/routes/tenants.ts`
- `services/admin-api/src/routes/auth.ts`
- `services/admin-api/src/models/Tenant.ts`
- `services/admin-api/src/models/AdminUser.ts`
- `shared/types/index.ts`

**Estimated time:** 8 hours

---

### ✅ TASK 4: Build CMS Backend API Service
**Status:** NOT STARTED  
**Depends on:** Task 3 (needs admin auth system)  
**Deliverables:**
- [ ] Database connection for each tenant (multi-tenant queries)
- [ ] Tenant authentication (tenant user login)
- [ ] Component CRUD endpoints
  - [ ] GET /api/components
  - [ ] POST /api/components (create Atom)
  - [ ] GET /api/components/:id
  - [ ] PUT /api/components/:id
  - [ ] DELETE /api/components/:id
- [ ] Organism CRUD endpoints
  - [ ] GET /api/organisms
  - [ ] POST /api/organisms (compose from components)
  - [ ] PUT /api/organisms/:id
  - [ ] DELETE /api/organisms/:id
- [ ] Page CRUD endpoints
  - [ ] GET /api/pages
  - [ ] POST /api/pages (build from organisms/components)
  - [ ] PUT /api/pages/:id
  - [ ] DELETE /api/pages/:id
- [ ] Publish endpoint (push to Publisher DB)
  - [ ] POST /api/pages/:id/publish
- [ ] Lightspeed credentials storage (encrypted)
  - [ ] POST /api/dms/lightspeed/config
  - [ ] GET /api/dms/lightspeed/config
- [ ] Vehicle syncing endpoint
  - [ ] POST /api/dms/lightspeed/sync

**Files to create:**
- `services/cms-api/src/database/connection.ts`
- `services/cms-api/src/auth/tenant-auth.ts`
- `services/cms-api/src/routes/components.ts`
- `services/cms-api/src/routes/organisms.ts`
- `services/cms-api/src/routes/pages.ts`
- `services/cms-api/src/routes/publish.ts`
- `services/cms-api/src/routes/dms.ts`
- `services/cms-api/src/models/Component.ts`
- `services/cms-api/src/models/Organism.ts`
- `services/cms-api/src/models/Page.ts`
- `services/cms-api/src/services/LightspeedService.ts`

**Estimated time:** 12 hours

---

### ✅ TASK 5: Build Publisher Backend API Service
**Status:** NOT STARTED  
**Depends on:** Task 4 (needs publish workflow)  
**Deliverables:**
- [ ] Database connection (read-only for published pages)
- [ ] Public page retrieval endpoints
  - [ ] GET /api/pages/:slug
  - [ ] GET /api/tenants/:slug/pages
- [ ] Vehicle inventory endpoints
  - [ ] GET /api/tenants/:slug/vehicles
  - [ ] GET /api/tenants/:slug/vehicles/:id
- [ ] CORS configuration for public access
- [ ] Caching strategy for published pages

**Files to create:**
- `services/publisher-api/src/database/connection.ts`
- `services/publisher-api/src/routes/pages.ts`
- `services/publisher-api/src/routes/vehicles.ts`

**Estimated time:** 4 hours

---

## PHASE 2: Frontend Dashboards (Tasks 6-8)

### ✅ TASK 6: Build Admin Dashboard (Next.js Frontend)
**Status:** NOT STARTED  
**Depends on:** Task 3 (Admin API)  
**Deliverables:**
- [ ] Login page (admin authentication)
- [ ] Tenant management dashboard
  - [ ] List all tenants
  - [ ] Create new tenant form
  - [ ] Edit tenant form
  - [ ] Delete tenant with confirmation
  - [ ] Display temp password on creation
  - [ ] Manage tenant users
- [ ] Navigation/layout component
- [ ] API client (axios wrapper)
- [ ] Form validation

**Files to create:**
- `services/admin-dashboard/app/layout.tsx`
- `services/admin-dashboard/app/login/page.tsx`
- `services/admin-dashboard/app/dashboard/page.tsx`
- `services/admin-dashboard/app/tenants/page.tsx`
- `services/admin-dashboard/app/tenants/[id]/page.tsx`
- `services/admin-dashboard/lib/api-client.ts`
- `services/admin-dashboard/components/TenantForm.tsx`
- `services/admin-dashboard/components/Navigation.tsx`

**Estimated time:** 8 hours

---

### ✅ TASK 7: Build CMS Dashboard with Page Builder
**Status:** NOT STARTED  
**Depends on:** Task 4 (CMS API)  
**Deliverables:**
- [ ] Tenant login page
- [ ] Main CMS dashboard
- [ ] Component editor
  - [ ] Create/edit components (Atoms)
  - [ ] Visual component preview
  - [ ] Save HTML/CSS/JS templates
  - [ ] Props schema editor
- [ ] Organism composer
  - [ ] Drag & drop component combination
  - [ ] Preview organisms
- [ ] Page builder
  - [ ] Drag & drop organisms/components onto page
  - [ ] Live preview
  - [ ] Save as draft
  - [ ] Publish page (triggers Task 9)
- [ ] DMS Lightspeed credentials form
- [ ] Vehicle browser/selector

**Files to create:**
- `services/cms-dashboard/app/layout.tsx`
- `services/cms-dashboard/app/login/page.tsx`
- `services/cms-dashboard/app/dashboard/page.tsx`
- `services/cms-dashboard/app/components/page.tsx`
- `services/cms-dashboard/app/organisms/page.tsx`
- `services/cms-dashboard/app/pages/page.tsx`
- `services/cms-dashboard/app/pages/[id]/edit/page.tsx`
- `services/cms-dashboard/app/dms/page.tsx`
- `services/cms-dashboard/components/PageBuilder.tsx`
- `services/cms-dashboard/components/ComponentEditor.tsx`
- `services/cms-dashboard/components/OrganismComposer.tsx`
- `services/cms-dashboard/lib/page-builder.ts`
- `services/cms-dashboard/lib/api-client.ts`

**Estimated time:** 20 hours

---

### ✅ TASK 8: Build Publisher Frontend for Public Pages
**Status:** NOT STARTED  
**Depends on:** Task 5 (Publisher API)  
**Deliverables:**
- [ ] Dynamic page rendering from slug
- [ ] Component rendering engine
- [ ] Vehicle gallery display
- [ ] Responsive design
- [ ] SEO meta tags from page data
- [ ] 404 handling for unpublished pages

**Files to create:**
- `services/publisher/app/[slug]/page.tsx`
- `services/publisher/app/layout.tsx`
- `services/publisher/lib/api-client.ts`
- `services/publisher/components/PageRenderer.tsx`
- `services/publisher/components/ComponentRenderer.tsx`

**Estimated time:** 8 hours

---

## PHASE 3: Core Workflows (Tasks 9-11)

### ✅ TASK 9: Implement Tenant Provisioning Workflow
**Status:** NOT STARTED  
**Depends on:** Tasks 3, 4, 6  
**Workflow:**
1. Admin creates tenant in dashboard
2. Admin API generates temp password
3. Admin API creates initial CMS DB schema
4. Admin API creates initial CMS admin user
5. Tenant receives login credentials
6. Tenant logs in and is forced to change password

**Deliverables:**
- [ ] Schema migration runner for new tenants
- [ ] Initial schema seeding (tables creation)
- [ ] Email notification (optional: send credentials)
- [ ] Force password change on first login
- [ ] Error handling & rollback

**Files to modify/create:**
- `services/admin-api/src/services/TenantService.ts` (main logic)
- `services/admin-api/src/routes/tenants.ts` (endpoint)
- `database/migrations/tenant-schema.sql` (template schema)

**Estimated time:** 4 hours

---

### ✅ TASK 10: Implement DMS Lightspeed Integration
**Status:** NOT STARTED  
**Depends on:** Task 4 (CMS API)  
**Deliverables:**
- [ ] Lightspeed API client
- [ ] Credential encryption/decryption
- [ ] Vehicle sync endpoint
  - [ ] Fetch vehicles from Lightspeed API
  - [ ] Store in CMS DB vehicles table
  - [ ] Update sync status
- [ ] Error handling for API failures
- [ ] Sync scheduling (cron job - optional)

**Files to create:**
- `services/cms-api/src/services/LightspeedService.ts`
- `services/cms-api/src/utils/encryption.ts`
- `services/cms-api/src/routes/dms.ts`

**Estimated time:** 6 hours

---

### ✅ TASK 11: Implement Page Publish Workflow
**Status:** NOT STARTED  
**Depends on:** Tasks 4, 5  
**Workflow:**
1. Tenant clicks "Publish" on a page in CMS
2. CMS API snapshots page content to Publisher DB
3. Publisher API makes it accessible at /{slug}
4. Nginx config is generated (Task 12)

**Deliverables:**
- [ ] Publish endpoint in CMS API
- [ ] Content snapshot to Publisher DB
- [ ] Publish history/versioning (optional)
- [ ] Unpublish endpoint

**Files to create:**
- `services/cms-api/src/services/PublishService.ts`
- `services/cms-api/src/routes/publish.ts`

**Estimated time:** 3 hours

---

## PHASE 4: Infrastructure & Deployment (Tasks 12-13)

### ✅ TASK 12: Setup Nginx Conf Generation and Routing
**Status:** NOT STARTED  
**Depends on:** Task 11 (publish workflow)  
**Deliverables:**
- [ ] Nginx config template for tenant subdomains
- [ ] Dynamic config generator in Admin API
- [ ] Auto-generate on tenant creation
- [ ] Auto-generate on publish
- [ ] Reload nginx configs
- [ ] DNS resolution for *.autodealercloud.com (wildcard)

**Nginx configs to generate:**
```
/etc/nginx/conf.d/tenant-cms-{slug}.conf
/etc/nginx/conf.d/tenant-pub-{slug}.conf
```

**Files to create:**
- `services/admin-api/src/services/NginxService.ts` (config generation)
- `services/admin-api/src/routes/nginx.ts` (endpoints)
- `nginx/templates/tenant-cms.conf.template` (template)
- `nginx/templates/tenant-pub.conf.template` (template)
- `nginx/conf.d/main.conf` (base config with wildcard)

**Estimated time:** 5 hours

---

### ✅ TASK 13: Deploy and Test on VPS
**Status:** NOT STARTED  
**Depends on:** All other tasks  
**Deliverables:**
- [ ] Pull repo on VPS
- [ ] Build Docker images
- [ ] Start containers
- [ ] Run database migrations
- [ ] Test all endpoints
- [ ] Test tenant provisioning flow
- [ ] Test page publishing flow
- [ ] Verify nginx routing

**Commands:**
```bash
cd /var/www/autodealercloud
git pull origin master
docker-compose build
docker-compose up -d
# Run migrations
# Test flows
```

**Estimated time:** 2 hours (troubleshooting may vary)

---

## Quick Summary

| # | Task | Status | Hours | Blocker? |
|---|------|--------|-------|----------|
| 1-2 | Schema Design & Structure | ✅ DONE | - | - |
| 3 | Admin API | ⬜ NOT STARTED | 8 | - |
| 4 | CMS API | ⬜ NOT STARTED | 12 | Task 3 |
| 5 | Publisher API | ⬜ NOT STARTED | 4 | Task 4 |
| 6 | Admin Dashboard | ⬜ NOT STARTED | 8 | Task 3 |
| 7 | CMS Dashboard | ⬜ NOT STARTED | 20 | Task 4 |
| 8 | Publisher Frontend | ⬜ NOT STARTED | 8 | Task 5 |
| 9 | Tenant Provisioning | ⬜ NOT STARTED | 4 | Task 3,4 |
| 10 | DMS Lightspeed | ⬜ NOT STARTED | 6 | Task 4 |
| 11 | Publish Workflow | ⬜ NOT STARTED | 3 | Task 4,5 |
| 12 | Nginx Setup | ⬜ NOT STARTED | 5 | Task 11 |
| 13 | VPS Deployment | ⬜ NOT STARTED | 2 | All others |

**Total Estimated Time: ~82 hours**

---

## Recommended Build Order

1. **Task 3** (Admin API) - 8 hrs - Foundation
2. **Task 6** (Admin Dashboard) - 8 hrs - Can test Task 3
3. **Task 4** (CMS API) - 12 hrs - Most complex
4. **Task 7** (CMS Dashboard) - 20 hrs - Largest UI task
5. **Task 5** (Publisher API) - 4 hrs - Quick once others done
6. **Task 8** (Publisher Frontend) - 8 hrs - Depends on Task 5
7. **Task 9** (Tenant Provisioning) - 4 hrs - Ties Tasks 3+4 together
8. **Task 10** (DMS Integration) - 6 hrs - Extra feature
9. **Task 11** (Publish Workflow) - 3 hrs - Core feature
10. **Task 12** (Nginx Setup) - 5 hrs - Infrastructure
11. **Task 13** (VPS Deploy) - 2 hrs - Go live

---

## Next Action

**Ready to start Task 3: Build Admin Backend API Service**

Should I begin building the Admin API with:
- Database connection
- Authentication (login/register)
- Tenant CRUD endpoints
- Temp password generation

Or would you like to focus on a different task first?
