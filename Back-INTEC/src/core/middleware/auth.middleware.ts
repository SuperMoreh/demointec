import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ msg: 'Acceso denegado. Token no proporcionado.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY!);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token inválido o expirado' });
    return;
  }
};

