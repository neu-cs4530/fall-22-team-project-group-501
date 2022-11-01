import User from '../profile/User';
import supabase from '../supabase/client';
import { UserEmitterFactory } from '../types/CoveyTownSocket';
import { User as UserModel } from '../api/Model';

export default class UsersStore {
  private static _instance: UsersStore;

  private _users: Map<number, User>;

  private _emitterFactory: UserEmitterFactory;

  static initializeTownsStore(emitterFactory: UserEmitterFactory) {
    UsersStore._instance = new UsersStore(emitterFactory);
  }

  /**
   * Retrieve the singleton UsersStore.
   *
   * There is only a single instance of the TownsStore - it follows the singleton pattern
   */
  static getInstance(): UsersStore {
    if (UsersStore._instance === undefined) {
      throw new Error('TownsStore must be initialized before getInstance is called');
    }
    return UsersStore._instance;
  }

  private constructor(emitterFactory: UserEmitterFactory) {
    this._emitterFactory = emitterFactory;
    this._users = new Map<number, User>();
  }

  async getUserByID(userID: number): Promise<User | undefined> {
    const user: User | undefined = this._users.get(userID);
    if (user) {
      return user;
    }
    const { data, error } = await supabase.from('user').select('*').eq('user_id', userID);

    if (error !== null) {
      console.error(error.message);
      throw new Error(`Could not retrieve user from database. Failed with Error: ${error.message}`);
    }
    if (data && data.length > 0) {
      const dbUser = data[0];
      return this._addExistingUser(dbUser.user_id, dbUser.nickname, dbUser.email);
    }
    return undefined;
  }

  private _addExistingUser(userID: number, nickname: string | null, email: string): User {
    const newUser = new User(userID, email, nickname, this._emitterFactory(userID));
    this._users.set(userID, newUser);
    return newUser;
  }

  public async createUser(email: string, nickname: string | null): Promise<User> {
    const { data, error } = await supabase.from('user').insert({ nickname, email }).select();
    if (error !== null) {
      throw new Error(`Could not create user in database. Failed with Error: ${error.message}`);
    }
    if (data !== null && data.length > 0) {
      return this._addExistingUser(data[0].user_id, data[0].nickname, data[0].email);
    }
    throw new Error('Could not create User in database');
  }

  /**
   * @returns List of all publicly visible towns
   */
  getUsers(): UserModel[] {
    return Array.from(this._users).map(([userID, user]) => ({
      userID,
      email: user.email,
      nickname: user.nickname,
    }));
  }
}
