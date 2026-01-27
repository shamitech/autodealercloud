-- CreateTable ComponentDefinition
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

-- CreateTable ComponentDefinitionVersion
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

-- CreateTable ComponentCompositionDefinition
CREATE TABLE IF NOT EXISTS "ComponentCompositionDefinition" (
    "parentComponentId" TEXT NOT NULL,
    "childComponentId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("parentComponentId", "childComponentId"),
    FOREIGN KEY ("parentComponentId") REFERENCES "ComponentDefinition"("id") ON DELETE CASCADE,
    FOREIGN KEY ("childComponentId") REFERENCES "ComponentDefinition"("id") ON DELETE CASCADE
);

-- CreateTable ComponentStyle
CREATE TABLE IF NOT EXISTS "ComponentStyle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "componentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cssContent" TEXT,
    "visualStyle" JSONB DEFAULT '{}',
    "appliedClasses" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'visual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("componentId") REFERENCES "ComponentDefinition"("id") ON DELETE CASCADE
);

-- CreateTable JavaScriptFunctionTemplate
CREATE TABLE IF NOT EXISTS "JavaScriptFunctionTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "functionBody" TEXT NOT NULL,
    "placeholders" JSONB DEFAULT '[]',
    "eventTypes" JSONB NOT NULL,
    "selector" TEXT,
    "componentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("componentId") REFERENCES "ComponentDefinition"("id") ON DELETE SET NULL
);

-- CreateTable JavaScriptFunction
CREATE TABLE IF NOT EXISTS "JavaScriptFunction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "selector" TEXT,
    "params" JSONB DEFAULT '{}',
    "templateId" TEXT,
    "pageId" TEXT,
    "tenantId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("templateId") REFERENCES "JavaScriptFunctionTemplate"("id") ON DELETE SET NULL,
    FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE,
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

-- CreateTable Template
CREATE TABLE IF NOT EXISTS "Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "previewHtml" TEXT,
    "pageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE SET NULL
);

-- CreateTable Zone
CREATE TABLE IF NOT EXISTS "Zone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "componentRestrictions" JSONB DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE
);

-- CreateTable PageVersion
CREATE TABLE IF NOT EXISTS "PageVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "versionName" TEXT,
    "content" JSONB DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE
);

-- CreateTable PreviewAccess
CREATE TABLE IF NOT EXISTS "PreviewAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageVersionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" TEXT NOT NULL DEFAULT 'view',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("pageVersionId") REFERENCES "PageVersion"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- CreateTable ComponentVersionHistory
CREATE TABLE IF NOT EXISTS "ComponentVersionHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "componentId" TEXT NOT NULL,
    "oldVersion" TEXT,
    "newVersion" TEXT NOT NULL,
    "changes" JSONB DEFAULT '{}',
    "releaseNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("componentId") REFERENCES "ComponentDefinition"("id") ON DELETE CASCADE
);

-- CreateTable VersionNotification
CREATE TABLE IF NOT EXISTS "VersionNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "historyId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionTaken" TEXT,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("historyId") REFERENCES "ComponentVersionHistory"("id") ON DELETE CASCADE,
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

-- CreateTable TenantCustomComponent
CREATE TABLE IF NOT EXISTS "TenantCustomComponent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "composition" JSONB DEFAULT '{}',
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

-- CreateTable TenantComponentVersion
CREATE TABLE IF NOT EXISTS "TenantComponentVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "componentId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "composition" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("componentId") REFERENCES "TenantCustomComponent"("id") ON DELETE CASCADE
);

-- CreateTable TenantComponentStyle
CREATE TABLE IF NOT EXISTS "TenantComponentStyle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customComponentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cssContent" TEXT,
    "visualStyle" JSONB DEFAULT '{}',
    "appliedClasses" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'visual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("customComponentId") REFERENCES "TenantCustomComponent"("id") ON DELETE CASCADE,
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ComponentDefinitionVersion_componentId_idx" ON "ComponentDefinitionVersion"("componentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ComponentCompositionDefinition_parentComponentId_idx" ON "ComponentCompositionDefinition"("parentComponentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ComponentCompositionDefinition_childComponentId_idx" ON "ComponentCompositionDefinition"("childComponentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ComponentStyle_componentId_idx" ON "ComponentStyle"("componentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "JavaScriptFunctionTemplate_componentId_idx" ON "JavaScriptFunctionTemplate"("componentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "JavaScriptFunction_templateId_idx" ON "JavaScriptFunction"("templateId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "JavaScriptFunction_pageId_idx" ON "JavaScriptFunction"("pageId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "JavaScriptFunction_tenantId_idx" ON "JavaScriptFunction"("tenantId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Template_pageId_idx" ON "Template"("pageId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Zone_templateId_idx" ON "Zone"("templateId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PageVersion_pageId_idx" ON "PageVersion"("pageId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PageVersion_pageId_versionNumber_key" ON "PageVersion"("pageId", "versionNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PreviewAccess_pageVersionId_idx" ON "PreviewAccess"("pageVersionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PreviewAccess_userId_idx" ON "PreviewAccess"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ComponentVersionHistory_componentId_idx" ON "ComponentVersionHistory"("componentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VersionNotification_historyId_idx" ON "VersionNotification"("historyId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VersionNotification_tenantId_idx" ON "VersionNotification"("tenantId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TenantCustomComponent_tenantId_idx" ON "TenantCustomComponent"("tenantId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TenantComponentVersion_componentId_idx" ON "TenantComponentVersion"("componentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TenantComponentStyle_customComponentId_idx" ON "TenantComponentStyle"("customComponentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TenantComponentStyle_tenantId_idx" ON "TenantComponentStyle"("tenantId");
