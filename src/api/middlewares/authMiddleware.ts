import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
  };
}

export default function mockAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];

  // Для деву — просто читаємо email з хедера
  if (!authHeader) {
    return res.status(401).json({
      status: 'error',
      error: 'Authorization header required'
    });
  };

  console.log('email from auth header:', authHeader);

  // У продакшені тут би був jwt.verify(...)
  req.user = { email: authHeader };

  next();
}
