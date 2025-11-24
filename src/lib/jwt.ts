import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { AuthPayload } from "../modules/auth/auth.types";

// .env: JWT_SECRET, JWT_EXPIRES_IN="7d" (for example)
const JWT_SECRET: Secret = (process.env.JWT_SECRET ?? "dev-secret") as Secret;

// just keep as string; don't over-type it
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function signAuthToken(payload: AuthPayload): string {
  const options: SignOptions = {
    // jwt.SignOptions expects a specific union type; our env var is just string
    // so we assert here to keep TS happy under `exactOptionalPropertyTypes`
    expiresIn: JWT_EXPIRES_IN as any,
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyAuthToken(token: string): AuthPayload {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
}
