import crypto from "crypto";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

export interface AuthTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  name?: string;
  role: string;
  type: "access" | "refresh";
}

export const ACCESS_TOKEN_EXPIRES_IN = "15m";
export const REFRESH_TOKEN_EXPIRES_IN = "7d";

function getRequiredEnv(name: string, fallback?: string) {
  const value = process.env[name] || fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function signToken(
  payload: Omit<AuthTokenPayload, "type">,
  secret: string,
  expiresIn: SignOptions["expiresIn"],
  type: "access" | "refresh"
) {
  const options: SignOptions = { expiresIn };
  return jwt.sign({ ...payload, type }, secret, options);
}

export function createAccessToken(payload: Omit<AuthTokenPayload, "type">) {
  return signToken(payload, getRequiredEnv("JWT_ACCESS_SECRET", process.env.NEXTAUTH_SECRET), ACCESS_TOKEN_EXPIRES_IN, "access");
}

export function createRefreshToken(payload: Omit<AuthTokenPayload, "type">) {
  return signToken(payload, getRequiredEnv("JWT_REFRESH_SECRET", process.env.NEXTAUTH_SECRET), REFRESH_TOKEN_EXPIRES_IN, "refresh");
}

function verifyToken(token: string, secret: string, expectedType: "access" | "refresh") {
  const decoded = jwt.verify(token, secret) as AuthTokenPayload;

  if (decoded.type !== expectedType) {
    throw new Error(`Invalid token type. Expected ${expectedType}.`);
  }

  return decoded;
}

export function verifyAccessToken(token: string) {
  return verifyToken(token, getRequiredEnv("JWT_ACCESS_SECRET", process.env.NEXTAUTH_SECRET), "access");
}

export function verifyRefreshToken(token: string) {
  return verifyToken(token, getRequiredEnv("JWT_REFRESH_SECRET", process.env.NEXTAUTH_SECRET), "refresh");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getTokenExpiryDate(decodedToken: JwtPayload) {
  if (!decodedToken.exp) {
    throw new Error("Token expiration is missing.");
  }

  return new Date(decodedToken.exp * 1000);
}

export function buildAuthPayload(user: { _id: { toString(): string }; email: string; name?: string; role?: string }) {
  return {
    sub: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role || "user",
  };
}
