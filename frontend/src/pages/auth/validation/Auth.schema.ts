import * as z from "zod";

export const LoginSchema = z.object({
  email: z
    .email()
    .nonempty("Email is required")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),
  password: z
    .string()
    .min(8, "password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one number, and one special character",
    )
    .nonempty("Password is required"),
});

export type LoginInputSchema = z.infer<typeof LoginSchema>;
