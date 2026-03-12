-- SchoolOS Demo Seed Data
-- Run AFTER schema.sql
-- Creates believable demo data for Westlake Academy

-- ============================================================
-- NOTE: Auth users must be created via Supabase Auth API or
-- the Supabase dashboard. The seed.sql below assumes those
-- auth user UUIDs have been created and inserts profile/data.
-- For local dev, use the seed script: npm run seed
-- ============================================================

-- Demo School
INSERT INTO schools (id, name, address, phone, website) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Westlake Academy', '1200 Lakeview Blvd, Austin, TX 78701', '(512) 555-0100', 'https://westlakeacademy.edu');

-- ============================================================
-- PROFILES (seeded by the seed.ts script using service role)
-- These UUIDs match what seed.ts creates in auth.users
-- ============================================================

-- Admin
INSERT INTO profiles (id, email, full_name, role, school_id) VALUES
  ('10000000-0000-0000-0000-000000000001', 'admin@westlake.edu', 'Sarah Mitchell', 'admin', '00000000-0000-0000-0000-000000000001');

-- Teachers
INSERT INTO profiles (id, email, full_name, role, school_id) VALUES
  ('10000000-0000-0000-0000-000000000002', 'mrjohnson@westlake.edu', 'David Johnson', 'teacher', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000003', 'mswilliams@westlake.edu', 'Amanda Williams', 'teacher', '00000000-0000-0000-0000-000000000001');

-- Coach
INSERT INTO profiles (id, email, full_name, role, school_id) VALUES
  ('10000000-0000-0000-0000-000000000004', 'coachthompson@westlake.edu', 'Marcus Thompson', 'coach', '00000000-0000-0000-0000-000000000001');

-- Parents
INSERT INTO profiles (id, email, full_name, role, school_id, phone) VALUES
  ('10000000-0000-0000-0000-000000000005', 'jennifer.hayes@gmail.com', 'Jennifer Hayes', 'parent', '00000000-0000-0000-0000-000000000001', '(512) 555-0201'),
  ('10000000-0000-0000-0000-000000000006', 'robert.chen@gmail.com', 'Robert Chen', 'parent', '00000000-0000-0000-0000-000000000001', '(512) 555-0202');

-- Students (as users with student role)
INSERT INTO profiles (id, email, full_name, role, school_id) VALUES
  ('10000000-0000-0000-0000-000000000007', 'emma.hayes@westlake.edu', 'Emma Hayes', 'student', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000008', 'liam.chen@westlake.edu', 'Liam Chen', 'student', '00000000-0000-0000-0000-000000000001');

-- ============================================================
-- STUDENTS
-- ============================================================
INSERT INTO students (id, user_id, school_id, first_name, last_name, grade, student_id_number, emergency_contact_name, emergency_contact_phone) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Emma', 'Hayes', '10th', 'WLA-2024-001', 'Jennifer Hayes', '(512) 555-0201'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Liam', 'Chen', '9th', 'WLA-2024-002', 'Robert Chen', '(512) 555-0202');

-- ============================================================
-- PARENT-STUDENT LINKS
-- ============================================================
INSERT INTO parent_students (parent_id, student_id, relationship) VALUES
  ('10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', 'mother'),
  ('10000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', 'father');

-- ============================================================
-- TEAMS
-- ============================================================
INSERT INTO teams (id, school_id, name, sport, season, coach_id, description) VALUES
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Westlake Varsity Soccer', 'Soccer', 'Fall 2024', '10000000-0000-0000-0000-000000000004', 'Competitive varsity soccer team competing in District 14-6A'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Westlake JV Basketball', 'Basketball', 'Winter 2024', '10000000-0000-0000-0000-000000000004', 'Junior varsity basketball team');

-- ============================================================
-- TEAM MEMBERSHIPS
-- ============================================================
INSERT INTO team_memberships (team_id, student_id, jersey_number, position) VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '7', 'Midfielder'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '14', 'Guard');

-- ============================================================
-- CLASSES
-- ============================================================
INSERT INTO classes (id, school_id, teacher_id, name, subject, grade_level, period, room) VALUES
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'AP Biology', 'Science', '10th', '2nd', 'Room 204'),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'World History', 'History', '9th', '3rd', 'Room 118'),
  ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'English Literature', 'English', '10th', '4th', 'Room 211'),
  ('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Creative Writing', 'English', '9th', '1st', 'Room 211');

