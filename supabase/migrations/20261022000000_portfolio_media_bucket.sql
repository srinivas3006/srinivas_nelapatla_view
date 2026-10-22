-- Public bucket for images uploaded from the admin panel (src/lib/api/content.server.ts
-- uploads to "portfolio-media" with the service role, which bypasses RLS; public
-- read access comes from the bucket being public).
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;
