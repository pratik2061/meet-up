import React, { useEffect, useState } from "react";
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
import { Loader2, Lock, Save, UserCheck } from "lucide-react";
import type { UserProfile } from "../types/profile.types";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSubmit: (data: {
    fullName: string;
    phoneNumber: string;
    address: string;
  }) => void;
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
      setErrors({});
    }
  }, [isOpen, user]);

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
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6">
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
