import { z } from "zod";

// Postgres accepts any 128-bit UUID value, including deterministic seed IDs
// that do not encode RFC version/variant bits.
const POSTGRES_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const DbUuidSchema = z
  .string()
  .trim()
  .regex(POSTGRES_UUID_PATTERN, "Must be a valid uuid.");
