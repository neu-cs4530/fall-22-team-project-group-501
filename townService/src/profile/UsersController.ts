import { Controller, Get, Post, Path, Response, Route, Tags, Body } from 'tsoa';

import { TownCreateParams, User } from '../api/Model';
import TownsStore from '../lib/TownsStore';
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
  private _townsStore: TownsStore = TownsStore.getInstance();

  /**
   * List all users
   *
   * @returns list of users
   */
  @Get()
  public async listUsers(): Promise<User[]> {
    return this._usersStore.getUsers();
  }

  /**
   * Retrieves information of an existing user
   *
   * @param userID  user to retrieve
   */
  @Get('{userID}')
  public async getUserInfo(@Path() userID: string): Promise<User | undefined> {
    const success: Promise<UserClass | undefined> = this._usersStore.getUserByID(userID);
    return success.then(user => user?.toModel());
  }

  // @Post('{userID}/town')
  // public async addTown(@Path() userID: string,  @Body() request: TownCreateParams): Promise<User | undefined> {
  //   const success: Promise<UserClass | undefined> = this._usersStore.getUserByID(userID);
  //   const { townID, townUpdatePassword } = await this._townsStore.createTown(
  //     request.friendlyName,
  //     request.isPubliclyListed,
  //     request.mapFile,
  //   );
  //   success.then(user => user?.addTownToUser(townID));

  //   return success.then(user => user?.toModel());
  // }
}
