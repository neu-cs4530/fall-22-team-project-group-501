import { Request, Response, NextFunction } from 'express';
import supabase from '../supabase/client';

export default function authenticateToken(req: Request, securityName: string, scopes?: string[]) {
  const token = req.cookies['sb:token'];

  if(securityName === "supabase") {
    if (token == null) res.sendStatus(401);

    supabase.auth.getUser(token).then(userResponse => {
      if (userResponse.error) {
        res.status(403).send(userResponse.error);
      }
  
      const { user } = userResponse.data;
      if (!user || user?.id !== req.params.userID) {
        res.status(403).send('Forbidden: User Token did not match user in request');
      }
      next();
    });
  }
  
}
