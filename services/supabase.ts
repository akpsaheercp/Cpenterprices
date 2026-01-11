
/**
 * Database connection removed as per request.
 * All operations now run on Local Storage.
 */
export const supabase = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
    delete: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
  }),
  auth: {
    signInAnonymously: () => Promise.resolve({ data: { user: null }, error: null }),
  }
} as any;

export const signInAnonymously = async () => null;
