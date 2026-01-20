-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'viewer';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "refresh_token_hash" VARCHAR(500),
ADD COLUMN     "reset_token" VARCHAR(255),
ADD COLUMN     "reset_token_expiry" TIMESTAMP;
