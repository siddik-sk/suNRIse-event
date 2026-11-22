-- Email OTP verification: short-lived hashed codes for 6-digit verification.
ALTER TABLE "users" ADD COLUMN "emailOtpHash" TEXT,
ADD COLUMN "emailOtpExpiresAt" TIMESTAMP(3),
ADD COLUMN "emailOtpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "emailOtpSentAt" TIMESTAMP(3);
