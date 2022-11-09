import User from './User';
import supabase from '../supabase/client';
import { User as UserModel } from '../api/Model';
/**
 * A Store for caching user entries from the database.
 *
 * Follows a singleton pattern
 */
export default class UsersStore {
  private static _instance: UsersStore;

  private _users: Map<string, User>;

  /**
   * Create and refresh the store of users
   */
  static initializeUsersStore() {
    UsersStore._instance = new UsersStore();
    UsersStore._instance.refreshStore();
  }

  /**
   * Loads existing users from the db into the store
   */
  private async _loadExistingUsers() {
    const { data, error } = await supabase.from('users').select('*');
    if (!data) {
      throw new Error('Could not load existing users');
    }
    if (error) {
      throw new Error(`Could not load existing users. Failed with error: ${error}`);
    }
    data?.forEach(user => this._addExistingUser(user.id, user.nickname, user.email));
  }

  /**
   * Retrieve the singleton UsersStore.
   *
   * There is only a single instance of the UsersStore - it follows the singleton pattern
   */
  static getInstance(): UsersStore {
    if (UsersStore._instance === undefined) {
      UsersStore.initializeUsersStore();
    }
    return UsersStore._instance;
  }

  private constructor() {
    this._users = new Map<string, User>();
  }

  /**
   * Gets a user from the cache of the given ID. If it cannot find it, then it checks the DB and refreshes the cache
   * @param userID the id of the user to look up
   * @returns the user with the given ID
   */
  async getUserByID(userID: string): Promise<User | undefined> {
    const user: User | undefined = this._users.get(userID);
    if (user) {
      return user;
    }

    return this._getUserFromDB(userID);
  }

  /**
   * Refreshes the UsersStore to be in sync with the database
   */
  public async refreshStore(): Promise<void> {
    this._loadExistingUsers();
  }

  private async _getUserFromDB(userID: string) {
    const { data, error } = await supabase.from('users').select('*').eq('id', userID);

    if (error !== null) {
      throw new Error(`Could not retrieve user from database. Failed with Error: ${error.message}`);
    }
    if (data && data.length > 0) {
      const dbUser = data[0];
      return this._addExistingUser(dbUser.id, dbUser.nickname, dbUser.email);
    }
    return undefined;
  }

  /**
   * Adds a User to the usersStore. Should not be used outside of testing
   * @param userID userID of the user to add
   * @param nickname nickname of the user to add
   * @param email email of the user to add
   * @returns the user that was added
   */
  public _addExistingUser(userID: string, nickname: string | null, email: string | null): User {
    const newUser = new User(userID, email, nickname);
    this._users.set(userID, newUser);
    return newUser;
  }

  /**
   * @returns List of all publicly visible users
   */
  public async getUsers(): Promise<UserModel[]> {
    // TODO this is super inefficient
    await this.refreshStore();
    return Array.from(this._users).map(([userID, user]) => ({
      userID,
      email: user.email,
      nickname: user.nickname,
    }));
  }
}
