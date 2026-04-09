import { z } from "zod";

export const userRoleSchema = z.enum(["admin", "viewer"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const userPublicSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: userRoleSchema,
});
export type UserPublic = z.infer<typeof userPublicSchema>;

export const loginResponseSchema = z.object({
  token: z.string().min(1),
  user: userPublicSchema,
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
