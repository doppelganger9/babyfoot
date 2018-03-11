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
    console.log('Authorization Header value: ' + authHeader);
    const [, idToken] = authHeader!.split('Bearer ');
    // idToken comes from the client app (shown above)
    console.log('idToken: ' + idToken);
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      console.log('JWT is valid! Decoded uid: ' + uid);
      // ...
      next();
    } catch (error) {
      // Handle error
      res.status(403).send({ message: 'error verifying the JWT ID token from Firebase Auth', error });
    }
  } else {
    console.warn('bypassing checkFirebaseAuthToken in development');
    next();
  }
}
