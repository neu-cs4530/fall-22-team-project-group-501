import User from '../profile/User';
import supabase from '../supabase/client';


export default class UsersStore {

  private users: User[] = [];

  async function getUserByID(userID: number): User {
    return this._towns.find(user => user.townID === userID);

  }
}

