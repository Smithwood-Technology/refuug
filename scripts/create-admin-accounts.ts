import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {
  // List of states in the app
  const states = ['FL', 'GA', 'AL', 'MS', 'TN', 'NC', 'SC'];
  
  for (const state of states) {
    const username = `admin_${state.toLowerCase()}`;
    const password = `${state.toLowerCase()}123`;
    
    try {
      // Check if user already exists
      const [existingUser] = await db.select().from(users).where(eq(users.username, username));
      
      if (existingUser) {
        console.log(`User ${username} already exists, skipping...`);
        continue;
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Create the user
      const [newUser] = await db.insert(users).values({
        username,
        password: hashedPassword
      }).returning();
      
      console.log(`Created admin account for ${state}:`);
      console.log(`  Username: ${username}`);
      console.log(`  Password: ${password}`);
      console.log();
    } catch (error) {
      console.error(`Error creating user ${username}:`, error);
    }
  }
  
  console.log('Admin account creation complete!');
  process.exit(0);
}

main().catch(err => {
  console.error('Error creating admin accounts:', err);
  process.exit(1);
});
