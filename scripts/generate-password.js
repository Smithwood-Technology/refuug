import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  // Generate a hash for 'urban123'
  const hash = await hashPassword('urban123');
  console.log('Hashed password:', hash);
}

main().catch(err => console.error(err));