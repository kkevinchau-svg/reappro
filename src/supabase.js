import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://tqqrfbjxptkvbnuwwhnz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxcXJmYmp4cHRrdmJudXd3aG56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MTY3MzMsImV4cCI6MjA5NDA5MjczM30.ieX1_dS3uiJvjZYvUmmAPXiUS7coJ7V_8IXYsKaLMnw'
)