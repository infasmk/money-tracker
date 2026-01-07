
/* Re-establishing Supabase client to fix import errors and support authentication logic */
import { createClient } from '@supabase/supabase-js';

// Configuration placeholders - in production these should be environment variables
const supabaseUrl = 'https://lib-hotel-pro-project.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key';

export const supabase = createClient(supabaseUrl, supabaseKey);
