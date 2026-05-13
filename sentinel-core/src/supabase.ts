import { createClient } from '@supabase/supabase-js'
const url = 'https://rfzkhvmycgspsieymsap.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmemtodm15Y2dzcHNpZXltc2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNjEyNjAsImV4cCI6MjA0NDgzNzI2MH0.9mYnk4CnMRFOjNRPdP0sIjnpXH1O5YIFmlgOcRmJCvA'
export const supabase = createClient(url, key)
