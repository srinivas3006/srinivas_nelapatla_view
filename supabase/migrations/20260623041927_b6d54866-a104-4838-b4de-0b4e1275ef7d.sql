
CREATE POLICY "Authenticated read portfolio images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'portfolio-images');
CREATE POLICY "Anon read portfolio images" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'portfolio-images');
CREATE POLICY "Admins upload portfolio images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update portfolio images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete portfolio images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio-images' AND public.has_role(auth.uid(), 'admin'));
