import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("invalid email"),
  password: z.string().min(1, "password is required"),
});
