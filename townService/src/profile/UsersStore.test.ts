import { nanoid } from 'nanoid';
import UsersStore from './UsersStore';
import { User as UserModel } from '../api/Model';

describe('UsersStore', () => {
  const loadUsersSpy: jest.SpyInstance = jest
    .spyOn(UsersStore.prototype as any, '_loadExistingUsers')
    .mockImplementation(() => undefined);
  const getUserFromDBSpy: jest.SpyInstance = jest
    .spyOn(UsersStore.prototype as any, '_getUserFromDB')
    .mockImplementation(() => undefined);
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
});
