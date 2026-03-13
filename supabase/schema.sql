-- SchoolOS MVP Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SCHOOLS
-- ============================================================
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'coach', 'parent', 'student')),
  school_id UUID REFERENCES schools(id),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  school_id UUID NOT NULL REFERENCES schools(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  date_of_birth DATE,
  student_id_number TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PARENT <-> STUDENT RELATIONSHIPS
-- ============================================================
CREATE TABLE parent_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'parent',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- ============================================================
-- TEAMS
-- ============================================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id),
  name TEXT NOT NULL,
  sport TEXT NOT NULL,
  season TEXT NOT NULL,
  coach_id UUID REFERENCES profiles(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TEAM MEMBERSHIPS (student on a team)
-- ============================================================
CREATE TABLE team_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  jersey_number TEXT,
  position TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, student_id)
);

-- ============================================================
-- CLASSES
-- ============================================================
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id),
  teacher_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  period TEXT,
  room TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STUDENT <-> CLASS ENROLLMENTS
-- ============================================================
CREATE TABLE student_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, class_id)
);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id),
  school_id UUID NOT NULL REFERENCES schools(id),
  team_id UUID REFERENCES teams(id),
  class_id UUID REFERENCES classes(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('school', 'team', 'class', 'urgent')),
  is_pinned BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id),
  school_id UUID NOT NULL REFERENCES schools(id),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'class', 'team', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE message_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, recipient_id)
);

-- ============================================================
-- EVENTS (calendar)
-- ============================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id),
  team_id UUID REFERENCES teams(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('school', 'athletics', 'academic', 'other')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ATTENDANCE (placeholder)
-- ============================================================
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id),
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'tardy', 'excused')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date, class_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, edit own; trigger can insert
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Schools: all authenticated users can view
CREATE POLICY "schools_select" ON schools FOR SELECT USING (auth.role() = 'authenticated');

-- Students: all authenticated users in the school can view
CREATE POLICY "students_select" ON students FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "students_insert_admin" ON students FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "students_update_admin" ON students FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Parent-student: parents see their own links; admins see all
CREATE POLICY "parent_students_select" ON parent_students FOR SELECT USING (
  parent_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher', 'coach'))
);

-- Teams: all authenticated users can view
CREATE POLICY "teams_select" ON teams FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "teams_write" ON teams FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);

-- Team memberships: all can view
CREATE POLICY "team_memberships_select" ON team_memberships FOR SELECT USING (auth.role() = 'authenticated');

-- Classes: all authenticated users can view
CREATE POLICY "classes_select" ON classes FOR SELECT USING (auth.role() = 'authenticated');

-- Announcements: all can read; staff can write
CREATE POLICY "announcements_select" ON announcements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "announcements_insert" ON announcements FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher', 'coach'))
);
CREATE POLICY "announcements_update" ON announcements FOR UPDATE USING (
  author_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Messages: sender or recipient can read
CREATE POLICY "messages_select" ON messages FOR SELECT USING (
  sender_id = auth.uid() OR
  EXISTS (SELECT 1 FROM message_recipients WHERE message_id = id AND recipient_id = auth.uid())
);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher', 'coach'))
);

-- Message recipients: own records
CREATE POLICY "message_recipients_select" ON message_recipients FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "message_recipients_update" ON message_recipients FOR UPDATE USING (recipient_id = auth.uid());

-- Events: all can view
CREATE POLICY "events_select" ON events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher', 'coach'))
);

-- Attendance: admins, teachers, parents of student
CREATE POLICY "attendance_select" ON attendance_records FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher')) OR
  EXISTS (SELECT 1 FROM parent_students WHERE parent_id = auth.uid() AND student_id = attendance_records.student_id)
);

-- ============================================================
-- TRIGGER: auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
