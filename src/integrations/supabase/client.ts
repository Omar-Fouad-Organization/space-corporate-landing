import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xecogeelxabowzazqajq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlY29nZWVseGFib3d6YXpxYWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjU1ODMsImV4cCI6MjA4MjYwMTU4M30.wZVVQF2A7iHgj4Yjzk1pumeIzCkZbTppw3TLVrWnW1M'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Import the supabase client like this:
// For React:
// import { supabase } from "@/integrations/supabase/client";
// For React Native:
// import { supabase } from "@/src/integrations/supabase/client";
