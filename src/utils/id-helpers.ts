import { validate as validateUUID } from "uuid";

/**
 * Validates if a string is a valid UUID
 * @param id - The ID to validate
 * @returns boolean indicating if the ID is a valid UUID
 */
export function isValidUUID(id: string): boolean {
  return validateUUID(id);
}

/**
 * Safely converts a string to a UUID if possible
 * @param id - The ID to convert
 * @returns The original ID if it's already a valid UUID, or null if not
 */
export function ensureUUID(id: string): string | null {
  if (isValidUUID(id)) {
    return id;
  }

  // For non-UUID IDs, return null to indicate invalid UUID
  console.warn(
    `Invalid UUID format: ${id}. Cannot use in UUID database fields.`,
  );
  return null;
}
