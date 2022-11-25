import { Controller, Get, Path, Route, Security, Tags } from 'tsoa';
import { Scopes } from '../api/authenticate'
import { User, Town } from '../api/Model';
import UserClass from './User';
import CoveyUsersStore from './UsersStore';
import CoveyTownsStore from '../lib/TownsStore';

/**
 * This is the town route
 */
@Route('users')
@Tags('users')
// TSOA (which we use to generate the REST API from this file) does not support default exports, so the controller can't be a default export.
// eslint-disable-next-line import/prefer-default-export
export class UsersController extends Controller {
  private _usersStore: CoveyUsersStore = CoveyUsersStore.getInstance();

  private _townsStore: CoveyTownsStore = CoveyTownsStore.getInstance();

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
  @Security('jwt', [Scopes.User])
  @Get('{userID}')
  public async getUserInfo(@Path() userID: string): Promise<User | undefined> {
    const user: UserClass | undefined = await this._usersStore.getUserByID(userID);
    return user?.toModel();
  }

  @Get('{userID}/towns')
  public async getUserTowns(@Path() userID: string): Promise<Town[]> {
    const userPromise: Promise<UserClass | undefined> = this._usersStore.getUserByID(userID);
    return userPromise.then(
      user =>
        user?.townIDs.flatMap(townID => this._townsStore.getTownByID(townID)?.toModel() ?? []) ??
        [],
    );
  }
}
