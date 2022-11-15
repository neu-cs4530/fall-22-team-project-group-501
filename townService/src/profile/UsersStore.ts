import User from './User';
import { User as UserModel } from '../api/Model';
import UsersDom, { DBUser } from './UsersDom';
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
    this.refreshStore();
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

    const dbUser: DBUser | undefined = await UsersDom.getUserFromDB(userID);
    if (dbUser) {
      return this._addExistingUser(dbUser.id, dbUser.nickname, dbUser.email);
    }
    return undefined;
  }

  /**
   * Refreshes the UsersStore to be in sync with the database
   */
  public async refreshStore(): Promise<void> {
    (await UsersDom.loadExistingUsers()).forEach(user =>
      this._addExistingUser(user.id, user.nickname, user.email),
    );
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
    return Array.from(this._users).map(([userID, user]) => ({
      userID,
      email: user.email,
      nickname: user.nickname,
    }));
  }

  /**
   * Adds the given townID to the User
   */
  public async addTownToUser(userID: string, townID: string) {
    this.getUserByID(userID).then(user => user?.addTownID(townID));
  }
}
