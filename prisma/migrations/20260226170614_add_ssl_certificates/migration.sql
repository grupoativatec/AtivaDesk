-- CreateTable
CREATE TABLE "SslCertificate" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "subdomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "pendingRenewal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SslCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SslCertificate_domain_key" ON "SslCertificate"("domain");

-- CreateIndex
CREATE INDEX "SslCertificate_expiresAt_idx" ON "SslCertificate"("expiresAt");

-- CreateIndex
CREATE INDEX "SslCertificate_pendingRenewal_idx" ON "SslCertificate"("pendingRenewal");

-- CreateIndex
CREATE INDEX "SslCertificate_createdAt_idx" ON "SslCertificate"("createdAt");
