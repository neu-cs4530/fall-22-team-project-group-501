import { User as UserModel } from '../api/Model';

/**
 * The User class implements the logic for each user: managing events that can occur
 * This includes:
 *  - changing nickname
 */
export default class User {
  private _userID: string;

  private _email: string;

  private _nickname: string | null;

  get userID(): string {
    return this._userID;
  }

  set userID(userID: string) {
    this._userID = userID;
  }

  get email(): string {
    return this._email;
  }

  set email(email: string) {
    this._email = email;
  }

  get nickname(): string {
    return this._nickname || '';
  }

  set nickname(newNickname: string) {
    // TODO: Add code to change nickname in database

    if (this.nickname !== newNickname) {
      return;
    }
    this._nickname = newNickname;
  }

  constructor(userID: string, email: string, nickname: string | null) {
    this._userID = userID;
    this._email = email;
    this._nickname = nickname;
  }

  public toModel(): UserModel {
    return { userID: this.userID, nickname: this.nickname, email: this.email };
  }
}
