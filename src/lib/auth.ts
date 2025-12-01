// lib/auth.ts
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "secret";

export type JwtPayload = {
  userId: number;
  email: string;
  iat: number;
  exp: number;
};

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
