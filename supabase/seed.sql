-- SchoolOS Demo Seed Data — Westlake Academy
-- Run AFTER schema.sql
--
-- ⚠️  PREREQUISITE: Auth users must exist before running this file.
--
-- RECOMMENDED: run `npm run seed` — it creates auth users + all data automatically.
--
-- MANUAL ALTERNATIVE (Supabase Auth dashboard):
--   1. Go to Authentication → Users → Add User (enable "Auto Confirm User")
--   2. Create all 8 users with email/password demo1234
--   3. Then run this file in the SQL editor

DO $$
DECLARE
  v_school_id  UUID := '00000000-0000-0000-0000-000000000001';

  -- profile IDs resolved from auth users created via the Auth dashboard / npm run seed
  v_admin      UUID;
  v_johnson    UUID;
  v_williams   UUID;
  v_thompson   UUID;
  v_jennifer   UUID;
  v_robert     UUID;
  v_emma       UUID;
  v_liam       UUID;

  -- student IDs (fixed)
  v_s_emma     UUID := '20000000-0000-0000-0000-000000000001';
  v_s_liam     UUID := '20000000-0000-0000-0000-000000000002';

  -- team IDs (fixed)
  v_t_soccer   UUID := '30000000-0000-0000-0000-000000000001';
  v_t_bball    UUID := '30000000-0000-0000-0000-000000000002';

  -- class IDs (fixed)
  v_c_bio      UUID := '40000000-0000-0000-0000-000000000001';
  v_c_history  UUID := '40000000-0000-0000-0000-000000000002';
  v_c_english  UUID := '40000000-0000-0000-0000-000000000003';
  v_c_writing  UUID := '40000000-0000-0000-0000-000000000004';

  -- message IDs (fixed)
  v_m1         UUID := '50000000-0000-0000-0000-000000000001';
  v_m2         UUID := '50000000-0000-0000-0000-000000000002';

