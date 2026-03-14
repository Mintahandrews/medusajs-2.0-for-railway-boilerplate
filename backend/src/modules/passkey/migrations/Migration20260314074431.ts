import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260314074431 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "passkey_credential" drop constraint if exists "passkey_credential_credential_id_unique";`);
    this.addSql(`create table if not exists "passkey_credential" ("id" text not null, "credential_id" text not null, "public_key" text not null, "counter" integer not null default 0, "transports" text not null default '[]', "customer_id" text not null, "device_name" text not null default 'Unknown device', "webauthn_user_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "passkey_credential_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_passkey_credential_credential_id_unique" ON "passkey_credential" ("credential_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_passkey_credential_deleted_at" ON "passkey_credential" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "passkey_credential" cascade;`);
  }

}
