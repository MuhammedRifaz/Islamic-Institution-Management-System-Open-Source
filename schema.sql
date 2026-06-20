-- IIMS Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Custom Types
CREATE TYPE public.user_role AS ENUM (
    'public', 'admin', 'khatheeb', 'president', 'secretary', 
    'cleaning_minister', 'treasurer', 'member_byma', 'enumerator', 'student_raulathul'
);

-- 2. Profiles Table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    phone_number TEXT,
    role public.user_role DEFAULT 'public'::public.user_role,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Core Tables
CREATE TABLE public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    instructor TEXT,
    duration TEXT,
    course_type TEXT,
    badge TEXT,
    audience TEXT,
    schedule_time TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.course_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

CREATE TABLE public.attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    marked_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date)
);

CREATE TABLE public.census_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    house_number TEXT,
    family_head TEXT,
    total_members INTEGER,
    contact_number TEXT,
    address TEXT,
    enumerator_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.fee_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type TEXT NOT NULL,
    description TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.samaja_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic TEXT NOT NULL,
    event_date DATE NOT NULL,
    prayer_id UUID REFERENCES public.profiles(id),
    welcome_speech_id UUID REFERENCES public.profiles(id),
    inauguration_id UUID REFERENCES public.profiles(id),
    p_address_id UUID REFERENCES public.profiles(id),
    qiraath_id UUID REFERENCES public.profiles(id),
    thadrees_id UUID REFERENCES public.profiles(id),
    report_id UUID REFERENCES public.profiles(id),
    vote_of_thanks_id UUID REFERENCES public.profiles(id),
    speech_ids UUID[] DEFAULT '{}',
    song_ids UUID[] DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.student_notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Unread',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Auth Triggers
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'phone_number',
    'public'::user_role
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.census_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.samaja_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- 6. Helper Function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role 
LANGUAGE sql 
SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated, anon, service_role;

-- 7. Basic Security Policies (Expand as needed for your specific deployment)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Note: In a production environment, you should add specific RLS policies for each table
-- to restrict access based on the public.get_user_role(auth.uid()) function.
