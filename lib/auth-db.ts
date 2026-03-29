import { getDb } from './db';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string | null;
  email: string;
  email_verified: Date | null;
  password_hash: string | null;
  image: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Account {
  id: string;
  user_id: string;
  type: string;
  provider: string;
  provider_account_id: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

export interface Session {
  id: string;
  session_token: string;
  user_id: string;
  expires: Date;
}

// User operations
export async function getUserByEmail(email: string): Promise<User | null> {
  const db = getDb();
  const result = await db`SELECT * FROM users WHERE email = ${email}`;
  return (result[0] as User) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = getDb();
  const result = await db`SELECT * FROM users WHERE id = ${id}`;
  return (result[0] as User) || null;
}

export async function createUser(data: {
  name?: string;
  email: string;
  password?: string;
  image?: string;
}): Promise<User> {
  const db = getDb();
  const passwordHash = data.password ? await bcrypt.hash(data.password, 12) : null;

  const result = await db`
    INSERT INTO users (name, email, password_hash, image)
    VALUES (${data.name || null}, ${data.email}, ${passwordHash}, ${data.image || null})
    RETURNING *
  `;
  return result[0] as User;
}

export async function updateUser(id: string, data: Partial<User>): Promise<User | null> {
  const db = getDb();
  const result = await db`
    UPDATE users
    SET name = COALESCE(${data.name}, name),
        email = COALESCE(${data.email}, email),
        image = COALESCE(${data.image}, image),
        email_verified = COALESCE(${data.email_verified}, email_verified),
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return (result[0] as User) || null;
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  if (!user.password_hash) return false;
  return bcrypt.compare(password, user.password_hash);
}

// Account operations (for OAuth)
export async function getAccountByProvider(
  provider: string,
  providerAccountId: string
): Promise<Account | null> {
  const db = getDb();
  const result = await db`
    SELECT * FROM accounts
    WHERE provider = ${provider} AND provider_account_id = ${providerAccountId}
  `;
  return (result[0] as Account) || null;
}

export async function createAccount(data: Omit<Account, 'id'>): Promise<Account> {
  const db = getDb();
  const result = await db`
    INSERT INTO accounts (
      user_id, type, provider, provider_account_id,
      refresh_token, access_token, expires_at,
      token_type, scope, id_token, session_state
    ) VALUES (
      ${data.user_id}, ${data.type}, ${data.provider}, ${data.provider_account_id},
      ${data.refresh_token}, ${data.access_token}, ${data.expires_at},
      ${data.token_type}, ${data.scope}, ${data.id_token}, ${data.session_state}
    )
    RETURNING *
  `;
  return result[0] as Account;
}

// Session operations
export async function createSession(data: {
  sessionToken: string;
  userId: string;
  expires: Date;
}): Promise<Session> {
  const db = getDb();
  const result = await db`
    INSERT INTO sessions (session_token, user_id, expires)
    VALUES (${data.sessionToken}, ${data.userId}, ${data.expires})
    RETURNING *
  `;
  return result[0] as Session;
}

export async function getSessionAndUser(sessionToken: string): Promise<{ session: Session; user: User } | null> {
  const db = getDb();
  const result = await db`
    SELECT s.*, u.id as user_id, u.name, u.email, u.email_verified, u.image
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = ${sessionToken} AND s.expires > NOW()
  `;

  if (!result[0]) return null;

  const row = result[0] as Record<string, unknown>;
  return {
    session: {
      id: row.id as string,
      session_token: row.session_token as string,
      user_id: row.user_id as string,
      expires: row.expires as Date,
    },
    user: {
      id: row.user_id as string,
      name: row.name as string | null,
      email: row.email as string,
      email_verified: row.email_verified as Date | null,
      password_hash: null,
      image: row.image as string | null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  };
}

export async function deleteSession(sessionToken: string): Promise<void> {
  const db = getDb();
  await db`DELETE FROM sessions WHERE session_token = ${sessionToken}`;
}

export async function updateSession(sessionToken: string, expires: Date): Promise<Session | null> {
  const db = getDb();
  const result = await db`
    UPDATE sessions SET expires = ${expires}
    WHERE session_token = ${sessionToken}
    RETURNING *
  `;
  return (result[0] as Session) || null;
}

// Verification token operations (for magic links)
export async function createVerificationToken(data: {
  identifier: string;
  token: string;
  expires: Date;
}): Promise<{ identifier: string; token: string; expires: Date }> {
  const db = getDb();
  await db`
    INSERT INTO verification_tokens (identifier, token, expires)
    VALUES (${data.identifier}, ${data.token}, ${data.expires})
    ON CONFLICT (identifier, token) DO UPDATE SET expires = ${data.expires}
  `;
  return data;
}

export async function useVerificationToken(data: {
  identifier: string;
  token: string;
}): Promise<{ identifier: string; token: string; expires: Date } | null> {
  const db = getDb();
  const result = await db`
    DELETE FROM verification_tokens
    WHERE identifier = ${data.identifier} AND token = ${data.token}
    RETURNING *
  `;
  return (result[0] as { identifier: string; token: string; expires: Date }) || null;
}

// Trip membership operations
export async function getUserTrips(userId: string) {
  const db = getDb();
  const result = await db`
    SELECT t.*, tm.role, tm.joined_at
    FROM trips t
    LEFT JOIN trip_members tm ON t.id = tm.trip_id AND tm.user_id = ${userId}
    WHERE t.owner_id = ${userId} OR tm.user_id = ${userId}
    ORDER BY t.created_at DESC
  `;
  return result;
}

export async function addTripMember(tripId: string, userId: string, role: string = 'member') {
  const db = getDb();
  const result = await db`
    INSERT INTO trip_members (trip_id, user_id, role)
    VALUES (${tripId}, ${userId}, ${role})
    ON CONFLICT (trip_id, user_id) DO UPDATE SET role = ${role}
    RETURNING *
  `;
  return result[0];
}

export async function setTripOwner(tripId: string, userId: string) {
  const db = getDb();
  await db`UPDATE trips SET owner_id = ${userId} WHERE id = ${tripId}`;
}
