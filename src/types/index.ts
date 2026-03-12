export type UserRole = 'admin' | 'teacher' | 'coach' | 'parent' | 'student'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  school_id: string
  avatar_url?: string
  phone?: string
  created_at: string
}

export interface School {
  id: string
  name: string
  address?: string
  phone?: string
  website?: string
  logo_url?: string
  created_at: string
}

export interface Student {
  id: string
  user_id?: string
  school_id: string
  first_name: string
  last_name: string
  grade: string
  date_of_birth?: string
  student_id_number?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  photo_url?: string
  created_at: string
  // joined
  school?: School
  profile?: Profile
}

export interface ParentStudent {
  id: string
  parent_id: string
  student_id: string
  relationship: string
  created_at: string
  student?: Student
  parent?: Profile
}

export interface Team {
  id: string
  school_id: string
  name: string
  sport: string
  season: string
  coach_id?: string
  description?: string
  created_at: string
  coach?: Profile
  school?: School
}

export interface TeamMembership {
  id: string
  team_id: string
  student_id: string
  jersey_number?: string
  position?: string
  created_at: string
  team?: Team
  student?: Student
}

export interface Announcement {
  id: string
  author_id: string
  school_id: string
  team_id?: string
  class_id?: string
  title: string
  body: string
  category: 'school' | 'team' | 'class' | 'urgent'
  is_pinned: boolean
  published_at: string
  created_at: string
  author?: Profile
  team?: Team
}

export interface Message {
  id: string
  sender_id: string
  school_id: string
  subject: string
  body: string
  category: 'general' | 'class' | 'team' | 'urgent'
  created_at: string
  sender?: Profile
}

export interface MessageRecipient {
  id: string
  message_id: string
  recipient_id: string
  read_at?: string
  created_at: string
  message?: Message
}

export interface Event {
  id: string
  school_id: string
  team_id?: string
  title: string
  description?: string
  event_type: 'school' | 'athletics' | 'academic' | 'other'
  start_time: string
  end_time?: string
  location?: string
  created_by: string
  created_at: string
  team?: Team
  creator?: Profile
}

export interface Class {
  id: string
  school_id: string
  teacher_id: string
  name: string
  subject: string
  grade_level: string
  period?: string
  room?: string
  created_at: string
  teacher?: Profile
}

export interface StudentClass {
  id: string
  student_id: string
  class_id: string
  created_at: string
  class?: Class
}

export interface AttendanceRecord {
  id: string
  student_id: string
  date: string
  status: 'present' | 'absent' | 'tardy' | 'excused'
  notes?: string
  created_at: string
}

// UI helpers
export interface NavItem {
  label: string
  href: string
  icon: string
  roles: UserRole[]
}

export interface DashboardCard {
  title: string
  value: string | number
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: string
}
