import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://rfzkhvmycgspsieymsap.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmemtodm15Y2dzcHNpZXltc2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MTcxMDcsImV4cCI6MjA4NTk5MzEwN30.88bl9KfnVgZa8sISxuzWcqEbORlADSraXZ70Vkro8rA'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
