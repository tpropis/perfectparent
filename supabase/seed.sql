-- SchoolOS Demo Seed Data — Westlake Academy
-- Run AFTER schema.sql
--
-- ⚠️  PREREQUISITE: Auth users must exist before running this file.
--
-- RECOMMENDED: run `npm run seed` — it creates auth users + all data automatically.
--
-- MANUAL ALTERNATIVE (Supabase dashboard):
--   1. Go to Authentication → Users → Add User (email confirm ON)
--   2. Create all 8 users from the README table with their full_name + role metadata
--   3. Then run this file in the SQL editor
--
-- This file uses email-based lookups for all profile references so it works
-- regardless of what UUIDs Supabase assigned to the auth users.

-- ============================================================
-- SCHOOL
-- ============================================================
INSERT INTO schools (id, name, address, phone, website)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Westlake Academy',
  '1200 Lakeview Blvd, Austin, TX 78701',
  '(512) 555-0100',
  'https://westlakeacademy.edu'
)
ON CONFLICT (id) DO UPDATE SET
  name    = EXCLUDED.name,
  address = EXCLUDED.address,
  phone   = EXCLUDED.phone,
  website = EXCLUDED.website;

-- ============================================================
-- PROFILES
-- The handle_new_user trigger already created these rows when
-- auth users were registered. We just fill in school_id + phone.
-- ============================================================
UPDATE profiles SET school_id = '00000000-0000-0000-0000-000000000001', role = 'admin'
  WHERE email = 'admin@westlake.edu';

UPDATE profiles SET school_id = '00000000-0000-0000-0000-000000000001', role = 'teacher'
  WHERE email = 'mrjohnson@westlake.edu';

UPDATE profiles SET school_id = '00000000-0000-0000-0000-000000000001', role = 'teacher'
  WHERE email = 'mswilliams@westlake.edu';

UPDATE profiles SET school_id = '00000000-0000-0000-0000-000000000001', role = 'coach'
  WHERE email = 'coachthompson@westlake.edu';

UPDATE profiles SET school_id = '00000000-0000-0000-0000-000000000001', role = 'parent', phone = '(512) 555-0201'
  WHERE email = 'jennifer.hayes@gmail.com';

UPDATE profiles SET school_id = '00000000-0000-0000-0000-000000000001', role = 'parent', phone = '(512) 555-0202'
  WHERE email = 'robert.chen@gmail.com';

UPDATE profiles SET school_id = '00000000-0000-0000-0000-000000000001', role = 'student'
  WHERE email = 'emma.hayes@westlake.edu';

UPDATE profiles SET school_id = '00000000-0000-0000-0000-000000000001', role = 'student'
  WHERE email = 'liam.chen@westlake.edu';

-- ============================================================
-- STUDENTS
-- ============================================================
INSERT INTO students (id, user_id, school_id, first_name, last_name, grade, student_id_number, emergency_contact_name, emergency_contact_phone)
VALUES (
  '20000000-0000-0000-0000-000000000001',
  (SELECT id FROM profiles WHERE email = 'emma.hayes@westlake.edu'),
  '00000000-0000-0000-0000-000000000001',
  'Emma', 'Hayes', '10th', 'WLA-2024-001', 'Jennifer Hayes', '(512) 555-0201'
), (
  '20000000-0000-0000-0000-000000000002',
  (SELECT id FROM profiles WHERE email = 'liam.chen@westlake.edu'),
  '00000000-0000-0000-0000-000000000001',
  'Liam', 'Chen', '9th', 'WLA-2024-002', 'Robert Chen', '(512) 555-0202'
)
ON CONFLICT (id) DO UPDATE SET
  user_id   = EXCLUDED.user_id,
  first_name = EXCLUDED.first_name,
  last_name  = EXCLUDED.last_name,
  grade      = EXCLUDED.grade;

-- ============================================================
-- PARENT-STUDENT LINKS
-- ============================================================
INSERT INTO parent_students (parent_id, student_id, relationship)
VALUES (
  (SELECT id FROM profiles WHERE email = 'jennifer.hayes@gmail.com'),
  '20000000-0000-0000-0000-000000000001',
  'mother'
), (
  (SELECT id FROM profiles WHERE email = 'robert.chen@gmail.com'),
  '20000000-0000-0000-0000-000000000002',
  'father'
)
ON CONFLICT (parent_id, student_id) DO NOTHING;

