import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Camera, Eye, EyeClosed, Upload, X } from "lucide-react";
import { CgGoogle } from "react-icons/cg";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  SignupSchema,
  type SignupInputSchema,
} from "../validation/Auth.schema";
import type { RegisterRequestPayload } from "../services/register";
import { initiateGoogleAuth } from "../services/oauth";

interface SignupFormProps {
  isPending: boolean;
  signupMutate: (data: RegisterRequestPayload) => void;
}

export const SignupForm = ({ isPending, signupMutate }: SignupFormProps) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleFileChange = (file?: File) => {
    if (!file) return;
    setAvatarError(null);

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      const err = "Only JPG, PNG, WEBP, or GIF are allowed";
      setAvatarError(err);
      toast.error(err);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const err = "Avatar must be less than 5MB";
      setAvatarError(err);
      toast.error(err);
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const { control, handleSubmit } = useForm<SignupInputSchema>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: SignupInputSchema) => {
    signupMutate({
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      address: data.address,
      password: data.password,
      avatar: avatarFile,
    });
  };

  return (
    <div className="flex min-h-full w-full items-center justify-center">
      <div className="w-full max-w-lg rounded-2xl border border-gray-500/20 p-6 text-center shadow-sm sm:max-w-xl sm:p-8 lg:max-w-2xl lg:p-10">
        <h1 className="mb-2 text-xl font-bold sm:text-2xl md:text-3xl">
          Create Account
        </h1>

        <p className="mb-6 text-sm text-gray-900/80">
          Sign up to continue to <span className="text-primary font-semibold">MeetUp</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center justify-center pb-2">
            <div className="relative group">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex h-24 w-24 sm:h-28 sm:w-28 cursor-pointer items-center justify-center rounded-full border-2 border-dashed transition-all duration-200 overflow-hidden shadow-sm ${
                  isDragging
                    ? "border-primary bg-primary/10 ring-4 ring-primary/20 scale-105"
                    : avatarPreview
                      ? "border-primary/60 bg-transparent ring-2 ring-primary/20 hover:ring-primary/40"
                      : "border-gray-300 bg-gray-50/80 hover:border-primary hover:bg-primary/5"
                }`}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-2 text-center text-gray-500 group-hover:text-primary transition-colors">
                    <Camera className="h-7 w-7 mb-1 stroke-[1.75]" />
                    <span className="text-[11px] font-medium leading-tight">Add Photo</span>
                  </div>
                )}

                {/* Hover overlay when image is present */}
                {avatarPreview && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera className="h-6 w-6" />
                  </div>
                )}
              </div>

              {/* Remove button badge */}
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-transform active:scale-90 hover:cursor-pointer"
                  title="Remove avatar"
                  aria-label="Remove avatar"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Small upload badge icon on bottom right when no image */}
              {!avatarPreview && (
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md pointer-events-none">
                  <Upload className="h-3.5 w-3.5" />
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                handleFileChange(file);
              }}
            />

            <p className="mt-2 text-xs text-gray-500">
              Profile photo <span className="text-gray-400 font-normal">(optional, max 5MB)</span>
            </p>
            {avatarError && (
              <span className="mt-1 text-xs text-red-500 font-medium">
                {avatarError}
              </span>
            )}
          </div>
          <div className="space-y-4 w-full">
            {/* Full Name */}
            <Controller
              name="fullName"
              control={control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col items-start w-full">
                  <Input
                    {...field}
                    className={`w-full h-12 px-4 text-sm border rounded-md ${
                      fieldState.error ? "border-red-500" : ""
                    }`}
                    type="text"
                    placeholder="Full Name"
                  />
                  {fieldState.error && (
                    <span className="mt-1 text-xs text-red-500 text-left">
                      {fieldState.error.message}
                    </span>
                  )}
                </div>
              )}
            />

            {/* Email */}
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col items-start w-full">
                  <Input
                    {...field}
                    className={`w-full h-12 px-4 text-sm border rounded-md ${
                      fieldState.error ? "border-red-500" : ""
                    }`}
                    type="email"
                    placeholder="Email"
                  />
                  {fieldState.error && (
                    <span className="mt-1 text-xs text-red-500 text-left">
                      {fieldState.error.message}
                    </span>
                  )}
                </div>
              )}
            />

            {/* Phone Number & Address */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col items-start w-full">
                    <Input
                      {...field}
                      className={`w-full h-12 px-4 text-sm border rounded-md ${
                        fieldState.error ? "border-red-500" : ""
                      }`}
                      type="tel"
                      placeholder="Phone Number (10 digits)"
                    />
                    {fieldState.error && (
                      <span className="mt-1 text-xs text-red-500 text-left">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />

              <Controller
                name="address"
                control={control}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col items-start w-full">
                    <Input
                      {...field}
                      className={`w-full h-12 px-4 text-sm border rounded-md ${
                        fieldState.error ? "border-red-500" : ""
                      }`}
                      type="text"
                      placeholder="Address"
                    />
                    {fieldState.error && (
                      <span className="mt-1 text-xs text-red-500 text-left">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col items-start w-full">
                    <div className="relative w-full">
                      <Input
                        {...field}
                        className={`w-full h-12 px-4 pr-12 text-sm border rounded-md ${
                          fieldState.error ? "border-red-500" : ""
                        }`}
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-4 top-1/2 -translate-y-1/2 hover:cursor-pointer text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <Eye size={18} />
                        ) : (
                          <EyeClosed size={18} />
                        )}
                      </button>
                    </div>
                    {fieldState.error && (
                      <span className="mt-1 text-xs text-red-500 text-left">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col items-start w-full">
                    <div className="relative w-full">
                      <Input
                        {...field}
                        className={`w-full h-12 px-4 pr-12 text-sm border rounded-md ${
                          fieldState.error ? "border-red-500" : ""
                        }`}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                      />
                      <button
                        type="button"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        className="absolute right-4 top-1/2 -translate-y-1/2 hover:cursor-pointer text-gray-500"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <Eye size={18} />
                        ) : (
                          <EyeClosed size={18} />
                        )}
                      </button>
                    </div>
                    {fieldState.error && (
                      <span className="mt-1 text-xs text-red-500 text-left">
                        {fieldState.error.message}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 text-base font-semibold bg-primary/80 hover:cursor-pointer hover:bg-primary"
          >
            {isPending ? <Spinner /> : "Sign Up"}
          </Button>
        </form>

        <div className="pt-4 text-center sm:text-right">
          <span className="text-sm text-gray-600">Already have an account? </span>
          <Link
            to="/login"
            className="text-sm font-semibold text-blue-500 hover:cursor-pointer hover:text-primary hover:underline"
          >
            Sign In
          </Link>
        </div>

        <div className="relative py-4">
          <Separator />
          <label className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background text-sm text-muted-foreground">
            or continue with
          </label>
        </div>

        <div className="">
          <Button
            type="button"
            onClick={initiateGoogleAuth}
            variant="outline"
            className="h-12 w-full flex items-center justify-center gap-2 hover:cursor-pointer"
          >
            <CgGoogle />
            Google
          </Button>
        </div>
      </div>
    </div>
  );
};
