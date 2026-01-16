-- CreateEnum (IF NOT EXISTS não é suportado diretamente, então verificamos antes)
DO $$ BEGIN
    CREATE TYPE "NotificationType" AS ENUM ('NEW_TICKET', 'NEW_MESSAGE', 'TICKET_ASSIGNED', 'TICKET_STATUS_CHANGED', 'TICKET_PRIORITY_CHANGED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum (IF NOT EXISTS não é suportado diretamente, então verificamos antes)
DO $$ BEGIN
    CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticketId" TEXT,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_ticketId_idx" ON "Notification"("ticketId");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "Notification"("status");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
