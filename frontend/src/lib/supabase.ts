import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dxprwhsiktlxgvfoihvz.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for database
export type Case = {
  id: string
  title: string
  description: string
  status: 'open' | 'closed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  updated_at: string
  created_by: string
  tags: string[]
}

export type Evidence = {
  id: string
  case_id: string
  title: string
  type: 'video' | 'image' | 'document' | 'audio'
  url: string
  size: number
  created_at: string
  analysis_results: Record<string, any>
  tags: string[]
}

export type User = {
  id: string
  email: string
  name: string
  role: 'admin' | 'investigator' | 'analyst'
  created_at: string
}

// Auth helpers
export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Case helpers
export async function getCases() {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false })
  return { data: data as Case[], error }
}

export async function getCase(id: string) {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single()
  return { data: data as Case, error }
}

export async function createCase(caseData: Omit<Case, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('cases')
    .insert([caseData])
    .select()
    .single()
  return { data: data as Case, error }
}

export async function updateCase(id: string, updates: Partial<Case>) {
  const { data, error } = await supabase
    .from('cases')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data: data as Case, error }
}

export async function deleteCase(id: string) {
  const { error } = await supabase
    .from('cases')
    .delete()
    .eq('id', id)
  return { error }
}

// Evidence helpers
export async function getEvidenceForCase(caseId: string) {
  const { data, error } = await supabase
    .from('evidence')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })
  return { data: data as Evidence[], error }
}

export async function uploadEvidence(file: File, caseId: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `cases/${caseId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('evidence')
    .upload(filePath, file)

  if (uploadError) return { error: uploadError }

  const { data: { publicUrl } } = supabase.storage
    .from('evidence')
    .getPublicUrl(filePath)

  const { data, error } = await supabase
    .from('evidence')
    .insert([{
      case_id: caseId,
      title: file.name,
      type: file.type.startsWith('video') ? 'video' : 'image',
      url: publicUrl,
      size: file.size,
    }])
    .select()
    .single()

  return { data: data as Evidence, error }
}

export async function deleteEvidence(id: string) {
  const { error } = await supabase
    .from('evidence')
    .delete()
    .eq('id', id)
  return { error }
}
