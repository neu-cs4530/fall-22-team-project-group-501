import { Request } from 'express';
import { AuthApiError, UserResponse } from '@supabase/supabase-js';
import supabase from '../supabase/client';

export class AuthError extends Error {
  status: number = 401;
  constructor(message?: string | undefined, status?: number) {
    super(message);
    this.status = status || 401;
  }
}
export function expressAuthentication(
  req: Request,
  securityName: string,
  _scopes?: string[],
): Promise<any> {
  if (securityName === 'jwt') {
    return new Promise((resolve, reject) => {
      const bearerHeader = req.headers['authorization'];
      if (!bearerHeader) {
        return reject(new AuthError('Request does not contain token in bearer', 403));
      }
      const bearer = bearerHeader.split(' ');
      const token: string = bearer[1];
      supabase.auth.getUser(token).then(userResponse => {
        if (userResponse.error) {
          return reject(new AuthError(userResponse.error.message + token, 401));
        }

        const { user } = userResponse.data;
        const reqUser = req.params.userID || req.body.userID;
        if (!user || user?.id !== reqUser) {
          return reject(new AuthError('Forbidden: User Token did not match user in request'));
        }
        return resolve(user);
      });
    });
  }

  return Promise.resolve();
}
