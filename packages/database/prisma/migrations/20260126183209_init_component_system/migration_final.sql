CREATE TABLE IF NOT EXISTS "ComponentDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "category" TEXT,
    "propSchema" JSONB NOT NULL DEFAULT '{}',
    "defaultCss" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "ComponentDefinitionVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "htmlContent" TEXT,
    "cssContent" TEXT,
    "jsHooks" JSONB NOT NULL DEFAULT '[]',
    "releaseNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "componentId" TEXT NOT NULL,
    FOREIGN KEY ("componentId") REFERENCES "ComponentDefinition"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "ComponentCompositionDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentComponentId" TEXT NOT NULL,
    "childComponentId" TEXT NOT NULL,
    FOREIGN KEY ("parentComponentId") REFERENCES "ComponentDefinition"("id") ON DELETE CASCADE,
    FOREIGN KEY ("childComponentId") REFERENCES "ComponentDefinition"("id") ON DELETE CASCADE,
    UNIQUE("parentComponentId", "childComponentId")
);

CREATE TABLE IF NOT EXISTS "ComponentStyle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cssContent" TEXT,
    "visualStyle" JSONB NOT NULL DEFAULT '{}',
    "appliedClasses" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'visual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "componentId" TEXT NOT NULL,
    FOREIGN KEY ("componentId") REFERENCES "ComponentDefinition"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "JavaScriptFunctionTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "functionBody" TEXT NOT NULL,
    "placeholders" JSONB NOT NULL DEFAULT '[]',
    "eventTypes" TEXT NOT NULL,
    "selector" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "componentId" TEXT,
    FOREIGN KEY ("componentId") REFERENCES "ComponentDefinition"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "JavaScriptFunction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "selector" TEXT,
    "params" JSONB NOT NULL DEFAULT '{}',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "templateId" TEXT,
    "pageId" TEXT,
    "tenantId" TEXT NOT NULL,
    FOREIGN KEY ("templateId") REFERENCES "JavaScriptFunctionTemplate"("id") ON DELETE SET NULL,
    FOREIGN KEY ("pageId") REFERENCES "PageVersion"("id") ON DELETE CASCADE,
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Zone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "componentRestrictions" JSONB NOT NULL DEFAULT '[]',
    "content" JSONB NOT NULL DEFAULT '{}',
    "order" INTEGER NOT NULL,
    "templateId" TEXT NOT NULL,
    FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "previewHtml" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pageId" TEXT NOT NULL,
    FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "PreviewAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "permission" TEXT NOT NULL DEFAULT 'view',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "pageVersionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    FOREIGN KEY ("pageVersionId") REFERENCES "PageVersion"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    UNIQUE("pageVersionId", "userId")
);

CREATE TABLE IF NOT EXISTS "ComponentVersionHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "oldVersion" TEXT NOT NULL,
    "newVersion" TEXT NOT NULL,
    "changes" JSONB NOT NULL DEFAULT '{}',
    "releaseNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "componentId" TEXT NOT NULL,
    FOREIGN KEY ("componentId") REFERENCES "ComponentDefinition"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "VersionNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "actionTaken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "historyId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    FOREIGN KEY ("historyId") REFERENCES "ComponentVersionHistory"("id") ON DELETE CASCADE,
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "TenantCustomComponent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "composition" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
    UNIQUE("tenantId", "slug")
);

CREATE TABLE IF NOT EXISTS "TenantComponentVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "composition" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "componentId" TEXT NOT NULL,
    FOREIGN KEY ("componentId") REFERENCES "TenantCustomComponent"("id") ON DELETE CASCADE,
    UNIQUE("componentId", "version")
);

CREATE TABLE IF NOT EXISTS "TenantComponentStyle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cssContent" TEXT,
    "visualStyle" JSONB NOT NULL DEFAULT '{}',
    "appliedClasses" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'visual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customComponentId" TEXT,
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
    FOREIGN KEY ("customComponentId") REFERENCES "TenantCustomComponent"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "ComponentDefinition_type_idx" ON "ComponentDefinition"("type");
CREATE INDEX IF NOT EXISTS "ComponentDefinition_category_idx" ON "ComponentDefinition"("category");
CREATE INDEX IF NOT EXISTS "ComponentDefinitionVersion_componentId_idx" ON "ComponentDefinitionVersion"("componentId");
CREATE INDEX IF NOT EXISTS "ComponentCompositionDefinition_parentComponentId_idx" ON "ComponentCompositionDefinition"("parentComponentId");
CREATE INDEX IF NOT EXISTS "ComponentStyle_componentId_idx" ON "ComponentStyle"("componentId");
CREATE INDEX IF NOT EXISTS "TenantComponentStyle_tenantId_idx" ON "TenantComponentStyle"("tenantId");
CREATE INDEX IF NOT EXISTS "TenantComponentStyle_customComponentId_idx" ON "TenantComponentStyle"("customComponentId");
CREATE INDEX IF NOT EXISTS "JavaScriptFunctionTemplate_componentId_idx" ON "JavaScriptFunctionTemplate"("componentId");
CREATE INDEX IF NOT EXISTS "JavaScriptFunction_templateId_idx" ON "JavaScriptFunction"("templateId");
CREATE INDEX IF NOT EXISTS "JavaScriptFunction_pageId_idx" ON "JavaScriptFunction"("pageId");
CREATE INDEX IF NOT EXISTS "JavaScriptFunction_tenantId_idx" ON "JavaScriptFunction"("tenantId");
CREATE INDEX IF NOT EXISTS "Zone_templateId_idx" ON "Zone"("templateId");
CREATE INDEX IF NOT EXISTS "Template_pageId_idx" ON "Template"("pageId");
CREATE INDEX IF NOT EXISTS "PreviewAccess_pageVersionId_idx" ON "PreviewAccess"("pageVersionId");
CREATE INDEX IF NOT EXISTS "ComponentVersionHistory_componentId_idx" ON "ComponentVersionHistory"("componentId");
CREATE INDEX IF NOT EXISTS "VersionNotification_historyId_idx" ON "VersionNotification"("historyId");
CREATE INDEX IF NOT EXISTS "VersionNotification_tenantId_idx" ON "VersionNotification"("tenantId");
CREATE INDEX IF NOT EXISTS "VersionNotification_acknowledged_idx" ON "VersionNotification"("acknowledged");
CREATE UNIQUE INDEX IF NOT EXISTS "TenantCustomComponent_tenantId_slug_key" ON "TenantCustomComponent"("tenantId", "slug");
CREATE INDEX IF NOT EXISTS "TenantCustomComponent_tenantId_idx" ON "TenantCustomComponent"("tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "TenantComponentVersion_componentId_version_key" ON "TenantComponentVersion"("componentId", "version");
