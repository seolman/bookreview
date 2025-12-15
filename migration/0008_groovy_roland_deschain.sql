ALTER TABLE "oauth" RENAME COLUMN "provider_id" TO "provider";--> statement-breakpoint
ALTER TABLE "oauth" DROP CONSTRAINT "oauth_provider_id_provider_user_id_pk";--> statement-breakpoint
ALTER TABLE "oauth" ADD CONSTRAINT "oauth_provider_provider_user_id_pk" PRIMARY KEY("provider","provider_user_id");