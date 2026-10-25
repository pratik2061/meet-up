import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, Lock, Save, Upload, UserCheck, X } from "lucide-react";
import toast from "react-hot-toast";
import type { UpdateProfilePayload, UserProfile } from "../types/profile.types";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSubmit: (data: UpdateProfilePayload) => void;
  isPending: boolean;
}

export const ProfileEditModal = ({
  isOpen,
  onClose,
  user,
  onSubmit,
  isPending,
}: ProfileEditModalProps) => {
  const [fullName, setFullName] = useState(user.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [address, setAddress] = useState(user.address || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{
    fullName?: string;
    phoneNumber?: string;
    address?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      setFullName(user.fullName || "");
      setPhoneNumber(user.phoneNumber || "");
      setAddress(user.address || "");
      setAvatarFile(null);
      setAvatarPreview(user.avatarUrl || null);
      setAvatarError(null);
      setErrors({});
    }
  }, [isOpen, user]);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
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

    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (avatarPreview && avatarPreview.startsWith("blob:")) {
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

  const validate = () => {
    const newErrors: {
      fullName?: string;
      phoneNumber?: string;
      address?: string;
    } = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (!/^[A-Za-z ]+$/.test(fullName.trim())) {
      newErrors.fullName = "Full name can only contain letters and spaces";
    } else if (fullName.trim().length < 2 || fullName.trim().length > 50) {
      newErrors.fullName = "Full name must be between 2 and 50 characters";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    }

    if (!address.trim()) {
      newErrors.address = "Address is required";
    } else if (address.trim().length < 5 || address.trim().length > 50) {
      newErrors.address = "Address must be between 5 and 50 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      avatar: avatarFile,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <UserCheck className="size-5 text-primary" />
            <span>Edit Profile</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update your personal contact details and display information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
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
          {/* Full Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="fullName" className="text-xs font-semibold">
                Full Name
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {fullName.length}/50
              </span>
            </div>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              placeholder="e.g. Alex Morgan"
              className={`h-9 ${errors.fullName ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
              disabled={isPending}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName}</p>
            )}
          </div>

          {/* Email (Read-Only) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
                Email Address
              </Label>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Lock className="size-2.5" /> Read-only
              </span>
            </div>
            <Input
              id="email"
              value={user.email || ""}
              disabled
              className="h-9 bg-muted/50 text-muted-foreground cursor-not-allowed text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Contact an administrator to change your associated email account.
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber" className="text-xs font-semibold">
              Phone Number (10 digits)
            </Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
              }}
              placeholder="e.g. 9812345678"
              maxLength={10}
              className={`h-9 font-mono ${errors.phoneNumber ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
              disabled={isPending}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-destructive">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="address" className="text-xs font-semibold">
                Address / Location
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {address.length}/50
              </span>
            </div>
            <Input
              id="address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
              }}
              placeholder="e.g. San Francisco, CA"
              className={`h-9 ${errors.address ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
              disabled={isPending}
            />
            {errors.address && (
              <p className="text-xs text-destructive">{errors.address}</p>
            )}
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="text-xs h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="gap-2 text-xs h-9 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
