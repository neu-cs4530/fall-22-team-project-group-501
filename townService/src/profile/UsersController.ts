import { Controller, Get, Path, Response, Route, Security, Tags } from 'tsoa';

import { User } from '../api/Model';
import UserClass from './User';
import CoveyUsersStore from './UsersStore';

/**
 * This is the town route
 */
@Route('users')
@Tags('users')
// TSOA (which we use to generate the REST API from this file) does not support default exports, so the controller can't be a default export.
// eslint-disable-next-line import/prefer-default-export
export class UsersController extends Controller {
  private _usersStore: CoveyUsersStore = CoveyUsersStore.getInstance();

  /**
   * List all users
   *
   * @returns list of users
   */
  @Get()
  public async listUsers(): Promise<User[]> {
    return await this._usersStore.getUsers();
  }

  /**
   * Retrieves information of an existing user
   *
   * @param userID  user to retrieve
   */
  @Security('jwt')
  @Get('{userID}')
  public async getUserInfo(@Path() userID: string): Promise<User | undefined> {
    const user: UserClass | undefined = await this._usersStore.getUserByID(userID);
    return user?.toModel();
  }
}
