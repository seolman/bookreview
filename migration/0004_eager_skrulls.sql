ALTER TABLE "comments" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "reviewId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_reviewId_reviews_id_fk" FOREIGN KEY ("reviewId") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;