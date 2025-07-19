import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "../shared/schema";
import { env } from "@shared-utils";

// Use HTTP connection instead of WebSocket to avoid circular reference issues
const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });