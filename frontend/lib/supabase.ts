import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if configured — gracefully degrade otherwise
let supabase: SupabaseClient | null = null
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

export { supabase }

export async function logSurgery(data: any) {
  if (!supabase) {
    console.warn('Supabase not configured — skipping audit log')
    return
  }

  const { error } = await supabase
    .from('audit_log')
    .insert({
      target_hash: data.certificate_hash.substring(0, 16),
      nodes_altered: data.layers_modified,
      surgery_time_ms: data.surgery_time_ms,
      certificate_hash: data.certificate_hash,
      device: data.device,
      intelligence_preserved: data.intelligence_preserved,
      status: data.status,
    })

  if (error) console.error('Supabase log error:', error)
}
