
-- =========== ROLES ===========
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- =========== PROFILES ===========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles readable by authed" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile + default 'student' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========== COURSES ===========
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  eligibility TEXT NOT NULL DEFAULT '',
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses public read" ON public.courses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage courses" ON public.courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.courses (name, duration, description, eligibility, icon) VALUES
  ('Hifz-ul-Quran','2-4 Years','Complete memorization of the Holy Quran with proper Tajweed under expert Huffaz.','Age 7+ with Nazra completion','BookOpen'),
  ('Nazra Quran','1 Year','Learn to read the Holy Quran fluently with correct pronunciation.','Age 5+','Book'),
  ('Tajweed','6 Months','Master the rules of Quranic recitation as taught by the early scholars.','Nazra completion','Mic'),
  ('Alim Course','6-8 Years','Comprehensive Islamic scholarship: Quran, Hadith, Fiqh, Arabic, Usool.','Class 8 pass + Hifz preferred','GraduationCap'),
  ('Arabic Language','1 Year','Classical Arabic grammar (Nahw & Sarf) and conversation.','Age 12+','Languages'),
  ('Islamic Studies','1 Year','Aqeedah, Seerah, Fiqh basics and Islamic history.','Age 10+','Scroll');

-- =========== TEACHERS ===========
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  qualification TEXT NOT NULL DEFAULT '',
  specialization TEXT NOT NULL DEFAULT '',
  experience TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.teachers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.teachers TO authenticated;
GRANT ALL ON public.teachers TO service_role;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers public read" ON public.teachers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Teachers/admins manage faculty" ON public.teachers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'teacher'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'teacher'));

-- =========== STUDENTS ===========
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  roll_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  father_name TEXT NOT NULL DEFAULT '',
  date_of_birth DATE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  address TEXT,
  mobile TEXT,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own" ON public.students FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Teachers/admins manage students" ON public.students FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'));

-- =========== ADMISSIONS ===========
CREATE TABLE public.admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  address TEXT NOT NULL,
  date_of_birth DATE,
  previous_education TEXT,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.admissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.admissions TO authenticated;
GRANT ALL ON public.admissions TO service_role;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can apply" ON public.admissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Teachers/admins read admissions" ON public.admissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Teachers/admins manage admissions" ON public.admissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete admissions" ON public.admissions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- =========== RESULTS ===========
CREATE TABLE public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  exam_name TEXT NOT NULL,
  exam_date DATE,
  total_marks INTEGER NOT NULL DEFAULT 100,
  obtained_marks INTEGER NOT NULL,
  grade TEXT,
  remarks TEXT,
  subjects JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.results TO authenticated;
GRANT ALL ON public.results TO service_role;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own results" ON public.results FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid())
  OR public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "Teachers/admins manage results" ON public.results FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'));

-- =========== NOTICES ===========
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'news',
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.notices TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.notices TO authenticated;
GRANT ALL ON public.notices TO service_role;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notices public read" ON public.notices FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Teachers/admins manage notices" ON public.notices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'));

INSERT INTO public.notices (title, body, category, pinned) VALUES
  ('Admissions Open 2026', 'New academic session admissions are now open for all courses. Apply before 30th Ramadan.', 'announcement', true),
  ('Annual Quran Competition', 'Inter-class Hifz competition scheduled for next month. Register with your class teacher.', 'event', false),
  ('Eid Holidays Notice', 'Madarsa will remain closed for 5 days during Eid-ul-Fitr.', 'circular', false);

-- =========== EVENTS ===========
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events public read" ON public.events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Teachers/admins manage events" ON public.events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'));

-- =========== GALLERY ===========
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'events',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery TO authenticated;
GRANT ALL ON public.gallery TO service_role;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gallery public read" ON public.gallery FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Teachers/admins manage gallery" ON public.gallery FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'));

-- =========== DONATIONS ===========
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  amount NUMERIC NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'general',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.donations TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record a pledge" ON public.donations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read donations" ON public.donations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- =========== CONTACTS ===========
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contacts TO anon, authenticated;
GRANT SELECT, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact" ON public.contacts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read contacts" ON public.contacts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
