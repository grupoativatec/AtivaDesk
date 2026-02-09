-- CreateTable
CREATE TABLE "UpdatePostFeedback" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpdatePostFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UpdatePostFeedback_postId_idx" ON "UpdatePostFeedback"("postId");

-- AddForeignKey
ALTER TABLE "UpdatePostFeedback" ADD CONSTRAINT "UpdatePostFeedback_postId_fkey" FOREIGN KEY ("postId") REFERENCES "UpdatePost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
