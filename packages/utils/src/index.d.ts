import { JwtPayload } from '@pos/shared-types';
export declare class PasswordUtil {
    static hash(password: string): Promise<string>;
    static compare(password: string, hash: string): Promise<boolean>;
}
export declare class JwtUtil {
    static sign(payload: JwtPayload, secret: string, expiresIn: string): string;
    static verify(token: string, secret: string): JwtPayload;
    static decode(token: string): JwtPayload | null;
}
//# sourceMappingURL=index.d.ts.map