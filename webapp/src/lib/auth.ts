import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db/index';

function isEmailAllowed(email: string): boolean {
  const allowed = (process.env.ALLOWED_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length === 0) return false;
  return allowed.includes(email.toLowerCase());
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'mysql' }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!isEmailAllowed(user.email)) {
            throw new APIError('FORBIDDEN', {
              message: "Cette adresse email n'est pas autorisée à créer un compte.",
            });
          }
          return { data: user };
        },
      },
    },
  },
  plugins: [nextCookies()],
});
