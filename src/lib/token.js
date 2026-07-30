import { randomUUID } from "crypto";

export function generateToken() {
  return "qr-" + randomUUID().replace(/-/g, "");
}