-- ============================================================
-- TEAMS
-- ============================================================
INSERT INTO teams (id, school_id, name, sport, season, coach_id, description)
VALUES (
  '30000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Westlake Varsity Soccer', 'Soccer', 'Fall 2024',
  (SELECT id FROM profiles WHERE email = 'coachthompson@westlake.edu'),
  'Competitive varsity soccer team competing in District 14-6A'
), (
  '30000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Westlake JV Basketball', 'Basketball', 'Winter 2024',
  (SELECT id FROM profiles WHERE email = 'coachthompson@westlake.edu'),
  'Junior varsity basketball team'
)
ON CONFLICT (id) DO UPDATE SET
  coach_id    = EXCLUDED.coach_id,
  description = EXCLUDED.description;

-- ============================================================
-- TEAM MEMBERSHIPS
-- ============================================================
INSERT INTO team_memberships (team_id, student_id, jersey_number, position)
VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '7',  'Midfielder'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '14', 'Guard')
ON CONFLICT (team_id, student_id) DO NOTHING;

-- ============================================================
-- CLASSES
-- ============================================================
INSERT INTO classes (id, school_id, teacher_id, name, subject, grade_level, period, room)
VALUES (
  '40000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM profiles WHERE email = 'mrjohnson@westlake.edu'),
  'AP Biology', 'Science', '10th', '2nd', 'Room 204'
), (
  '40000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM profiles WHERE email = 'mrjohnson@westlake.edu'),
  'World History', 'History', '9th', '3rd', 'Room 118'
), (
  '40000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM profiles WHERE email = 'mswilliams@westlake.edu'),
  'English Literature', 'English', '10th', '4th', 'Room 211'
), (
  '40000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM profiles WHERE email = 'mswilliams@westlake.edu'),
  'Creative Writing', 'English', '9th', '1st', 'Room 211'
)
ON CONFLICT (id) DO UPDATE SET
  teacher_id = EXCLUDED.teacher_id,
  name       = EXCLUDED.name;

-- ============================================================
-- STUDENT ENROLLMENTS
-- ============================================================
INSERT INTO student_classes (student_id, class_id)
VALUES
  ('20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004')
ON CONFLICT (student_id, class_id) DO NOTHING;

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
INSERT INTO announcements (author_id, school_id, team_id, title, body, category, is_pinned, published_at)
VALUES (
  (SELECT id FROM profiles WHERE email = 'admin@westlake.edu'),
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'Welcome Back — Spring Semester 2024',
  'We are excited to welcome everyone back for the spring semester! Please review the updated school calendar and ensure all required forms are submitted by January 19th. The front office is open 7:30am–4:30pm Monday through Friday.',
  'school', TRUE, NOW() - INTERVAL '2 days'
), (
  (SELECT id FROM profiles WHERE email = 'admin@westlake.edu'),
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'URGENT: Early Dismissal This Friday',
  'Due to district-wide staff development, all students will be dismissed at 12:30pm this Friday. Please ensure your student has arranged transportation accordingly.',
  'urgent', TRUE, NOW() - INTERVAL '1 day'
), (
  (SELECT id FROM profiles WHERE email = 'coachthompson@westlake.edu'),
  '00000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  'Soccer: District Playoffs This Weekend',
  'Great news — we have advanced to the district playoffs! Games are Saturday at 10am and 2pm at Burger Stadium. Team gear is required. Parents, please arrive by 9:30am for warm-ups. GO CHAPARRALS!',
  'team', FALSE, NOW() - INTERVAL '3 hours'
), (
  (SELECT id FROM profiles WHERE email = 'mrjohnson@westlake.edu'),
  '00000000-0000-0000-0000-000000000001',
  NULL,
  'AP Biology: Lab Reports Due Monday',
  'Reminder that your Cell Division lab reports are due this Monday by 11:59pm via the portal. Late submissions will be deducted 10 points per day. Office hours are available Thursday 3–4pm.',
  'class', FALSE, NOW() - INTERVAL '6 hours'
);

