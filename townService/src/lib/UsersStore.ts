import AccessToken from 'twilio/lib/jwt/AccessToken';
import User from '../profile/User';
import supabase, { createUserClient } from '../supabase/client';
import { UserEmitterFactory } from '../types/CoveyTownSocket';
import { User as UserModel } from '../api/Model';
import InvalidAuthorizationError from './InvalidAuthorizationError';

export default class UsersStore {
  private static _instance: UsersStore;

  private _users: Map<string, User>;

  static initializeUsersStore() {
    UsersStore._instance = new UsersStore();
    UsersStore._instance._loadExistingUsers();
  }

  private async _loadExistingUsers() {
    const { data, error } = await supabase.from('users').select('*');

    console.log(data);
    if (!data) {
      throw new Error('Could not load existing users');
    }
    data?.forEach(user => this._addExistingUser(user.id, user.nickname, user.email));
  }

  /**
   * Retrieve the singleton UsersStore.
   *
   * There is only a single instance of the TownsStore - it follows the singleton pattern
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

  async getUserByID(userID: string): Promise<User | undefined> {
    if ((await supabase.auth.getUser()).data.user?.id !== userID) {
      throw new InvalidAuthorizationError(`Unauthorized access for user ${userID}`);
    }
    const user: User | undefined = this._users.get(userID);
    if (user) {
      return user;
    }
    const { data, error } = await supabase.from('users').select('*').eq('id', userID);

    if (error !== null) {
      console.error(error.message);
      throw new Error(`Could not retrieve user from database. Failed with Error: ${error.message}`);
    }
    if (data && data.length > 0) {
      const dbUser = data[0];
      return this._addExistingUser(dbUser.id, dbUser.nickname, dbUser.email);
    }
    return undefined;
  }

  private _addExistingUser(userID: string, nickname: string | null, email: string): User {
    const newUser = new User(userID, email, nickname);
    this._users.set(userID, newUser);
    return newUser;
  }

  /**
   * @returns List of all publicly visible towns
   */
  async getUsers(): Promise<UserModel[]> {
    await this._loadExistingUsers();
    return Array.from(this._users).map(([userID, user]) => ({
      userID,
      email: user.email,
      nickname: user.nickname,
    }));
  }
}
