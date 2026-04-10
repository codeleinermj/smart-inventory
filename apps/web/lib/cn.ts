/**
 * Tiny class-name joiner. We don't need clsx/tailwind-merge for this app —
 * three classnames joined, no conflict resolution, no conditional object API.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
