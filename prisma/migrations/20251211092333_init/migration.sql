-- CreateEnum
CREATE TYPE "item_status" AS ENUM ('available', 'occupied', 'maintenance', 'reserved', 'cleaning', 'outOfService');

-- CreateEnum
CREATE TYPE "role_scope" AS ENUM ('system', 'organization', 'property');

-- CreateTable
CREATE TABLE "organization" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "timezone" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50),
    "address" VARCHAR(500) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100),
    "country" VARCHAR(100) NOT NULL,
    "postal_code" VARCHAR(20),
    "phone" VARCHAR(50),
    "email" VARCHAR(100),
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "timezone" VARCHAR(50),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "check_in_time" VARCHAR(10),
    "check_out_time" VARCHAR(10),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50),
    "description" TEXT,
    "status" "item_status" NOT NULL DEFAULT 'available',
    "item_type" VARCHAR(50),
    "floor" INTEGER,
    "max_occupancy" INTEGER,
    "price" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "password_reset_token" VARCHAR(255),
    "password_reset_expiry" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "scope" "role_scope" NOT NULL,
    "description" TEXT,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "property_id" INTEGER,
    "role_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" DATE,
    "end_date" DATE,
    "employee_id" VARCHAR(50),
    "department" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" INTEGER,
    "changes" JSONB,
    "ip_address" VARCHAR(50),
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_setting" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_code_key" ON "organization"("code");

-- CreateIndex
CREATE INDEX "idx_org_active" ON "organization"("is_active");

-- CreateIndex
CREATE INDEX "idx_org_code" ON "organization"("code");

-- CreateIndex
CREATE UNIQUE INDEX "property_code_key" ON "property"("code");

-- CreateIndex
CREATE INDEX "idx_prop_org_active" ON "property"("organization_id", "is_active");

-- CreateIndex
CREATE INDEX "idx_prop_code" ON "property"("code");

-- CreateIndex
CREATE INDEX "idx_prop_location" ON "property"("city", "country");

-- CreateIndex
CREATE UNIQUE INDEX "item_code_key" ON "item"("code");

-- CreateIndex
CREATE INDEX "idx_item_prop_status" ON "item"("property_id", "status", "is_active");

-- CreateIndex
CREATE INDEX "idx_item_code" ON "item"("code");

-- CreateIndex
CREATE INDEX "idx_item_status" ON "item"("status");

-- CreateIndex
CREATE INDEX "idx_item_type" ON "item"("item_type");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "user"("email");

-- CreateIndex
CREATE INDEX "idx_user_active" ON "user"("is_active");

-- CreateIndex
CREATE INDEX "idx_user_last_login" ON "user"("last_login_at");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE INDEX "idx_role_scope_active" ON "role"("scope", "is_active");

-- CreateIndex
CREATE INDEX "idx_staff_org_active" ON "staff"("organization_id", "is_active");

-- CreateIndex
CREATE INDEX "idx_staff_prop_active" ON "staff"("property_id", "is_active");

-- CreateIndex
CREATE INDEX "idx_staff_user" ON "staff"("user_id");

-- CreateIndex
CREATE INDEX "idx_staff_role" ON "staff"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_staff_assignment" ON "staff"("user_id", "organization_id", "property_id");

-- CreateIndex
CREATE INDEX "idx_audit_user_time" ON "audit_log"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_audit_entity" ON "audit_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_audit_action_time" ON "audit_log"("action", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "system_setting_key_key" ON "system_setting"("key");

-- CreateIndex
CREATE INDEX "idx_setting_key" ON "system_setting"("key");

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
