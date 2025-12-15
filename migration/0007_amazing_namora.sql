CREATE TABLE "oauth" (
	"provider_id" varchar(256) NOT NULL,
	"provider_user_id" varchar(256) NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_provider_id_provider_user_id_pk" PRIMARY KEY("provider_id","provider_user_id")
);
--> statement-breakpoint
ALTER TABLE "oauth" ADD CONSTRAINT "oauth_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;