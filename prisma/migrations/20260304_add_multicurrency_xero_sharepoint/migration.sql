-- AlterEnum: Add ANNUAL to PeriodType
ALTER TYPE "PeriodType" ADD VALUE 'ANNUAL';

-- AlterTable: Add displayCurrency to WorkspaceMember
ALTER TABLE "WorkspaceMember" ADD COLUMN "displayCurrency" TEXT;

-- AlterTable: Add Xero fields to Opportunity
ALTER TABLE "Opportunity" ADD COLUMN "xeroQuoteId" TEXT;
ALTER TABLE "Opportunity" ADD COLUMN "xeroQuoteUrl" TEXT;
ALTER TABLE "Opportunity" ADD COLUMN "xeroQuoteStatus" TEXT;
ALTER TABLE "Opportunity" ADD COLUMN "xeroContactId" TEXT;

-- CreateTable: LinkedDocument
CREATE TABLE "LinkedDocument" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "driveItemId" TEXT,
    "siteId" TEXT,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "lastModifiedAt" TIMESTAMP(3),
    "lastModifiedBy" TEXT,
    "linkedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable: XeroIntegration
CREATE TABLE "XeroIntegration" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tenantName" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "scope" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "XeroIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CurrencyCache
CREATE TABLE "CurrencyCache" (
    "id" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "rates" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrencyCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LinkedDocument_workspaceId_opportunityId_idx" ON "LinkedDocument"("workspaceId", "opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "XeroIntegration_workspaceId_key" ON "XeroIntegration"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyCache_baseCurrency_key" ON "CurrencyCache"("baseCurrency");

-- AddForeignKey
ALTER TABLE "LinkedDocument" ADD CONSTRAINT "LinkedDocument_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LinkedDocument" ADD CONSTRAINT "LinkedDocument_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LinkedDocument" ADD CONSTRAINT "LinkedDocument_linkedById_fkey" FOREIGN KEY ("linkedById") REFERENCES "WorkspaceMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XeroIntegration" ADD CONSTRAINT "XeroIntegration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
