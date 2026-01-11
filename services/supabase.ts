
import { createClient } from '@supabase/supabase-js';

// The API key is obtained exclusively from the environment variable process.env.API_KEY.
// Project ID: jnqpzkjthuxvobqhlzbp
const supabaseUrl = 'https://jnqpzkjthuxvobqhlzbp.supabase.co';
const supabaseKey = process.env.API_KEY; 

if (!supabaseKey) {
    console.error("Supabase API Key (process.env.API_KEY) is missing. Ensure the environment is configured correctly.");
}

export const supabase = createClient(supabaseUrl, supabaseKey || '');

/**
 * Ensures the user has an active session. 
 * This is called during app initialization to allow RLS policies to function.
 */
export const signInAnonymously = async () => {
    try {
        if (!supabase.auth || typeof supabase.auth.signInAnonymously !== 'function') {
            throw new Error("signInAnonymously is not supported by this version of Supabase SDK.");
        }
        
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        return data.user;
    } catch (error) {
        console.error("Supabase Auth Error:", error);
        throw error;
    }
};
