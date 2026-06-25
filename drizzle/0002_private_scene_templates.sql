CREATE TABLE "user_scene_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"asset_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_scene_templates" ADD CONSTRAINT "user_scene_templates_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_scene_templates" ADD CONSTRAINT "user_scene_templates_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "user_scene_templates_user_created_idx" ON "user_scene_templates" USING btree ("user_id","created_at");
--> statement-breakpoint
CREATE INDEX "user_scene_templates_user_category_idx" ON "user_scene_templates" USING btree ("user_id","category");
