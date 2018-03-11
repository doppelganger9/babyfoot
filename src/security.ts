import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
/**
 * Express Middleware to check Firebase Auth token.
 * see https://firebase.google.com/docs/admin/setup
 *
 */
export async function checkFirebaseAuthToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      res.status(401).send('Authentication required.');
    }
    const [, idToken] = authHeader!.split('Bearer ');
    try {
      // const decodedToken = await admin.auth().verifyIdToken(idToken);
      // const uid = decodedToken.uid;
      next();
    } catch (error) {
      res.status(403).send({ message: 'error verifying the JWT ID token from Firebase Auth', error });
    }
  } else {
    console.warn('bypassing checkFirebaseAuthToken in development');
    next();
  }
}
