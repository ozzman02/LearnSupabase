
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gieynceclxvreynotfxx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZXluY2VjbHh2cmV5bm90Znh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MTIyODMsImV4cCI6MjA2MTk4ODI4M30.0xjqujezFbN4SXLmepmmxMqge4h7dnxHd1GyoKZgsGw'
export const supabase = createClient(supabaseUrl, supabaseKey)