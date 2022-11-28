export interface DBUser {
  id: string;

  nickname: string | null;

  email: string | null;
}

export default class UsersDom {
  // This is a mock, so eslint throwing this error is unnecessary
  /* eslint-disable @typescript-eslint/no-unused-vars */
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