-- ============================================================
-- STUDENT ENROLLMENTS
-- ============================================================
INSERT INTO student_classes (student_id, class_id) VALUES
  ('20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004');

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
INSERT INTO announcements (author_id, school_id, team_id, title, body, category, is_pinned, published_at) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'Welcome Back — Spring Semester 2024',
    'We are excited to welcome everyone back for the spring semester! Please review the updated school calendar and ensure all required forms are submitted by January 19th. The front office is open 7:30am–4:30pm Monday through Friday.',
    'school',
    TRUE,
    NOW() - INTERVAL '2 days'
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'URGENT: Early Dismissal This Friday',
    'Due to district-wide staff development, all students will be dismissed at 12:30pm this Friday, March 15th. Please ensure your student has arranged transportation accordingly.',
    'urgent',
    TRUE,
    NOW() - INTERVAL '1 day'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'Soccer: District Playoffs This Weekend',
    'Great news — we have advanced to the district playoffs! Games are Saturday at 10am and 2pm at Burger Stadium. Team gear is required. Parents, please arrive by 9:30am for warm-ups. GO CHAPARRALS!',
    'team',
    FALSE,
    NOW() - INTERVAL '3 hours'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'AP Biology: Lab Reports Due Monday',
    'Reminder that your Cell Division lab reports are due this Monday by 11:59pm via the portal. Late submissions will be deducted 10 points per day. Office hours are available Thursday 3–4pm.',
    'class',
    FALSE,
    NOW() - INTERVAL '6 hours'
  );

-- ============================================================
-- MESSAGES
-- ============================================================
INSERT INTO messages (id, sender_id, school_id, subject, body, category, created_at) VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Emma is doing great in AP Bio!',
    'Hi Jennifer, I wanted to reach out and let you know that Emma has been absolutely fantastic this semester. Her recent lab work showed real critical thinking, and she is on track for an A. Looking forward to seeing her continue to grow. — Mr. Johnson',
    'class',
    NOW() - INTERVAL '1 day'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Playoff Schedule — Important Info',
    'Hi Jennifer, just a reminder that Emma needs to be at the field by 9am Saturday for the playoff warmup. Please make sure she has her full kit including shin guards. Let me know if you have any questions. — Coach Thompson',
    'team',
    NOW() - INTERVAL '5 hours'
  );

-- Message recipients (sent to Jennifer Hayes)
INSERT INTO message_recipients (message_id, recipient_id) VALUES
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005'),
  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005');

-- ============================================================
-- EVENTS
-- ============================================================
INSERT INTO events (school_id, team_id, created_by, title, description, event_type, start_time, end_time, location) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    NULL,
    '10000000-0000-0000-0000-000000000001',
    'Spring Semester Parent Night',
    'Join us for our semester kick-off parent information night. Learn about curriculum updates, upcoming events, and meet the teachers.',
    'school',
    (NOW() + INTERVAL '5 days')::date + TIME '18:00:00',
    (NOW() + INTERVAL '5 days')::date + TIME '20:00:00',
    'Westlake Academy Main Auditorium'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000004',
    'Soccer District Playoff — Game 1',
    'District 14-6A Playoff Round 1. Come out and support the Chaparrals!',
    'athletics',
    (NOW() + INTERVAL '3 days')::date + TIME '10:00:00',
    (NOW() + INTERVAL '3 days')::date + TIME '12:00:00',
    'Burger Stadium, Austin'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000004',
    'Soccer District Playoff — Game 2 (if needed)',
    'District 14-6A Playoff Round 1, second game.',
    'athletics',
    (NOW() + INTERVAL '3 days')::date + TIME '14:00:00',
    (NOW() + INTERVAL '3 days')::date + TIME '16:00:00',
    'Burger Stadium, Austin'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    NULL,
    '10000000-0000-0000-0000-000000000001',
    'Spring Break Begins',
    'No school. Spring break March 24–28.',
    'school',
    (NOW() + INTERVAL '12 days')::date + TIME '00:00:00',
    NULL,
    'N/A'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000004',
    'JV Basketball Practice',
    'Regular practice session. Mandatory attendance.',
    'athletics',
    (NOW() + INTERVAL '1 day')::date + TIME '15:30:00',
    (NOW() + INTERVAL '1 day')::date + TIME '17:00:00',
    'Main Gymnasium'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    NULL,
    '10000000-0000-0000-0000-000000000002',
    'AP Exam Registration Deadline',
    'Last day to register for AP exams. See Mr. Johnson or the front office.',
    'academic',
    (NOW() + INTERVAL '7 days')::date + TIME '23:59:00',
    NULL,
    'Front Office'
  );

-- ============================================================
-- ATTENDANCE (sample records for Emma)
-- ============================================================
INSERT INTO attendance_records (student_id, date, status) VALUES
  ('20000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, 'present'),
  ('20000000-0000-0000-0000-000000000001', CURRENT_DATE - 2, 'present'),
  ('20000000-0000-0000-0000-000000000001', CURRENT_DATE - 3, 'tardy'),
  ('20000000-0000-0000-0000-000000000001', CURRENT_DATE - 4, 'present'),
  ('20000000-0000-0000-0000-000000000001', CURRENT_DATE - 5, 'present'),
  ('20000000-0000-0000-0000-000000000002', CURRENT_DATE - 1, 'present'),
  ('20000000-0000-0000-0000-000000000002', CURRENT_DATE - 2, 'absent'),
  ('20000000-0000-0000-0000-000000000002', CURRENT_DATE - 3, 'present');
