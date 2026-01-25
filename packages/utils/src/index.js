"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtil = exports.PasswordUtil = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class PasswordUtil {
    static async hash(password) {
        const saltRounds = 10;
        return bcrypt_1.default.hash(password, saltRounds);
    }
    static async compare(password, hash) {
        return bcrypt_1.default.compare(password, hash);
    }
}
exports.PasswordUtil = PasswordUtil;
class JwtUtil {
    static sign(payload, secret, expiresIn) {
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
    }
    static verify(token, secret) {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    static decode(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch {
            return null;
        }
    }
}
exports.JwtUtil = JwtUtil;
//# sourceMappingURL=index.js.map