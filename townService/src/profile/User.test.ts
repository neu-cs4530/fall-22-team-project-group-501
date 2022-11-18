import { nanoid } from 'nanoid';
import User from './User';
import { User as UserModel } from '../api/Model';

describe('User', () => {
  const testUserID = nanoid();
  const testUserEmail = 'test@gmail.com';
  const testUserNickname = 'test';
  let user: User;

  beforeEach(() => {
    user = new User(testUserID, testUserEmail, testUserNickname);
  });

  describe('userID', () => {
    it('Can be gotten after being set', () => {
      expect(user.userID).toBe(testUserID);
      user.userID = 'testID';
      expect(user.userID).toBe('testID');
    });
  });
  describe('nickname', () => {
    it('Can be gotten after being set', () => {
      expect(user.nickname).toBe(testUserNickname);
      user.nickname = 'testNickname';
      expect(user.nickname).toBe('testNickname');
    });
    it('Can be returns an empty string if null', () => {
      expect(user.nickname).toBe(testUserNickname);
      user.nickname = null;
      expect(user.nickname).toBe('');
    });
  });
  describe('email', () => {
    it('Can be gotten after being set', () => {
      expect(user.email).toBe(testUserEmail);
      user.email = 'testEmail';
      expect(user.email).toBe('testEmail');
    });

    it('Can be returns an empty string if null', () => {
      expect(user.nickname).toBe(testUserNickname);
      user.nickname = null;
      expect(user.nickname).toBe('');
    });
  });

  describe('toModel', () => {
    const userModel: UserModel = {
      userID: testUserID,
      nickname: testUserNickname,
      email: testUserEmail,
    };

    it('Properly converts a user to a model', () => {
      expect(user.toModel()).toStrictEqual(userModel);
      user.email = 'testemail@gmail.com';
      expect(user.toModel()).toStrictEqual({
        userID: testUserID,
        nickname: testUserNickname,
        email: 'testemail@gmail.com',
      });
    });
  });

  describe('addTownID', () => {
    const townID = nanoid();
    it('Adds the given townID to the user', () => {
      expect(user.townIDs).not.toEqual(expect.arrayContaining([townID]));
      expect(user.townIDs).toHaveLength(0);

      user.addTownID(townID);

      expect(user.townIDs).toEqual(expect.arrayContaining([townID]));
      expect(user.townIDs).toHaveLength(1);
    });
  });
});
