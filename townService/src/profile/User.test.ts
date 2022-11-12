import { nanoid } from 'nanoid';
import User from './User';
import { User as UserModel } from '../api/Model';

describe('User', () => {
  const testUserID = nanoid();
  const testUserEmail = 'test@gmail.com';
  const testUserNickname = 'test';
  const testUserTownsList = ['town1'];
  let user: User;

  beforeEach(() => {
    user = new User(testUserID, testUserEmail, testUserNickname, testUserTownsList);
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
  describe('userTowns', () => {
    it('Can be gotten after being set', () => {
      expect(user.userTowns).toBe(testUserTownsList);
      user.userTowns.push('another Town');
      expect(user.userTowns).toBe(['town1', 'another Town'])
    });
  });

  describe('toModel', () => {
    const userModel: UserModel = {
      userID: testUserID,
      nickname: testUserNickname,
      email: testUserEmail,
      userTowns: testUserTownsList,
    };

    it('Properly converts a user to a model', () => {
      expect(user.toModel()).toStrictEqual(userModel);
      user.email = 'testemail@gmail.com';
      expect(user.toModel()).toStrictEqual({
        userID: testUserID,
        nickname: testUserNickname,
        email: 'testemail@gmail.com',
        userTowns: ['town1']
      });
    });
  });

  describe('addTownToUser', () => {
    it('Properly adds a town to a users towns', () => {
      expect(user.userTowns).toBe(testUserTownsList);
      expect(user.userTowns.length).toBe(1);
      user.addTownToUser('another town');
      expect(user.userTowns.length).toBe(2);
    });

    /* TEST MORE FAULTS ?? */
  });
});
