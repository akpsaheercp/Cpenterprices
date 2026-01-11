
import { createClient } from '@supabase/supabase-js';

// The API key is obtained from the environment variable. 
// If missing, we provide a placeholder to prevent the client from crashing on initialization.
const supabaseUrl = 'https://jnqpzkjthuxvobqhlzbp.supabase.co';
const supabaseKey = process.env.API_KEY || ''; 

if (!supabaseKey) {
    console.warn("Supabase API Key is missing. Data will be saved locally only.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Ensures the user has an active session. 
 * Handled gracefully to allow the app to function even if Supabase is unavailable.
 */
export const signInAnonymously = async () => {
    try {
        if (!supabaseKey) return null;
        
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
            console.warn("Supabase Auth Error (continuing as guest):", error.message);
            return null;
        }
        return data.user;
    } catch (error) {
        console.error("Supabase Auth Exception:", error);
        return null;
    }
};
