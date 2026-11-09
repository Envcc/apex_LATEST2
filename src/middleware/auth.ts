/**
 * @file src/middleware/auth.ts
 * @summary Ingress Authentication & Session Token Revocation Verification Middleware.
 * 
 * CURRENT STATE:
 * - Validates Bearer ID tokens via Firebase Admin SDK.
 * - Forces checkRevoked = true to reject revoked tokens immediately.
 * - Restricts sandbox header bypass strictly to development runtimes.
 * 
 * FUTURE ROADMAP:
 * 1. Implement granular Attribute-Based Access Control (ABAC) checking user roles/claims.
 * 2. Add IP threat intelligence and rate-limiting triggers on failed auth spikes.
 */

import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role: string;
  };
}

export const verifyStrictBearerAuth = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  // STRICT SECURITY INVARIANT: Disable all query parameter autostart bypasses in non-development modes
  if (process.env.NODE_ENV === 'development' && req.headers['x-dev-sandbox-bypass'] === 'true') {
    (req as AuthenticatedRequest).user = { uid: 'dev-sandbox-user', email: 'dev@apexbureau.internal', role: 'ADMIN' };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Access Denied: Missing or malformed Authorization header.' 
    });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Force checkRevoked = true to reject revoked tokens immediately
    const decodedToken = await adminAuth.verifyIdToken(idToken, true);
    (req as AuthenticatedRequest).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: (decodedToken.role as string) || 'USER'
    };
    next();
  } catch (error: any) {
    console.error('[SECURITY_ALERT] Token Verification Failed:', error.message);
    return res.status(401).json({ 
      error: 'Unauthorized: Invalid credentials or session expired.' 
    });
  }
};
