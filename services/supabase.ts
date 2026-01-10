
import { createClient } from '@supabase/supabase-js';

// These should ideally be in process.env, but for this context we use placeholders 
// that you must replace with your actual values from the Supabase dashboard.
const supabaseUrl = 'https://your-project-id.supabase.co';
const supabaseAnonKey = 'your-anon-public-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signInAnonymously = async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data.user;
};
