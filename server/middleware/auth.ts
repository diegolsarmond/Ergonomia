import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET ?? 'ergonomia-dev-secret-change-in-prod';
export const JWT_EXPIRES_IN = '8h';

export interface AuthPayload {
  userId: string;
  username: string;
  nome: string;
  perfil: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const token = header.slice(7);
      req.auth = jwt.verify(token, JWT_SECRET) as AuthPayload;
    } catch {
      // Token inválido ou expirado — continua sem autenticação
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }
  try {
    const token = header.slice(7);
    req.auth = jwt.verify(token, JWT_SECRET) as AuthPayload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.auth?.perfil !== 'ADMIN') {
    res.status(403).json({ error: 'Acesso restrito a administradores' });
    return;
  }
  next();
}
