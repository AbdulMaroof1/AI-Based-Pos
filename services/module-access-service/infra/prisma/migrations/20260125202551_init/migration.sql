-- CreateTable
CREATE TABLE "ModulePermission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "moduleName" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "enabledAt" TIMESTAMP(3),
    "disabledAt" TIMESTAMP(3),
    "enabledBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModulePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModulePermission_tenantId_idx" ON "ModulePermission"("tenantId");

-- CreateIndex
CREATE INDEX "ModulePermission_moduleName_idx" ON "ModulePermission"("moduleName");

-- CreateIndex
CREATE UNIQUE INDEX "ModulePermission_tenantId_moduleName_key" ON "ModulePermission"("tenantId", "moduleName");
