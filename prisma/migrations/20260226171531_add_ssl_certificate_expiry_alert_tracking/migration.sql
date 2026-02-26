-- AlterTable
ALTER TABLE "SslCertificate" ADD COLUMN     "lastExpiryAlertFor" TIMESTAMP(3),
ADD COLUMN     "lastExpiryAlertSentAt" TIMESTAMP(3);
