-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'coordinator', 'driver', 'collector', 'vendor', 'viewer');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('driver', 'collector', 'mechanic', 'supervisor');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('active', 'inactive', 'vacation', 'suspended');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('A', 'B', 'C', 'D', 'E');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'viewer',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "refresh_token_hash" VARCHAR(500),
    "refresh_token_created_at" TIMESTAMP,
    "refresh_token_expires_at" TIMESTAMP,
    "reset_token" VARCHAR(255),
    "reset_token_expiry" TIMESTAMP,
    "last_login" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "employee_number" VARCHAR(20) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" "StaffRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "status" "StaffStatus" NOT NULL DEFAULT 'active',
    "hire_date" DATE NOT NULL,
    "birth_date" DATE NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "address" TEXT,
    "emergency_contact" VARCHAR(255),
    "emergency_phone" VARCHAR(20),
    "license_number" VARCHAR(50),
    "license_type" "LicenseType",
    "license_expiry" DATE,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_id_key" ON "staff"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_employee_number_key" ON "staff"("employee_number");

-- CreateIndex
CREATE INDEX "staff_employee_number_idx" ON "staff"("employee_number");

-- CreateIndex
CREATE INDEX "staff_role_idx" ON "staff"("role");

-- CreateIndex
CREATE INDEX "staff_status_idx" ON "staff"("status");

-- CreateIndex
CREATE INDEX "staff_user_id_idx" ON "staff"("user_id");

-- CreateIndex
CREATE INDEX "staff_license_expiry_idx" ON "staff"("license_expiry");

-- CreateIndex
CREATE INDEX "staff_is_active_idx" ON "staff"("is_active");

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
