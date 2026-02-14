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
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new AppError('Missing authorization token', 401);
  }

  try {
    const token = header.slice(7);

    const payload = jwt.verify(
      token,
      env.JWT_PRIVATE_KEY,
      {
        algorithms: ['HS256'],
      }
    ) as AuthPayload;

    // Optional device binding check
    const deviceHeader = req.headers['x-device-id'] as string | undefined;
    if (
      deviceHeader &&
      payload.device_id &&
      deviceHeader !== payload.device_id
    ) {
      throw new AppError(
        'Device ID mismatch — token bound to a different device',
        403
      );
    }

    req.auth = payload;
    console.log('Auth middleware passed, user:', payload.user_id);
    next();
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
}
