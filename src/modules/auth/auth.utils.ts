import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET ?? "dev-secret-change-me";


const JWT_EXPIRES_IN: SignOptions["expiresIn"] | undefined =
  process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"] | undefined;

export function signToken(userId: string) {
  const payload = { sub: userId };

  const options: SignOptions = {};

  if (JWT_EXPIRES_IN !== undefined) {
    options.expiresIn = JWT_EXPIRES_IN; // now type is string | number only
  }

  return jwt.sign(payload, JWT_SECRET, options);
}

export function generate4DigitCode() {
  return Math.floor(1000 + Math.random() * 9000).toString(); // "1234"
}
