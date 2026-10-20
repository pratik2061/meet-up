import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one number, and one special character",
    ),
});

export type LoginInputSchema = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

export type ForgotPasswordInputSchema = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one number, and one special character",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInputSchema = z.infer<typeof ResetPasswordSchema>;

export const SignupSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Full name must be at least 2 characters long")
      .max(50, "Full name must be at most 50 characters long")
      .regex(/^[A-Za-z ]+$/, "Full name can only contain letters and spaces"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format")
      .min(5, "Email must be between 5 and 150 characters long")
      .max(150, "Email must be between 5 and 150 characters long"),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    address: z
      .string()
      .min(1, "Address is required")
      .min(5, "Address must be between 5 and 50 characters long")
      .max(50, "Address must be between 5 and 50 characters long")
      .regex(
        /^[A-Za-z0-9\-, ]+$/,
        "Address can only contain letters, numbers, hyphen, and spaces",
      ),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be between 8 and 50 characters long")
      .max(50, "Password must be between 8 and 50 characters long")
      .regex(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/,
        "Password must contain at least one uppercase letter, one number, and one special character",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInputSchema = z.infer<typeof SignupSchema>;
