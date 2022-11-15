import { nanoid } from 'nanoid';
import UsersStore from './UsersStore';
import { User as UserModel } from '../api/Model';
import User from './User';
import UsersDom from './UsersDom';

describe('UsersStore', () => {
  const loadUsersSpy: jest.SpyInstance = jest
    .spyOn(UsersDom, 'loadExistingUsers')
    .mockImplementation(() => Promise.resolve([]));
  const getUserFromDBSpy: jest.SpyInstance = jest
    .spyOn(UsersDom, 'getUserFromDB')
    .mockImplementation(() => Promise.resolve(undefined));
  let usersStore: UsersStore = UsersStore.getInstance();

  beforeEach(() => {
    UsersStore.initializeUsersStore();
    usersStore = UsersStore.getInstance();
    loadUsersSpy.mockClear();
    getUserFromDBSpy.mockClear();
  });

  describe(UsersStore.getInstance, () => {
    it('Returns the same instance if called multiple times', () => {
      expect(usersStore === UsersStore.getInstance()).toBe(true);
    });
  });

  describe(UsersStore.initializeUsersStore, () => {
    it('Loads in existing users', () => {
      UsersStore.initializeUsersStore();
      expect(loadUsersSpy).toBeCalledTimes(1);
    });

    it('Creates a new store', () => {
      UsersStore.initializeUsersStore();
      expect(usersStore === UsersStore.getInstance()).toBe(false);
    });
  });

  describe(usersStore.refreshStore, () => {
    it('Loads in existing users', () => {
      usersStore.refreshStore();
      expect(loadUsersSpy).toBeCalledTimes(1);
    });

    it('Does not create a new store', () => {
      usersStore.refreshStore();
      expect(usersStore === UsersStore.getInstance()).toBe(true);
    });
  });

  describe(usersStore.getUserByID, () => {
    const testID = nanoid();
    it('Calls the database with the given id', () => {
      usersStore.getUserByID(testID);
      expect(getUserFromDBSpy).toHaveBeenCalledWith(testID);
    });

    it('Returns undefined if the user cannot be found', () => {
      expect(usersStore.getUserByID(testID)).resolves.toBe(undefined);
    });

    it('Returns a user if the user has been created', () => {
      const user = usersStore._addExistingUser(testID, 'email', 'nickname');
      expect(usersStore.getUserByID(testID)).resolves.toBe(user);
    });
  });

  describe(usersStore.getUsers, () => {
    const testID1 = nanoid();
    const testID2 = nanoid();
    const testID3 = nanoid();
    it('Returns an empty list if no users are added', () => {
      expect(usersStore.getUsers()).resolves.toHaveLength(0);
    });

    it('Properly returns a list of all users', async () => {
      const user1 = usersStore._addExistingUser(testID1, 'nickname', 'email').toModel();
      const user2 = usersStore._addExistingUser(testID2, 'nickname', 'email').toModel();
      const users: UserModel[] = await usersStore.getUsers();
      expect(users).toEqual(expect.arrayContaining([user1, user2]));
      const user3 = usersStore._addExistingUser(testID3, 'nickname', 'email').toModel();
      expect(usersStore.getUsers()).resolves.toEqual(expect.arrayContaining([user1, user2, user3]));
    });

    it('Does not return multiple users of the same ID', async () => {
      const user1 = usersStore._addExistingUser(testID1, 'nickname', 'email').toModel();
      const user2 = usersStore._addExistingUser(testID2, 'nickname', 'email').toModel();
      let users: UserModel[] = await usersStore.getUsers();
      expect(users).toEqual(expect.arrayContaining([user1, user2]));
      const user3 = usersStore._addExistingUser(testID2, 'nickname', 'email').toModel();
      users = await usersStore.getUsers();
      expect(users).toEqual(expect.arrayContaining([user1, user3]));
    });
  });

  describe(usersStore.addTownToUser, () => {
    const townID1 = nanoid();
    const townID2 = nanoid();
    const userID1 = nanoid();
    const userID2 = nanoid();

    const userNickname1 = 'nickname1';
    const userEmail1 = 'email1';
    const userNickname2 = 'nickname2';
    const userEmail2 = 'email2';
    let user1: User;
    let user2: User;

    beforeEach(() => {
      user1 = usersStore._addExistingUser(userID1, userNickname1, userEmail1);
      user2 = usersStore._addExistingUser(userID2, userNickname2, userEmail2);
    });
    it('Adds the given townID to the user', async () => {
      usersStore.addTownToUser(user1.userID, townID1);
      const townIDs: string[] = await usersStore
        .getUserByID(user1.userID)
        .then(user => user?.townIDs ?? []);
      expect(townIDs).toEqual(expect.arrayContaining([townID1]));
    });

    it('Adds the given townID to the users individually', async () => {
      usersStore.addTownToUser(user1.userID, townID1);
      usersStore.addTownToUser(user2.userID, townID2);
      const townIDs1: string[] = await usersStore
        .getUserByID(user1.userID)
        .then(user => user?.townIDs ?? []);
      const townIDs2: string[] = await usersStore
        .getUserByID(user2.userID)
        .then(user => user?.townIDs ?? []);
      expect(townIDs1).toEqual(expect.arrayContaining([townID1]));
      expect(townIDs2).toEqual(expect.arrayContaining([townID2]));
    });
  });
});
