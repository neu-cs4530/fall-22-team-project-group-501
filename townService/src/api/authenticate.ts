import { User } from '@supabase/gotrue-js';
import { Request } from 'express';
import supabase from '../supabase/client';

export enum Scopes {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  User = 'User',
}

export class AuthError extends Error {
  status: number;

  constructor(message?: string | undefined, status?: number) {
    super(message);
    this.status = status || 401;
  }
}
export function expressAuthentication(
  req: Request,
  securityName: string,
  scopes?: string[],
): Promise<User | undefined> {
  if (securityName === 'jwt') {
    return new Promise((resolve, reject) => {
      const bearerHeader = req.headers.authorization;
      if (!bearerHeader) {
        reject(new AuthError('Request does not contain token in bearer', 403));
        return;
      }
      const bearer = bearerHeader.split(' ');
      const token: string = bearer[1];
      supabase()
        .auth.getUser(token)
        .then(userResponse => {
          if (userResponse.error) {
            reject(new AuthError(userResponse.error.message + token, 401));
            return;
          }

          const { user } = userResponse.data;
          const reqUser = req.params.userID || req.body.userID;
          if ((scopes && scopes.includes(Scopes.User) && !user) || user?.id !== reqUser) {
            reject(new AuthError('Forbidden: User Token did not match user in request'));
            return;
          }
          resolve(user);
        });
    });
  }

  return Promise.resolve(undefined);
}
