import supabase from '../supabase/client';

export interface DBUser {
  id: string;

  nickname: string | null;

  email: string | null;
}

export default class UsersDom {
  public static async getUserFromDB(userID: string): Promise<DBUser | undefined> {
    const { data, error } = await supabase().from('users').select('*').eq('id', userID);

    if (error !== null) {
      throw new Error(`Could not retrieve user from database. Failed with Error: ${error.message}`);
    }
    if (data && data.length > 0) {
      const dbUser = data[0];
      return dbUser;
    }
    return undefined;
  }

  /**
   * Loads existing users from the db into the store
   */
  public static async loadExistingUsers(): Promise<DBUser[]> {
    const { data, error } = await supabase().from('users').select('*');
    if (!data) {
      throw new Error('Could not load existing users');
    }
    if (error) {
      throw new Error(`Could not load existing users. Failed with error: ${error}`);
    }
    return data;
  }
}
