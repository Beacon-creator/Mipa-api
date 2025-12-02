import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { AuthPayload } from "../modules/auth/auth.types";

const JWT_SECRET: Secret = (process.env.JWT_SECRET ?? "dev-secret") as Secret;

// just keep as string; don't over-type it
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

export function signAuthToken(payload: AuthPayload): string {
  const options: SignOptions = {
    
    expiresIn: JWT_EXPIRES_IN as any,
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyAuthToken(token: string): AuthPayload {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
}
