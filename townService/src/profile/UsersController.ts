import assert from 'assert';
import {
  Body,
  Controller,
  Delete,
  Example,
  Get,
  Header,
  Patch,
  Path,
  Post,
  Response,
  Route,
  Tags,
} from 'tsoa';

import {
  User,
  UserCreateResponse,
  Town,
  TownCreateParams,
  TownCreateResponse,
  UserCreateParams,
} from '../api/Model';
import InvalidParametersError from '../lib/InvalidParametersError';
import CoveyUsersStore from '../lib/UsersStore';
import {
  ConversationArea,
  CoveyTownSocket,
  TownSettingsUpdate,
  ViewingArea,
} from '../types/CoveyTownSocket';

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
   * List all towns that are set to be publicly available
   *
   * @returns list of towns
   */
  @Get()
  public async listUsers(): Promise<User[]> {
    return this._usersStore.getUsers();
  }

  /**
   * Updates an existing town's settings by ID
   *
   * @param townID  town to update
   * @param townUpdatePassword  town update password, must match the password returned by createTown
   * @param requestBody The updated settings
   */
  @Get('{userID}')
  @Response<InvalidParametersError>(400, 'Invalid password or update values specified')
  public async getUserInfo(@Path() userID: number): Promise<User | undefined> {
    const success = this._usersStore.getUserByID(userID);
    return success.then(user => user?.toModel());
  }

  /**
   * Create a new town
   *
   * @param request The public-facing information for the new town
   * @example request {"email": "The email of the user to create", "isPubliclyListed": "The nickname of the user to create. May be null"}
   * @returns The ID of the newly created town, and a secret password that will be needed to update or delete this town.
   */
  @Example<UserCreateResponse>({ userID: 123 })
  @Post()
  public async createTown(@Body() request: UserCreateParams): Promise<UserCreateResponse> {
    const { userID } = await this._usersStore.createUser(request.email, request.nickname || null);
    return {
      userID,
    };
  }
}
