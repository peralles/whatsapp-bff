-- CreateTable
CREATE TABLE "webhook_messages" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "instanceName" TEXT NOT NULL,
    "messageType" TEXT,

    CONSTRAINT "webhook_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "webhook_messages_phoneNumber_idx" ON "webhook_messages"("phoneNumber");
