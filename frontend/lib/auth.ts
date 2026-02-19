import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtPayload } from './types';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwt(
  payload: JwtPayload,
  secret: string,
  expiresIn: string,
): string {
  return jwt.sign(payload as object, secret, { expiresIn } as SignOptions);
}

export function signPayload<T extends object>(
  payload: T,
  secret: string,
  expiresIn: string,
): string {
  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
}

export function verifyJwt<T = JwtPayload>(token: string, secret: string): T {
  return jwt.verify(token, secret) as T;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
}
