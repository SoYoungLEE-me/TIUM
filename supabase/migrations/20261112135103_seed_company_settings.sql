-- Insert default company settings
INSERT INTO public.company_settings (id)
VALUES (true)
ON CONFLICT (id) DO NOTHING;