-- ============================================================
-- MESSAGES
-- ============================================================
INSERT INTO messages (id, sender_id, school_id, subject, body, category, created_at)
VALUES (
  '50000000-0000-0000-0000-000000000001',
  (SELECT id FROM profiles WHERE email = 'mrjohnson@westlake.edu'),
  '00000000-0000-0000-0000-000000000001',
  'Emma is doing great in AP Bio!',
  'Hi Jennifer, I wanted to reach out and let you know that Emma has been absolutely fantastic this semester. Her recent lab work showed real critical thinking, and she is on track for an A. Looking forward to seeing her continue to grow. — Mr. Johnson',
  'class', NOW() - INTERVAL '1 day'
), (
  '50000000-0000-0000-0000-000000000002',
  (SELECT id FROM profiles WHERE email = 'coachthompson@westlake.edu'),
  '00000000-0000-0000-0000-000000000001',
  'Playoff Schedule — Important Info',
  'Hi Jennifer, just a reminder that Emma needs to be at the field by 9am Saturday for the playoff warmup. Please make sure she has her full kit including shin guards. Let me know if you have any questions. — Coach Thompson',
  'team', NOW() - INTERVAL '5 hours'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO message_recipients (message_id, recipient_id)
VALUES (
  '50000000-0000-0000-0000-000000000001',
  (SELECT id FROM profiles WHERE email = 'jennifer.hayes@gmail.com')
), (
  '50000000-0000-0000-0000-000000000002',
  (SELECT id FROM profiles WHERE email = 'jennifer.hayes@gmail.com')
)
ON CONFLICT (message_id, recipient_id) DO NOTHING;

-- ============================================================
-- EVENTS
-- ============================================================
INSERT INTO events (school_id, team_id, created_by, title, description, event_type, start_time, end_time, location)
VALUES (
  '00000000-0000-0000-0000-000000000001', NULL,
  (SELECT id FROM profiles WHERE email = 'admin@westlake.edu'),
  'Spring Semester Parent Night',
  'Join us for our semester kick-off parent information night. Learn about curriculum updates, upcoming events, and meet the teachers.',
  'school',
  (NOW() + INTERVAL '5 days')::date + TIME '18:00:00',
  (NOW() + INTERVAL '5 days')::date + TIME '20:00:00',
  'Westlake Academy Main Auditorium'
), (
  '00000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  (SELECT id FROM profiles WHERE email = 'coachthompson@westlake.edu'),
  'Soccer District Playoff — Game 1',
  'District 14-6A Playoff Round 1. Come out and support the Chaparrals!',
  'athletics',
  (NOW() + INTERVAL '3 days')::date + TIME '10:00:00',
  (NOW() + INTERVAL '3 days')::date + TIME '12:00:00',
  'Burger Stadium, Austin'
), (
  '00000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  (SELECT id FROM profiles WHERE email = 'coachthompson@westlake.edu'),
  'Soccer District Playoff — Game 2 (if needed)',
  'District 14-6A Playoff Round 1, second game.',
  'athletics',
  (NOW() + INTERVAL '3 days')::date + TIME '14:00:00',
  (NOW() + INTERVAL '3 days')::date + TIME '16:00:00',
  'Burger Stadium, Austin'
), (
  '00000000-0000-0000-0000-000000000001', NULL,
  (SELECT id FROM profiles WHERE email = 'admin@westlake.edu'),
  'Spring Break Begins',
  'No school. Spring break.',
  'school',
  (NOW() + INTERVAL '12 days')::date + TIME '00:00:00',
  NULL, 'N/A'
), (
  '00000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  (SELECT id FROM profiles WHERE email = 'coachthompson@westlake.edu'),
  'JV Basketball Practice',
  'Regular practice session. Mandatory attendance.',
  'athletics',
  (NOW() + INTERVAL '1 day')::date + TIME '15:30:00',
  (NOW() + INTERVAL '1 day')::date + TIME '17:00:00',
  'Main Gymnasium'
), (
  '00000000-0000-0000-0000-000000000001', NULL,
  (SELECT id FROM profiles WHERE email = 'mrjohnson@westlake.edu'),
  'AP Exam Registration Deadline',
  'Last day to register for AP exams. See Mr. Johnson or the front office.',
  'academic',
  (NOW() + INTERVAL '7 days')::date + TIME '23:59:00',
  NULL, 'Front Office'
);

-- ============================================================
-- ATTENDANCE
-- ============================================================
INSERT INTO attendance_records (student_id, date, status)
VALUES
  ('20000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, 'present'),
  ('20000000-0000-0000-0000-000000000001', CURRENT_DATE - 2, 'present'),
  ('20000000-0000-0000-0000-000000000001', CURRENT_DATE - 3, 'tardy'),
  ('20000000-0000-0000-0000-000000000001', CURRENT_DATE - 4, 'present'),
  ('20000000-0000-0000-0000-000000000001', CURRENT_DATE - 5, 'present'),
  ('20000000-0000-0000-0000-000000000002', CURRENT_DATE - 1, 'present'),
  ('20000000-0000-0000-0000-000000000002', CURRENT_DATE - 2, 'absent'),
  ('20000000-0000-0000-0000-000000000002', CURRENT_DATE - 3, 'present')
ON CONFLICT (student_id, date, class_id) DO NOTHING;
