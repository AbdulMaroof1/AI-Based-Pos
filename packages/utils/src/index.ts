import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtPayload } from '@pos/shared-types';

export class PasswordUtil {
  static async hash(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

export class JwtUtil {
  static sign(payload: JwtPayload, secret: string, expiresIn: string): string {
    return jwt.sign(payload as object, secret, { expiresIn } as SignOptions);
  }

  static verify(token: string, secret: string): JwtPayload {
    return jwt.verify(token, secret) as JwtPayload;
  }

  static decode(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }
}

