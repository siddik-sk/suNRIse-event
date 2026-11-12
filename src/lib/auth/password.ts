import bcrypt from "bcryptjs";

const ROUNDS = 12;
// Pre-computed dummy hash lets us spend the same CPU time for unknown emails.
const DUMMY_HASH = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/** Constant-ish-time comparison for non-existent accounts. */
export async function fakePasswordCheck(plain: string): Promise<false> {
  try {
    await bcrypt.compare(plain, DUMMY_HASH);
  } catch {
    /* ignore malformed dummy hash */
  }
  return false;
}
