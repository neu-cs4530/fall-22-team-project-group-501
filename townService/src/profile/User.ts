import { ITiledMap, ITiledMapObjectLayer } from '@jonbell/tiled-map-type-guard';
import { nanoid } from 'nanoid';
import { BroadcastOperator } from 'socket.io';
import IVideoClient from '../lib/IVideoClient';
import Player from '../lib/Player';
import TwilioVideo from '../lib/TwilioVideo';
import { isViewingArea } from '../TestUtils';
import {
  ChatMessage,
  ConversationArea as ConversationAreaModel,
  CoveyTownSocket,
  Interactable,
  PlayerLocation,
  ServerToClientEvents,
  SocketData,
  ViewingArea as ViewingAreaModel,
} from '../types/CoveyTownSocket';
import ConversationArea from '../town/ConversationArea';
import InteractableArea from '../town/InteractableArea';
import ViewingArea from '../town/ViewingArea';
import { Database } from '../supabase/types';
import { User as UserModel } from '../api/Model';

/**
 * The User class implements the logic for each user: managing events that can occur
 * This includes:
 *  - changing nickname
 */
export default class User {
  private _userID: number;

  private _email: string;

  private _nickname: string | null;

  get userID(): number {
    return this._userID;
  }

  set userID(userID: number) {
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

  constructor(userID: number, email: string, nickname: string | null) {
    this._userID = userID;
    this._email = email;
    this._nickname = nickname;
  }

  public toModel(): UserModel {
    return { userID: this.userID, nickname: this.nickname, email: this.email };
  }
}
