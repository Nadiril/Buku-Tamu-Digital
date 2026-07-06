import { randomBytes } from "crypto";

export function generateToken() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = randomBytes(16);
  let result = "qr-";
  for (let i = 0; i < 16; i++) result += chars[bytes[i] % chars.length];
  return result;
}
