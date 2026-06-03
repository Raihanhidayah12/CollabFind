-- Testimonials Schema for the Landing Page

CREATE TABLE IF NOT EXISTS public.testimonials (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    role text NOT NULL,
    quote text NOT NULL,
    avatar_initial text,
    accent_color text DEFAULT '#8b5cf6', -- Default purple
    stars integer DEFAULT 5,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testimonials are viewable by everyone."
    ON public.testimonials FOR SELECT
    USING (is_active = true);

-- Insert dummy data
INSERT INTO public.testimonials (name, role, quote, avatar_initial, accent_color) VALUES
('Alex Johnson', 'Software Engineer', 'CollabFind helped me find the perfect team for my side project. The talent here is unmatched!', 'A', '#3b82f6'),
('Sarah Lee', 'Product Designer', 'I was able to collaborate with developers from across the globe and build an amazing portfolio piece.', 'S', '#ec4899'),
('Michael Chen', 'Full Stack Developer', 'The project matching system is incredibly accurate. Found a team building exactly what I wanted to learn.', 'M', '#10b981'),
('Emily Davis', 'UI/UX Designer', 'As a designer, it''s always hard to find developers to bring my ideas to life. CollabFind solved that for me.', 'E', '#f59e0b'),
('David Kim', 'Backend Developer', 'Built a real-time chat application with a team I met here. We even launched it on Product Hunt!', 'D', '#8b5cf6'),
('Jessica Wilson', 'Frontend Developer', 'The community is supportive and the platform is so easy to use. Highly recommend for any builder.', 'J', '#ef4444');
