-- AlterTable
ALTER TABLE "users" ADD COLUMN     "refresh_token_created_at" TIMESTAMP,
ADD COLUMN     "refresh_token_expires_at" TIMESTAMP;
