import { z } from "zod";
import { BaseComponentPropsSchema } from "../../schemas/base.ts";

// User schema (matching ProfileCard)
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  user_metadata: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    displayName: z.string().optional(),
    avatar_url: z.string().url().optional(),
    theme: z.string().optional(),
  }).optional(),
  // Database fields (from users table)
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  display_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  theme_id: z.string().optional(),
  role: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Profile update data schema
export const ProfileUpdateDataSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  theme: z.string().optional(),
});

// Profile update result schema
export const ProfileUpdateResultSchema = z.object({
  success: z.boolean().optional(),
  error: z.string().optional(),
});

// Profile change event schema (for real-time sync)
export const ProfileChangeEventSchema = z.object({
  type: z.enum(["theme", "avatar", "displayName", "profile", "signOut"]),
  data: z.record(z.any()),
  timestamp: z.number(),
  source: z.string(),
  userId: z.string(),
});

// ProfileModal props schema
export const ProfileModalPropsSchema = BaseComponentPropsSchema.extend({
  user: UserSchema.nullable(),
  isOpen: z.boolean(),
  onClose: z.function().returns(z.void()),
  isLoading: z.boolean().optional().default(false),
  error: z.string().nullable().optional(),
  success: z.string().nullable().optional(),
  isMobile: z.boolean().optional().default(false),
  onUpdateProfile: z.function()
    .args(ProfileUpdateDataSchema)
    .returns(z.promise(ProfileUpdateResultSchema))
    .optional(),
  onUploadAvatar: z.function()
    .args(z.instanceof(File))
    .returns(z.promise(z.void()))
    .optional(),
  onSignOut: z.function().returns(z.void()).optional(),
  onChangePassword: z.function()
    .args(z.string(), z.string())
    .returns(z.promise(z.void()))
    .optional(),
  // Real-time sync options
  enableRealTimeSync: z.boolean().optional().default(false),
  syncSource: z.string().optional(),
  isPopupMode: z.boolean().optional().default(false),
  parentOrigin: z.string().optional(),
  onPopupClose: z.function().returns(z.void()).optional(),
  onProfileChange: z.function()
    .args(ProfileChangeEventSchema)
    .returns(z.void())
    .optional(),
});

// Export inferred types
export type User = z.infer<typeof UserSchema>;
export type ProfileUpdateData = z.infer<typeof ProfileUpdateDataSchema>;
export type ProfileUpdateResult = z.infer<typeof ProfileUpdateResultSchema>;
export type ProfileChangeEvent = z.infer<typeof ProfileChangeEventSchema>;
export type ProfileModalProps = z.infer<typeof ProfileModalPropsSchema>;
