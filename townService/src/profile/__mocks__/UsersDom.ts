export interface DBUser {
  id: string;

  nickname: string | null;

  email: string | null;
}

export default class UsersDom {
  public static async getUserFromDB(_userID: string): Promise<DBUser | undefined> {
    return undefined;
  }

  /**
   * Loads existing users from the db into the store
   */
  public static async loadExistingUsers(): Promise<DBUser[]> {
    return [];
  }
}