BEGIN

  -- ──────────────────────────────────────────────────────────────
  -- SCHOOL
  -- ──────────────────────────────────────────────────────────────
  INSERT INTO schools (id, name, address, phone, website)
  VALUES (
    v_school_id,
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

  -- ──────────────────────────────────────────────────────────────
  -- RESOLVE PROFILE IDs
  -- The handle_new_user trigger creates profile rows automatically
  -- when auth users sign up. We resolve their IDs here.
  -- ──────────────────────────────────────────────────────────────
  SELECT id INTO v_admin     FROM profiles WHERE email = 'admin@westlake.edu';
  SELECT id INTO v_johnson   FROM profiles WHERE email = 'mrjohnson@westlake.edu';
  SELECT id INTO v_williams  FROM profiles WHERE email = 'mswilliams@westlake.edu';
  SELECT id INTO v_thompson  FROM profiles WHERE email = 'coachthompson@westlake.edu';
  SELECT id INTO v_jennifer  FROM profiles WHERE email = 'jennifer.hayes@gmail.com';
  SELECT id INTO v_robert    FROM profiles WHERE email = 'robert.chen@gmail.com';
  SELECT id INTO v_emma      FROM profiles WHERE email = 'emma.hayes@westlake.edu';
  SELECT id INTO v_liam      FROM profiles WHERE email = 'liam.chen@westlake.edu';

  -- Guard: fail early with a clear message if auth users have not been created yet
  IF v_admin IS NULL OR v_johnson IS NULL OR v_williams IS NULL OR v_thompson IS NULL
     OR v_jennifer IS NULL OR v_robert IS NULL OR v_emma IS NULL OR v_liam IS NULL
  THEN
    RAISE EXCEPTION
      E'\n\n'
      '  Auth users not found in the profiles table.\n'
      '\n'
      '  Run `npm run seed` (recommended) — it creates auth users and all\n'
      '  seed data automatically using the SUPABASE_SERVICE_ROLE_KEY.\n'
      '\n'
      '  Or create the 8 users manually in Authentication → Users, then\n'
      '  re-run this SQL file.\n'
      '\n'
      '  Required emails (password: demo1234):\n'
      '    admin@westlake.edu\n'
      '    mrjohnson@westlake.edu\n'
      '    mswilliams@westlake.edu\n'
      '    coachthompson@westlake.edu\n'
      '    jennifer.hayes@gmail.com\n'
      '    robert.chen@gmail.com\n'
      '    emma.hayes@westlake.edu\n'
      '    liam.chen@westlake.edu\n';
  END IF;

  -- ──────────────────────────────────────────────────────────────
  -- UPDATE PROFILES (fill in school_id, role, phone)
  -- The trigger already set email + full_name from user metadata.
  -- ──────────────────────────────────────────────────────────────
  UPDATE profiles SET school_id = v_school_id, role = 'admin'
    WHERE id = v_admin;
  UPDATE profiles SET school_id = v_school_id, role = 'teacher'
    WHERE id = v_johnson;
  UPDATE profiles SET school_id = v_school_id, role = 'teacher'
    WHERE id = v_williams;
  UPDATE profiles SET school_id = v_school_id, role = 'coach'
    WHERE id = v_thompson;
  UPDATE profiles SET school_id = v_school_id, role = 'parent', phone = '(512) 555-0201'
    WHERE id = v_jennifer;
  UPDATE profiles SET school_id = v_school_id, role = 'parent', phone = '(512) 555-0202'
    WHERE id = v_robert;
  UPDATE profiles SET school_id = v_school_id, role = 'student'
    WHERE id = v_emma;
  UPDATE profiles SET school_id = v_school_id, role = 'student'
    WHERE id = v_liam;

  -- ──────────────────────────────────────────────────────────────
  -- STUDENTS
  -- ──────────────────────────────────────────────────────────────
  INSERT INTO students (id, user_id, school_id, first_name, last_name, grade,
                        student_id_number, emergency_contact_name, emergency_contact_phone)
  VALUES
    (v_s_emma, v_emma, v_school_id, 'Emma', 'Hayes', '10th',
     'WLA-2024-001', 'Jennifer Hayes', '(512) 555-0201'),
    (v_s_liam, v_liam, v_school_id, 'Liam', 'Chen',  '9th',
     'WLA-2024-002', 'Robert Chen',   '(512) 555-0202')
  ON CONFLICT (id) DO UPDATE SET
    user_id    = EXCLUDED.user_id,
    first_name = EXCLUDED.first_name,
    last_name  = EXCLUDED.last_name,
    grade      = EXCLUDED.grade;

  -- ──────────────────────────────────────────────────────────────
  -- PARENT-STUDENT LINKS
  -- ──────────────────────────────────────────────────────────────
  INSERT INTO parent_students (parent_id, student_id, relationship)
  VALUES
    (v_jennifer, v_s_emma, 'mother'),
    (v_robert,   v_s_liam, 'father')
  ON CONFLICT (parent_id, student_id) DO NOTHING;

  -- ──────────────────────────────────────────────────────────────
  -- TEAMS
  -- ──────────────────────────────────────────────────────────────
  INSERT INTO teams (id, school_id, name, sport, season, coach_id, description)
  VALUES
    (v_t_soccer, v_school_id, 'Westlake Varsity Soccer', 'Soccer',     'Fall 2024',
     v_thompson, 'Competitive varsity soccer team competing in District 14-6A'),
    (v_t_bball,  v_school_id, 'Westlake JV Basketball',  'Basketball', 'Winter 2024',
     v_thompson, 'Junior varsity basketball team')
  ON CONFLICT (id) DO UPDATE SET
    coach_id    = EXCLUDED.coach_id,
    description = EXCLUDED.description;

  -- ──────────────────────────────────────────────────────────────
  -- TEAM MEMBERSHIPS
  -- ──────────────────────────────────────────────────────────────
  INSERT INTO team_memberships (team_id, student_id, jersey_number, position)
  VALUES
    (v_t_soccer, v_s_emma, '7',  'Midfielder'),
    (v_t_bball,  v_s_liam, '14', 'Guard')
  ON CONFLICT (team_id, student_id) DO NOTHING;

  -- ──────────────────────────────────────────────────────────────
  -- CLASSES
  -- ──────────────────────────────────────────────────────────────
  INSERT INTO classes (id, school_id, teacher_id, name, subject, grade_level, period, room)
  VALUES
    (v_c_bio,     v_school_id, v_johnson,  'AP Biology',        'Science', '10th', '2nd', 'Room 204'),
    (v_c_history, v_school_id, v_johnson,  'World History',     'History', '9th',  '3rd', 'Room 118'),
    (v_c_english, v_school_id, v_williams, 'English Literature','English', '10th', '4th', 'Room 211'),
    (v_c_writing, v_school_id, v_williams, 'Creative Writing',  'English', '9th',  '1st', 'Room 211')
  ON CONFLICT (id) DO UPDATE SET
    teacher_id = EXCLUDED.teacher_id,
    name       = EXCLUDED.name;

  -- ──────────────────────────────────────────────────────────────
  -- STUDENT ENROLLMENTS
  -- ──────────────────────────────────────────────────────────────
  INSERT INTO student_classes (student_id, class_id)
  VALUES
    (v_s_emma, v_c_bio),
    (v_s_emma, v_c_english),
    (v_s_liam, v_c_history),
    (v_s_liam, v_c_writing)
  ON CONFLICT (student_id, class_id) DO NOTHING;

  -- ──────────────────────────────────────────────────────────────
  -- ANNOUNCEMENTS
  -- ──────────────────────────────────────────────────────────────
  INSERT INTO announcements (author_id, school_id, team_id, title, body, category, is_pinned, published_at)
  VALUES
    (v_admin, v_school_id, NULL,
     'Welcome Back — Spring Semester 2024',
     'We are excited to welcome everyone back for the spring semester! Please review the updated school calendar and ensure all required forms are submitted by January 19th. The front office is open 7:30am–4:30pm Monday through Friday.',
     'school', TRUE, NOW() - INTERVAL '2 days'),

    (v_admin, v_school_id, NULL,
     'URGENT: Early Dismissal This Friday',
     'Due to district-wide staff development, all students will be dismissed at 12:30pm this Friday. Please ensure your student has arranged transportation accordingly.',
     'urgent', TRUE, NOW() - INTERVAL '1 day'),

    (v_thompson, v_school_id, v_t_soccer,
     'Soccer: District Playoffs This Weekend',
     'Great news — we have advanced to the district playoffs! Games are Saturday at 10am and 2pm at Burger Stadium. Team gear is required. Parents, please arrive by 9:30am for warm-ups. GO CHAPARRALS!',
     'team', FALSE, NOW() - INTERVAL '3 hours'),

    (v_johnson, v_school_id, NULL,
     'AP Biology: Lab Reports Due Monday',
     'Reminder that your Cell Division lab reports are due this Monday by 11:59pm via the portal. Late submissions will be deducted 10 points per day. Office hours are available Thursday 3–4pm.',
     'class', FALSE, NOW() - INTERVAL '6 hours');

  -- ──────────────────────────────────────────────────────────────
  -- MESSAGES
  -- ──────────────────────────────────────────────────────────────
  INSERT INTO messages (id, sender_id, school_id, subject, body, category, created_at)
  VALUES
    (v_m1, v_johnson, v_school_id,
     'Emma is doing great in AP Bio!',
     'Hi Jennifer, I wanted to reach out and let you know that Emma has been absolutely fantastic this semester. Her recent lab work showed real critical thinking, and she is on track for an A. Looking forward to seeing her continue to grow. — Mr. Johnson',
     'class', NOW() - INTERVAL '1 day'),

    (v_m2, v_thompson, v_school_id,
     'Playoff Schedule — Important Info',
     'Hi Jennifer, just a reminder that Emma needs to be at the field by 9am Saturday for the playoff warmup. Please make sure she has her full kit including shin guards. Let me know if you have any questions. — Coach Thompson',
     'team', NOW() - INTERVAL '5 hours')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO message_recipients (message_id, recipient_id)
  VALUES
    (v_m1, v_jennifer),
    (v_m2, v_jennifer)
  ON CONFLICT (message_id, recipient_id) DO NOTHING;

  -- ──────────────────────────────────────────────────────────────
  -- EVENTS
  -- ──────────────────────────────────────────────────────────────
  INSERT INTO events (school_id, team_id, created_by, title, description, event_type, start_time, end_time, location)
  VALUES
    (v_school_id, NULL, v_admin,
     'Spring Semester Parent Night',
     'Join us for our semester kick-off parent information night. Learn about curriculum updates, upcoming events, and meet the teachers.',
     'school',
     (NOW() + INTERVAL '5 days')::date + TIME '18:00',
     (NOW() + INTERVAL '5 days')::date + TIME '20:00',
     'Westlake Academy Main Auditorium'),

    (v_school_id, v_t_soccer, v_thompson,
     'Soccer District Playoff — Game 1',
     'District 14-6A Playoff Round 1. Come out and support the Chaparrals!',
     'athletics',
     (NOW() + INTERVAL '3 days')::date + TIME '10:00',
     (NOW() + INTERVAL '3 days')::date + TIME '12:00',
     'Burger Stadium, Austin'),

    (v_school_id, v_t_soccer, v_thompson,
     'Soccer District Playoff — Game 2 (if needed)',
     'District 14-6A Playoff Round 1, second game.',
     'athletics',
     (NOW() + INTERVAL '3 days')::date + TIME '14:00',
     (NOW() + INTERVAL '3 days')::date + TIME '16:00',
     'Burger Stadium, Austin'),

    (v_school_id, NULL, v_admin,
     'Spring Break Begins',
     'No school. Spring break.',
     'school',
     (NOW() + INTERVAL '12 days')::date + TIME '00:00',
     NULL, 'N/A'),

    (v_school_id, v_t_bball, v_thompson,
     'JV Basketball Practice',
     'Regular practice session. Mandatory attendance.',
     'athletics',
     (NOW() + INTERVAL '1 day')::date + TIME '15:30',
     (NOW() + INTERVAL '1 day')::date + TIME '17:00',
     'Main Gymnasium'),

    (v_school_id, NULL, v_johnson,
     'AP Exam Registration Deadline',
     'Last day to register for AP exams. See Mr. Johnson or the front office.',
     'academic',
     (NOW() + INTERVAL '7 days')::date + TIME '23:59',
     NULL, 'Front Office');

  -- ──────────────────────────────────────────────────────────────
  -- ATTENDANCE
  -- ──────────────────────────────────────────────────────────────
  INSERT INTO attendance_records (student_id, date, status)
  VALUES
    (v_s_emma, CURRENT_DATE - 1, 'present'),
    (v_s_emma, CURRENT_DATE - 2, 'present'),
    (v_s_emma, CURRENT_DATE - 3, 'tardy'),
    (v_s_emma, CURRENT_DATE - 4, 'present'),
    (v_s_emma, CURRENT_DATE - 5, 'present'),
    (v_s_liam, CURRENT_DATE - 1, 'present'),
    (v_s_liam, CURRENT_DATE - 2, 'absent'),
    (v_s_liam, CURRENT_DATE - 3, 'present')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed complete! Log in with any demo account (password: demo1234).';

END $$;
