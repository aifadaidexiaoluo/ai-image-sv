CREATE TABLE "asset_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"tag" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "display_name" text;--> statement-breakpoint
UPDATE "assets" SET "display_name" = "file_name" WHERE "display_name" IS NULL;--> statement-breakpoint
ALTER TABLE "assets" ALTER COLUMN "display_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "style" text;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "asset_tags" ADD CONSTRAINT "asset_tags_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_tags" ADD CONSTRAINT "asset_tags_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_tags_asset_idx" ON "asset_tags" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "asset_tags_user_tag_idx" ON "asset_tags" USING btree ("user_id","tag");
