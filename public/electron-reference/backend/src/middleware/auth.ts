import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/errors';
import type { AuthPayload } from '../types';

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  // Allow token in header OR query param (for <img> tags)
  const header = req.headers.authorization;
  const queryToken = req.query.token as string | undefined;

  let token = '';

  if (header?.startsWith('Bearer ')) {
    token = header.slice(7);
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token) {
    throw new AppError('Missing authorization token', 401);
  }

  try {
    console.log('Verifying token:', token.substring(0, 10) + '...');
    const payload = jwt.verify(
      token,
      env.JWT_PRIVATE_KEY,
      {
        algorithms: ['HS256'],
      }
    ) as AuthPayload;

    console.log('Token verified, payload:', JSON.stringify(payload));

    // Optional device binding check
    const deviceHeader = req.headers['x-device-id'] as string | undefined;
    if (
      deviceHeader &&
      payload.device_id &&
      deviceHeader !== payload.device_id
    ) {
      console.warn('Device ID mismatch:', { header: deviceHeader, payload: payload.device_id });
      throw new AppError(
        'Device ID mismatch — token bound to a different device',
        403
      );
    }

    req.auth = payload;
    console.log('Auth middleware passed for user:', payload.user_id, 'role:', payload.role);
    next();
  } catch (err) {
    console.error('Auth middleware failed:', err instanceof Error ? err.message : err);
    throw new AppError('Invalid or expired token', 401);
  }
}
