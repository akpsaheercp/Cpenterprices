
/**
 * Firebase service disabled. 
 * Using local storage for all operations.
 */
export const db = null as any;
export const auth = null as any;

export const signIn = async () => ({ id: 'guest' });
export const signInWithUsername = async () => ({});
export const registerWithUsername = async () => ({});
export const logout = async () => {};
export const resetLocalCache = async () => true;
