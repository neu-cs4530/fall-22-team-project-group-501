import { User as UserModel } from '../api/Model';

/**
 * The User class implements the logic for each user: managing events that can occur
 * This includes:
 *  - changing nickname
 */
export default class User {
  private _userID: string;

  private _email: string | null;

  private _nickname: string | null;

  private _userTowns: string[] = [];

  get userID(): string {
    return this._userID;
  }

  set userID(userID: string) {
    this._userID = userID;
  }

  get email(): string {
    return this._email || '';
  }

  set email(email: string | null) {
    this._email = email;
  }

  get nickname(): string {
    return this._nickname || '';
  }

  set nickname(newNickname: string | null) {
    // TODO: Add code to change nickname in database

    if (this._nickname === newNickname) {
      return;
    }
    this._nickname = newNickname;
  }

  set userTowns(userTowns: string[]) {
    this._userTowns = userTowns;
  }

  get userTowns() : string[] {
    return this._userTowns;
  }

  constructor(userID: string, email: string | null, nickname: string | null, userTowns: string[]) {
    this._userID = userID;
    this._email = email;
    this._nickname = nickname;
    this._userTowns = userTowns;
  }

  public toModel(): UserModel {
    return { userID: this.userID, nickname: this.nickname, email: this.email, userTowns: this.userTowns };
  }
}
