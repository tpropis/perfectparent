#!/usr/bin/env npx tsx
/**
 * Seed script for SchoolOS MVP — Westlake Academy demo data
 *
 * Usage:
 *   npm run seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * What it does:
 *   1. Creates the demo school
 *   2. Creates auth users with fixed UUIDs (service role bypasses email confirmation)
 *   3. Updates profiles with school_id, phone, and correct role (the trigger sets basics)
 *   4. Inserts students, teams, classes, memberships, announcements, messages, events, attendance
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ──────────────────────────────────────────────
// Fixed seed IDs (must match seed.sql / schema)
// ──────────────────────────────────────────────
const SCHOOL_ID = '00000000-0000-0000-0000-000000000001'

const USERS: Array<{
  id: string
  email: string
  password: string
  full_name: string
  role: string
  phone?: string
}> = [
  { id: '10000000-0000-0000-0000-000000000001', email: 'admin@westlake.edu',         password: 'demo1234', full_name: 'Sarah Mitchell',   role: 'admin' },
  { id: '10000000-0000-0000-0000-000000000002', email: 'mrjohnson@westlake.edu',     password: 'demo1234', full_name: 'David Johnson',    role: 'teacher' },
  { id: '10000000-0000-0000-0000-000000000003', email: 'mswilliams@westlake.edu',    password: 'demo1234', full_name: 'Amanda Williams',  role: 'teacher' },
  { id: '10000000-0000-0000-0000-000000000004', email: 'coachthompson@westlake.edu', password: 'demo1234', full_name: 'Marcus Thompson',  role: 'coach' },
  { id: '10000000-0000-0000-0000-000000000005', email: 'jennifer.hayes@gmail.com',   password: 'demo1234', full_name: 'Jennifer Hayes',   role: 'parent',  phone: '(512) 555-0201' },
  { id: '10000000-0000-0000-0000-000000000006', email: 'robert.chen@gmail.com',      password: 'demo1234', full_name: 'Robert Chen',      role: 'parent',  phone: '(512) 555-0202' },
  { id: '10000000-0000-0000-0000-000000000007', email: 'emma.hayes@westlake.edu',    password: 'demo1234', full_name: 'Emma Hayes',       role: 'student' },
  { id: '10000000-0000-0000-0000-000000000008', email: 'liam.chen@westlake.edu',     password: 'demo1234', full_name: 'Liam Chen',        role: 'student' },
]

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function log(msg: string) { console.log(`  ${msg}`) }
function ok(msg: string)  { console.log(`  ✅  ${msg}`) }
function warn(msg: string){ console.log(`  ⚠️   ${msg}`) }
function err(msg: string) { console.error(`  ❌  ${msg}`) }

async function run() {
  console.log('\n🌱  SchoolOS seed starting…\n')

  // ── 1. School ──────────────────────────────
  console.log('1/8  School')
  const { error: schoolErr } = await supabase.from('schools').upsert({
    id: SCHOOL_ID,
    name: 'Westlake Academy',
    address: '1200 Lakeview Blvd, Austin, TX 78701',
    phone: '(512) 555-0100',
    website: 'https://westlakeacademy.edu',
  }, { onConflict: 'id' })
  if (schoolErr) { err(`schools: ${schoolErr.message}`); process.exit(1) }
  ok('Westlake Academy upserted')

  // ── 2. Auth users ──────────────────────────
  console.log('\n2/8  Auth users')
  for (const u of USERS) {
    // Try to create; if already exists (422) that's fine
    const { error } = await supabase.auth.admin.createUser({
      user_metadata: { full_name: u.full_name, role: u.role },
      email: u.email,
      password: u.password,
      email_confirm: true,
    })
    if (error) {
      if (error.message.toLowerCase().includes('already been registered') ||
          error.message.toLowerCase().includes('already exists') ||
          error.code === '23505') {
        warn(`${u.email} — already exists, skipping`)
      } else {
        err(`${u.email}: ${error.message}`)
        process.exit(1)
      }
    } else {
      // The auth.admin.createUser doesn't let us specify the UUID directly via the
      // standard API call above. We need to look up the user that was just created
      // and update the UUID, or use the admin.updateUser. Unfortunately Supabase
      // doesn't allow changing a user's UUID post-creation. Instead, we upsert the
      // profile with the correct ID below.
      ok(`${u.email} created`)
    }
  }

  // ── 3. Resolve actual auth UUIDs ──────────────
  console.log('\n3/8  Resolve auth UUIDs → map to fixed profile IDs')
  // Fetch all auth users and build email→id map
  const { data: { users: authUsers }, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) { err(`listUsers: ${listErr.message}`); process.exit(1) }

  const emailToAuthId: Record<string, string> = {}
  for (const au of authUsers) {
    if (au.email) emailToAuthId[au.email] = au.id
  }

  // ── 4. Upsert profiles with correct data ──
  console.log('\n4/8  Profiles')
  for (const u of USERS) {
    const authId = emailToAuthId[u.email]
    if (!authId) { warn(`No auth user found for ${u.email}, skipping profile`); continue }

    const { error: profErr } = await supabase.from('profiles').upsert({
      id: authId,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      school_id: SCHOOL_ID,
      phone: u.phone ?? null,
    }, { onConflict: 'id' })
    if (profErr) { err(`profile ${u.email}: ${profErr.message}`) }
    else { ok(`${u.full_name} (${u.role})`) }
  }

  // Build email→profileId for downstream inserts
  const emailToProfileId: Record<string, string> = {}
  for (const au of authUsers) {
    if (au.email) emailToProfileId[au.email] = au.id
  }
  const p = (email: string) => emailToProfileId[email] ?? ''

  // ── 5. Students ────────────────────────────
  console.log('\n5/8  Students')
  const studentRows = [
    {
      id: '20000000-0000-0000-0000-000000000001',
      user_id: p('emma.hayes@westlake.edu'),
      school_id: SCHOOL_ID,
      first_name: 'Emma', last_name: 'Hayes',
      grade: '10th', student_id_number: 'WLA-2024-001',
      emergency_contact_name: 'Jennifer Hayes', emergency_contact_phone: '(512) 555-0201',
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      user_id: p('liam.chen@westlake.edu'),
      school_id: SCHOOL_ID,
      first_name: 'Liam', last_name: 'Chen',
      grade: '9th', student_id_number: 'WLA-2024-002',
      emergency_contact_name: 'Robert Chen', emergency_contact_phone: '(512) 555-0202',
    },
  ]
  const { error: studErr } = await supabase.from('students').upsert(studentRows, { onConflict: 'id' })
  if (studErr) { err(`students: ${studErr.message}`) }
  else { ok('Emma Hayes + Liam Chen') }

  // ── Parent-student links ───────────────────
  const psRows = [
    { parent_id: p('jennifer.hayes@gmail.com'), student_id: '20000000-0000-0000-0000-000000000001', relationship: 'mother' },
    { parent_id: p('robert.chen@gmail.com'),    student_id: '20000000-0000-0000-0000-000000000002', relationship: 'father' },
  ]
  const { error: psErr } = await supabase.from('parent_students').upsert(psRows, { onConflict: 'parent_id,student_id' })
  if (psErr) { err(`parent_students: ${psErr.message}`) }
  else { ok('Parent-student links') }

  // ── Teams ──────────────────────────────────
  console.log('\n6/8  Teams + Classes')
  const teamRows = [
    {
      id: '30000000-0000-0000-0000-000000000001',
      school_id: SCHOOL_ID,
      name: 'Westlake Varsity Soccer', sport: 'Soccer', season: 'Fall 2024',
      coach_id: p('coachthompson@westlake.edu'),
      description: 'Competitive varsity soccer team competing in District 14-6A',
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      school_id: SCHOOL_ID,
      name: 'Westlake JV Basketball', sport: 'Basketball', season: 'Winter 2024',
      coach_id: p('coachthompson@westlake.edu'),
      description: 'Junior varsity basketball team',
    },
  ]
  const { error: teamsErr } = await supabase.from('teams').upsert(teamRows, { onConflict: 'id' })
  if (teamsErr) { err(`teams: ${teamsErr.message}`) }
  else { ok('Varsity Soccer + JV Basketball') }

  // ── Team memberships ───────────────────────
  const tmRows = [
    { team_id: '30000000-0000-0000-0000-000000000001', student_id: '20000000-0000-0000-0000-000000000001', jersey_number: '7',  position: 'Midfielder' },
    { team_id: '30000000-0000-0000-0000-000000000002', student_id: '20000000-0000-0000-0000-000000000002', jersey_number: '14', position: 'Guard' },
  ]
  const { error: tmErr } = await supabase.from('team_memberships').upsert(tmRows, { onConflict: 'team_id,student_id' })
  if (tmErr) { err(`team_memberships: ${tmErr.message}`) }
  else { ok('Team memberships') }

  // ── Classes ────────────────────────────────
  const classRows = [
    { id: '40000000-0000-0000-0000-000000000001', school_id: SCHOOL_ID, teacher_id: p('mrjohnson@westlake.edu'),  name: 'AP Biology',        subject: 'Science', grade_level: '10th', period: '2nd', room: 'Room 204' },
    { id: '40000000-0000-0000-0000-000000000002', school_id: SCHOOL_ID, teacher_id: p('mrjohnson@westlake.edu'),  name: 'World History',     subject: 'History', grade_level: '9th',  period: '3rd', room: 'Room 118' },
    { id: '40000000-0000-0000-0000-000000000003', school_id: SCHOOL_ID, teacher_id: p('mswilliams@westlake.edu'), name: 'English Literature',subject: 'English', grade_level: '10th', period: '4th', room: 'Room 211' },
    { id: '40000000-0000-0000-0000-000000000004', school_id: SCHOOL_ID, teacher_id: p('mswilliams@westlake.edu'), name: 'Creative Writing',  subject: 'English', grade_level: '9th',  period: '1st', room: 'Room 211' },
  ]
  const { error: classErr } = await supabase.from('classes').upsert(classRows, { onConflict: 'id' })
  if (classErr) { err(`classes: ${classErr.message}`) }
  else { ok('AP Biology, World History, English Lit, Creative Writing') }

  // ── Student enrollments ────────────────────
  const scRows = [
    { student_id: '20000000-0000-0000-0000-000000000001', class_id: '40000000-0000-0000-0000-000000000001' },
    { student_id: '20000000-0000-0000-0000-000000000001', class_id: '40000000-0000-0000-0000-000000000003' },
    { student_id: '20000000-0000-0000-0000-000000000002', class_id: '40000000-0000-0000-0000-000000000002' },
    { student_id: '20000000-0000-0000-0000-000000000002', class_id: '40000000-0000-0000-0000-000000000004' },
  ]
  const { error: scErr } = await supabase.from('student_classes').upsert(scRows, { onConflict: 'student_id,class_id' })
  if (scErr) { err(`student_classes: ${scErr.message}`) }
  else { ok('Student enrollments') }

  // ── 7. Announcements ──────────────────────
  console.log('\n7/8  Announcements + Messages + Events')
  const now = new Date()
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString()
  const hoursAgo = (n: number) => new Date(now.getTime() - n * 3600000).toISOString()
  const daysAhead = (n: number) => new Date(now.getTime() + n * 86400000)
  const dateAtTime = (daysOffset: number, hours: number, minutes = 0) => {
    const d = daysAhead(daysOffset)
    d.setHours(hours, minutes, 0, 0)
    return d.toISOString()
  }

  const announcementRows = [
    {
      author_id: p('admin@westlake.edu'), school_id: SCHOOL_ID, team_id: null,
      title: 'Welcome Back — Spring Semester 2024',
      body: 'We are excited to welcome everyone back for the spring semester! Please review the updated school calendar and ensure all required forms are submitted by January 19th. The front office is open 7:30am–4:30pm Monday through Friday.',
      category: 'school', is_pinned: true, published_at: daysAgo(2),
    },
    {
      author_id: p('admin@westlake.edu'), school_id: SCHOOL_ID, team_id: null,
      title: 'URGENT: Early Dismissal This Friday',
      body: 'Due to district-wide staff development, all students will be dismissed at 12:30pm this Friday. Please ensure your student has arranged transportation accordingly.',
      category: 'urgent', is_pinned: true, published_at: daysAgo(1),
    },
    {
      author_id: p('coachthompson@westlake.edu'), school_id: SCHOOL_ID,
      team_id: '30000000-0000-0000-0000-000000000001',
      title: 'Soccer: District Playoffs This Weekend',
      body: 'Great news — we have advanced to the district playoffs! Games are Saturday at 10am and 2pm at Burger Stadium. Team gear is required. Parents, please arrive by 9:30am for warm-ups. GO CHAPARRALS!',
      category: 'team', is_pinned: false, published_at: hoursAgo(3),
    },
    {
      author_id: p('mrjohnson@westlake.edu'), school_id: SCHOOL_ID, team_id: null,
      title: 'AP Biology: Lab Reports Due Monday',
      body: 'Reminder that your Cell Division lab reports are due this Monday by 11:59pm via the portal. Late submissions will be deducted 10 points per day. Office hours are available Thursday 3–4pm.',
      category: 'class', is_pinned: false, published_at: hoursAgo(6),
    },
  ]
  // Insert announcements (can't upsert without known IDs — delete+insert or use conflict on unique key)
  // Use delete-then-insert for simplicity on repeated seeds
  await supabase.from('announcements').delete().eq('school_id', SCHOOL_ID)
  const { error: annErr } = await supabase.from('announcements').insert(announcementRows)
  if (annErr) { err(`announcements: ${annErr.message}`) }
  else { ok('4 announcements') }

  // ── Messages ───────────────────────────────
  const msg1Id = '50000000-0000-0000-0000-000000000001'
  const msg2Id = '50000000-0000-0000-0000-000000000002'
  await supabase.from('message_recipients').delete().in('message_id', [msg1Id, msg2Id])
  await supabase.from('messages').delete().in('id', [msg1Id, msg2Id])

  const { error: msgErr } = await supabase.from('messages').insert([
    {
      id: msg1Id,
      sender_id: p('mrjohnson@westlake.edu'), school_id: SCHOOL_ID,
      subject: 'Emma is doing great in AP Bio!',
      body: 'Hi Jennifer, I wanted to reach out and let you know that Emma has been absolutely fantastic this semester. Her recent lab work showed real critical thinking, and she is on track for an A. Looking forward to seeing her continue to grow. — Mr. Johnson',
      category: 'class', created_at: daysAgo(1),
    },
    {
      id: msg2Id,
      sender_id: p('coachthompson@westlake.edu'), school_id: SCHOOL_ID,
      subject: 'Playoff Schedule — Important Info',
      body: 'Hi Jennifer, just a reminder that Emma needs to be at the field by 9am Saturday for the playoff warmup. Please make sure she has her full kit including shin guards. Let me know if you have any questions. — Coach Thompson',
      category: 'team', created_at: hoursAgo(5),
    },
  ])
  if (msgErr) { err(`messages: ${msgErr.message}`) }
  else { ok('2 messages') }

  const { error: mrErr } = await supabase.from('message_recipients').insert([
    { message_id: msg1Id, recipient_id: p('jennifer.hayes@gmail.com') },
    { message_id: msg2Id, recipient_id: p('jennifer.hayes@gmail.com') },
  ])
  if (mrErr) { err(`message_recipients: ${mrErr.message}`) }
  else { ok('Message recipients') }

  // ── Events ─────────────────────────────────
  await supabase.from('events').delete().eq('school_id', SCHOOL_ID)
  const { error: evtErr } = await supabase.from('events').insert([
    {
      school_id: SCHOOL_ID, team_id: null, created_by: p('admin@westlake.edu'),
      title: 'Spring Semester Parent Night',
      description: 'Join us for our semester kick-off parent information night. Learn about curriculum updates, upcoming events, and meet the teachers.',
      event_type: 'school',
      start_time: dateAtTime(5, 18), end_time: dateAtTime(5, 20),
      location: 'Westlake Academy Main Auditorium',
    },
    {
      school_id: SCHOOL_ID, team_id: '30000000-0000-0000-0000-000000000001',
      created_by: p('coachthompson@westlake.edu'),
      title: 'Soccer District Playoff — Game 1',
      description: 'District 14-6A Playoff Round 1. Come out and support the Chaparrals!',
      event_type: 'athletics',
      start_time: dateAtTime(3, 10), end_time: dateAtTime(3, 12),
      location: 'Burger Stadium, Austin',
    },
    {
      school_id: SCHOOL_ID, team_id: '30000000-0000-0000-0000-000000000001',
      created_by: p('coachthompson@westlake.edu'),
      title: 'Soccer District Playoff — Game 2 (if needed)',
      description: 'District 14-6A Playoff Round 1, second game.',
      event_type: 'athletics',
      start_time: dateAtTime(3, 14), end_time: dateAtTime(3, 16),
      location: 'Burger Stadium, Austin',
    },
    {
      school_id: SCHOOL_ID, team_id: null, created_by: p('admin@westlake.edu'),
      title: 'Spring Break Begins',
      description: 'No school. Spring break.',
      event_type: 'school',
      start_time: dateAtTime(12, 0), end_time: null,
      location: 'N/A',
    },
    {
      school_id: SCHOOL_ID, team_id: '30000000-0000-0000-0000-000000000002',
      created_by: p('coachthompson@westlake.edu'),
      title: 'JV Basketball Practice',
      description: 'Regular practice session. Mandatory attendance.',
      event_type: 'athletics',
      start_time: dateAtTime(1, 15, 30), end_time: dateAtTime(1, 17),
      location: 'Main Gymnasium',
    },
    {
      school_id: SCHOOL_ID, team_id: null, created_by: p('mrjohnson@westlake.edu'),
      title: 'AP Exam Registration Deadline',
      description: 'Last day to register for AP exams. See Mr. Johnson or the front office.',
      event_type: 'academic',
      start_time: dateAtTime(7, 23, 59), end_time: null,
      location: 'Front Office',
    },
  ])
  if (evtErr) { err(`events: ${evtErr.message}`) }
  else { ok('6 events') }

  // ── Attendance ─────────────────────────────
  console.log('\n8/8  Attendance')
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const pastDate = (n: number) => {
    const d = new Date(today.getTime() - n * 86400000)
    return d.toISOString().split('T')[0]
  }

  await supabase.from('attendance_records').delete()
    .eq('student_id', '20000000-0000-0000-0000-000000000001')
  await supabase.from('attendance_records').delete()
    .eq('student_id', '20000000-0000-0000-0000-000000000002')

  const { error: attErr } = await supabase.from('attendance_records').insert([
    { student_id: '20000000-0000-0000-0000-000000000001', date: pastDate(1), status: 'present' },
    { student_id: '20000000-0000-0000-0000-000000000001', date: pastDate(2), status: 'present' },
    { student_id: '20000000-0000-0000-0000-000000000001', date: pastDate(3), status: 'tardy' },
    { student_id: '20000000-0000-0000-0000-000000000001', date: pastDate(4), status: 'present' },
    { student_id: '20000000-0000-0000-0000-000000000001', date: pastDate(5), status: 'present' },
    { student_id: '20000000-0000-0000-0000-000000000002', date: pastDate(1), status: 'present' },
    { student_id: '20000000-0000-0000-0000-000000000002', date: pastDate(2), status: 'absent' },
    { student_id: '20000000-0000-0000-0000-000000000002', date: pastDate(3), status: 'present' },
  ])
  if (attErr) { err(`attendance: ${attErr.message}`) }
  else { ok('Attendance records for Emma + Liam') }

  console.log('\n🎉  Seed complete!\n')
  console.log('Demo logins (password: demo1234):')
  console.log('  Parent  → jennifer.hayes@gmail.com')
  console.log('  Admin   → admin@westlake.edu')
  console.log('  Teacher → mrjohnson@westlake.edu')
  console.log('  Coach   → coachthompson@westlake.edu')
  console.log()
}

run().catch((e) => {
  console.error('\n💥  Unexpected error:', e)
  process.exit(1)
})
