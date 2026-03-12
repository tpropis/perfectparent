# SchoolOS MVP

A unified parent-school communication platform for Westlake Academy. One login. Every role. All the info that matters.

## Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Auth + Database**: Supabase (PostgreSQL + RLS)
- **Icons**: Lucide React

## Quick Start

### 1. Clone & Install

```bash
git clone <repo>
cd perfectparent
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql` (full schema + RLS policies)
3. Then run `supabase/seed.sql` (demo data for Westlake Academy)
4. Create these demo auth users in the Supabase dashboard under **Authentication → Users**:

| Email | Password | Role |
|-------|----------|------|
| admin@westlake.edu | demo1234 | admin |
| mrjohnson@westlake.edu | demo1234 | teacher |
| mswilliams@westlake.edu | demo1234 | teacher |
| coachthompson@westlake.edu | demo1234 | coach |
| jennifer.hayes@gmail.com | demo1234 | parent |
| robert.chen@gmail.com | demo1234 | parent |
| emma.hayes@westlake.edu | demo1234 | student |
| liam.chen@westlake.edu | demo1234 | student |

> **Note**: The `seed.sql` uses fixed UUIDs. When creating users via the Supabase dashboard, copy those UUIDs into the `id` field, or update `seed.sql` to use the generated UUIDs.

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to login.

---

## Demo Flow

**Login as Jennifer Hayes (Parent)** — `jennifer.hayes@gmail.com` / `demo1234`

The parent dashboard shows:
- Emma Hayes' student card (10th grade, AP Bio, Soccer)
- Upcoming district playoff events
- Coach Thompson's playoff announcement
- School-wide urgent notice (early dismissal Friday)
- Mr. Johnson's message praising Emma in AP Bio
- Spring Parent Night upcoming event

**Login as Admin (Sarah Mitchell)** — `admin@westlake.edu` / `demo1234`

Admin dashboard + full access to:
- `/admin` — overview with counts
- `/admin/users` — all users by role
- `/admin/students` — student directory
- `/admin/teams` — athletics teams

---

## App Routes

| Route | Description | Roles |
|-------|-------------|-------|
| `/dashboard` | Role-aware home | All |
| `/announcements` | Announcement feed | All |
| `/announcements/new` | Post announcement | Admin, Teacher, Coach |
| `/messages` | Inbox + sent | All |
| `/messages/new` | Send message | Admin, Teacher, Coach |
| `/calendar` | Events & schedule | All |
| `/calendar/new` | Add event | Admin, Teacher, Coach |
| `/athletics` | Teams, rosters, schedule | All |
| `/students` | Student directory | Admin, Teacher, Coach |
| `/students/[id]` | Student profile | All (parents: own children only) |
| `/admin` | Admin overview | Admin |
| `/admin/users` | User management | Admin |
| `/admin/students` | Student management | Admin, Teacher |
| `/admin/teams` | Team management | Admin, Coach |

---

## Role Permissions Summary

| Feature | Parent | Student | Teacher | Coach | Admin |
|---------|:------:|:-------:|:-------:|:-----:|:-----:|
| View dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| View announcements | ✓ | ✓ | ✓ | ✓ | ✓ |
| Post announcements | — | — | ✓ | ✓ | ✓ |
| Inbox (receive) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Send messages | — | — | ✓ | ✓ | ✓ |
| View calendar | ✓ | ✓ | ✓ | ✓ | ✓ |
| Add events | — | — | ✓ | ✓ | ✓ |
| View athletics | ✓ | ✓ | ✓ | ✓ | ✓ |
| View student directory | — | — | ✓ | ✓ | ✓ |
| View own child | ✓ | — | — | — | — |
| Admin panel | — | — | — | — | ✓ |

---

## Project Structure

```
src/
├── app/
│   ├── (app)/                  # Authenticated app shell
│   │   ├── dashboard/
│   │   ├── announcements/
│   │   ├── messages/
│   │   ├── calendar/
│   │   ├── athletics/
│   │   ├── students/
│   │   └── admin/
│   ├── auth/callback/          # Supabase OAuth callback
│   ├── login/                  # Login page
│   ├── layout.tsx
│   └── page.tsx                # Root → /dashboard redirect
├── components/
│   ├── ui/                     # Badge, Card, PageHeader, EmptyState
│   ├── layout/                 # AppShell, Sidebar, TopBar, MobileNav
│   ├── dashboard/              # ParentDashboard, StaffDashboard
│   ├── announcements/
│   ├── messaging/
│   ├── calendar/
│   ├── athletics/
│   ├── student/
│   └── admin/
├── lib/
│   ├── supabase/               # client.ts, server.ts, middleware.ts
│   └── utils.ts
└── types/
    └── index.ts
supabase/
├── schema.sql                  # Schema + RLS policies
└── seed.sql                    # Westlake Academy demo data
```

---

## Phase 2 Roadmap

1. **Real-time notifications** — Supabase Realtime + browser push
2. **Attendance UI** — Full class-by-class tracking
3. **Assignment visibility** — Lightweight homework tracker (not gradebook)
4. **Parent engagement metrics** — Read receipts, login frequency
5. **Multi-school / district** — Tenant isolation, district dashboards
6. **PWA / mobile** — Installable app with push notifications
7. **SIS integrations** — Infinite Campus, PowerSchool CSV import
8. **AI digests** — Weekly summary emails, coach report generation
